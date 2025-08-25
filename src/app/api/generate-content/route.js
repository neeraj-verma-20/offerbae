import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function POST(request) {
  try {
    const { category, city, area, expiryDate, keywords } = await request.json();

    // Check AI availability for title and description generation
    const client = await clientPromise;
    const db = client.db('offerwala');

    let settings = await db.collection('ai_settings').findOne({ type: 'image_generation' });

    // Default settings if none exist
    if (!settings) {
      settings = {
        titleGeneration: true,
        descriptionGeneration: true,
        dailyLimit: 100,
        monthlyLimit: 1000,
        currentDailyUsage: 0,
        currentMonthlyUsage: 0
      };
    }

    // Check if either title or description generation is enabled
    if (!settings.titleGeneration && !settings.descriptionGeneration) {
      return NextResponse.json(
        { error: 'AI content generation is currently disabled' },
        { status: 403 }
      );
    }

    // Check usage limits
    if (settings.currentDailyUsage >= settings.dailyLimit) {
      return NextResponse.json(
        { error: 'Daily AI usage limit reached' },
        { status: 429 }
      );
    }

    if (settings.currentMonthlyUsage >= settings.monthlyLimit) {
      return NextResponse.json(
        { error: 'Monthly AI usage limit reached' },
        { status: 429 }
      );
    }

    // Validate required fields
    if (!category || !city || !area || !expiryDate) {
      return NextResponse.json(
        { error: 'Missing required fields: category, city, area, expiryDate' },
        { status: 400 }
      );
    }

    // Check if either Gemini or Hugging Face API key is configured
    const hasGemini = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
    const hasHuggingFace = process.env.HUGGINGFACE_API_KEY;

    if (!hasGemini && !hasHuggingFace) {
      return NextResponse.json(
        { error: 'No AI API key configured. Please add GEMINI_API_KEY or HUGGINGFACE_API_KEY to your .env.local file.' },
        { status: 500 }
      );
    }

    // Create the prompt for Gemini
    const prompt = `You are an AI assistant for OfferBae, a local offers discovery platform. Your job is to help shopkeepers create engaging marketing content for their offers.

Inputs you will receive:
Category: ${category}
City: ${city}
Area: ${area}
Expiry Date: ${expiryDate}
Keywords (optional): ${keywords || 'None'}

Your task:

Generate a catchy Offer Title. Maximum 7–8 words. It should highlight the offer and attract attention. Do not include city or area names unless they add marketing value. Avoid being too generic like "Special Discount".

Generate a clear Offer Description. Maximum 30 words (can be less). It must sound friendly and promotional. Highlight urgency such as limited time, hurry, or exclusive. Mention the key benefit or value for the customer. Avoid repeating the title.

Follow strict output rules. Do not explain, do not add extra text. Output in pure JSON format only.

Example Output:
{
"title": "Flat 50% Off on Trendy Shoes",
"description": "Grab the latest collection of stylish shoes at unbeatable prices. Hurry, offer valid till stocks last. Limited time deal – don't miss your chance to save big!"
}

Remember: Always respect the word limits. Always return valid JSON with "title" and "description". Never add comments, notes, or explanations outside JSON.`;

    let parsedContent;

    // Try Gemini first if available, otherwise use Hugging Face
    if (hasGemini) {
      // Call Gemini AI API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Gemini API Error:', errorData);
        return NextResponse.json(
          { error: 'Failed to generate content with Gemini AI' },
          { status: response.status }
        );
      }

      const data = await response.json();

      // Extract the generated content
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        console.error('Unexpected Gemini response format:', data);
        return NextResponse.json(
          { error: 'Unexpected response format from Gemini AI' },
          { status: 500 }
        );
      }

      const generatedText = data.candidates[0].content.parts[0].text;

      // Try to parse the JSON response from Gemini
      try {
        // Clean up the response by removing markdown code blocks if present
        const cleanedText = generatedText.replace(/```json\n?|\n?```/g, '').trim();
        parsedContent = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('Failed to parse Gemini response as JSON:', generatedText);
        return NextResponse.json(
          { error: 'Generated content is not in valid JSON format' },
          { status: 500 }
        );
      }
    } else {
      // Fallback to Hugging Face (placeholder - implement if needed)
      return NextResponse.json(
        { error: 'Hugging Face integration not implemented yet' },
        { status: 501 }
      );
    }


    // Validate the parsed content
    if (!parsedContent.title || !parsedContent.description) {
      return NextResponse.json(
        { error: 'Generated content missing required fields (title or description)' },
        { status: 500 }
      );
    }

    // Validate word counts
    const titleWords = parsedContent.title.trim().split(/\s+/).length;
    const descriptionWords = parsedContent.description.trim().split(/\s+/).filter(word => word.length > 0).length;

    if (titleWords > 8) {
      return NextResponse.json(
        { error: 'Generated title exceeds 8 words limit' },
        { status: 500 }
      );
    }

    if (descriptionWords > 30) {
      return NextResponse.json(
        { error: `Generated description has ${descriptionWords} words, expected 30 words or less` },
        { status: 500 }
      );
    }

    // Increment usage counter
    await db.collection('ai_settings').updateOne(
      { type: 'image_generation' },
      {
        $inc: {
          currentDailyUsage: 1,
          currentMonthlyUsage: 1
        },
        $set: { updatedAt: new Date() }
      },
      { upsert: true }
    );

    // Return only the fields that are enabled
    const result = { generatedAt: new Date().toISOString() };
    if (settings.titleGeneration) result.title = parsedContent.title;
    if (settings.descriptionGeneration) result.description = parsedContent.description;

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Internal server error while generating content' },
      { status: 500 }
    );
  }
}
