import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function POST(request) {
  try {
    const { formData, style = 'realistic' } = await request.json();

    // Check AI availability first
    const client = await clientPromise;
    const db = client.db('offerwala');

    let settings = await db.collection('ai_settings').findOne({ type: 'image_generation' });

    if (!settings) {
      // Create default settings
      settings = {
        type: 'image_generation',
        enabled: true,
        dailyLimit: 100,
        monthlyLimit: 1000,
        currentDailyUsage: 0,
        currentMonthlyUsage: 0,
        lastResetDate: new Date().toISOString().split('T')[0],
        lastMonthReset: new Date().toISOString().substring(0, 7)
      };
      await db.collection('ai_settings').insertOne(settings);
    }

    // Check if AI generation is enabled
    if (!settings.enabled) {
      return NextResponse.json(
        { error: 'AI image generation is currently disabled by admin' },
        { status: 403 }
      );
    }

    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().substring(0, 7);

    // Reset counters if needed
    if (settings.lastResetDate !== today) {
      settings.currentDailyUsage = 0;
      settings.lastResetDate = today;
    }

    if (settings.lastMonthReset !== currentMonth) {
      settings.currentMonthlyUsage = 0;
      settings.lastMonthReset = currentMonth;
    }

    // Check limits
    if (settings.currentDailyUsage >= settings.dailyLimit) {
      return NextResponse.json(
        { error: `Daily limit of ${settings.dailyLimit} AI generations reached. Try again tomorrow.` },
        { status: 429 }
      );
    }

    if (settings.currentMonthlyUsage >= settings.monthlyLimit) {
      return NextResponse.json(
        { error: `Monthly limit of ${settings.monthlyLimit} AI generations reached. Try again next month.` },
        { status: 429 }
      );
    }

    if (!formData || !formData.title || !formData.description || !formData.category) {
      return NextResponse.json(
        { error: 'Title, description, and category are required' },
        { status: 400 }
      );
    }

    // Create a simple, clear prompt for business promotional images
    const createEnhancedPrompt = (data, selectedStyle) => {
      // Simple, focused prompt for clear business images
      let prompt = `Simple ${data.category.toLowerCase()} business promotional image. `;

      // Add basic product/service context
      if (data.category.toLowerCase().includes('food')) {
        prompt += 'Clean food photography, appetizing dish, restaurant quality. ';
      } else if (data.category.toLowerCase().includes('fashion') || data.category.toLowerCase().includes('clothing')) {
        prompt += 'Clean clothing display, fashion items, store layout. ';
      } else if (data.category.toLowerCase().includes('electronics')) {
        prompt += 'Modern electronics, gadgets, tech products, clean background. ';
      } else if (data.category.toLowerCase().includes('beauty') || data.category.toLowerCase().includes('salon')) {
        prompt += 'Beauty products, salon interior, wellness theme. ';
      } else if (data.category.toLowerCase().includes('fitness') || data.category.toLowerCase().includes('gym')) {
        prompt += 'Fitness equipment, gym interior, workout theme. ';
      } else if (data.category.toLowerCase().includes('cafe') || data.category.toLowerCase().includes('bakery')) {
        prompt += 'Coffee shop interior, baked goods, cozy atmosphere. ';
      } else {
        prompt += 'Clean business storefront, professional service, welcoming atmosphere. ';
      }

      // Add keywords for better context if provided
      if (data.keywords && data.keywords.trim()) {
        const keywords = data.keywords.toLowerCase().trim();
        prompt += `Focus on: ${keywords}. `;
      }

      // Add style-specific enhancements - simplified
      const styleEnhancements = {
        realistic: 'clean photography, bright lighting, professional quality',
        modern: 'minimalist, clean background, simple composition',
        vibrant: 'colorful, bright, cheerful atmosphere',
        professional: 'business-like, clean, organized appearance'
      };

      prompt += `${styleEnhancements[selectedStyle] || styleEnhancements.realistic}. `;

      // Keep it simple and clear
      prompt += 'High quality, clean image, no text, no people, simple composition, commercial photography style, square format.';

      return prompt;
    };

    const enhancedPrompt = createEnhancedPrompt(formData, style);

    // Hugging Face Inference API implementation
    let imageUrl;

    try {
      // Check if Hugging Face API key is configured
      if (!process.env.HUGGINGFACE_API_KEY) {
        console.warn('Hugging Face API key not configured, using placeholder image');
        const placeholderText = `${formData.category}: ${formData.title}`.substring(0, 30);
        imageUrl = `https://via.placeholder.com/500x500/4F46E5/FFFFFF?text=${encodeURIComponent(placeholderText)}`;
      } else {
        // Use Hugging Face's available Stable Diffusion model
        const hfResponse = await fetch(
          'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: enhancedPrompt,
              parameters: {
                negative_prompt: "text, words, letters, numbers, watermark, logo, signature, blurry, low quality, distorted, deformed, people, faces, hands, complex background, cluttered, messy, artistic effects, abstract, surreal",
                num_inference_steps: 15,
                guidance_scale: 6.0,
                width: 512,
                height: 512
              }
            }),
          }
        );

        if (!hfResponse.ok) {
          const errorText = await hfResponse.text();
          console.error('Hugging Face API Error:', errorText);

          // Try alternative models based on error type
          if (hfResponse.status === 503 || hfResponse.status === 404) {
            console.log('Primary model unavailable, trying alternatives...');

            // List of fallback models to try
            const fallbackModels = [
              'CompVis/stable-diffusion-v1-4',
              'runwayml/stable-diffusion-v1-5',
              'stabilityai/stable-diffusion-xl-base-1.0'
            ];

            let success = false;

            for (const model of fallbackModels) {
              try {
                console.log(`Trying model: ${model}`);
                const altResponse = await fetch(
                  `https://api-inference.huggingface.co/models/${model}`,
                  {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      inputs: enhancedPrompt,
                      parameters: {
                        negative_prompt: "text, words, letters, numbers, watermark, logo, signature, blurry, low quality, distorted, deformed, people, faces, hands, complex background, cluttered, messy, artistic effects, abstract, surreal",
                        num_inference_steps: 15,
                        guidance_scale: 6.0,
                        width: 512,
                        height: 512
                      }
                    }),
                  }
                );

                if (altResponse.ok) {
                  const imageBuffer = await altResponse.arrayBuffer();
                  const base64Image = Buffer.from(imageBuffer).toString('base64');
                  imageUrl = `data:image/png;base64,${base64Image}`;
                  success = true;
                  console.log(`Successfully generated image with model: ${model}`);
                  break;
                }
              } catch (modelError) {
                console.log(`Model ${model} failed:`, modelError.message);
                continue;
              }
            }

            if (!success) {
              throw new Error('All Hugging Face models unavailable');
            }
          } else {
            throw new Error(`Hugging Face API error: ${hfResponse.status} - ${errorText}`);
          }
        } else {
          // Convert the response to base64 data URL
          const imageBuffer = await hfResponse.arrayBuffer();
          const base64Image = Buffer.from(imageBuffer).toString('base64');
          imageUrl = `data:image/png;base64,${base64Image}`;
        }
      }
    } catch (hfError) {
      console.error('Hugging Face generation failed:', hfError);
      // Fallback to placeholder
      const placeholderText = `${formData.category}: ${formData.title}`.substring(0, 30);
      imageUrl = `https://via.placeholder.com/500x500/4F46E5/FFFFFF?text=${encodeURIComponent(placeholderText)}`;
    }

    // Update usage counters
    await db.collection('ai_settings').updateOne(
      { type: 'image_generation' },
      {
        $inc: {
          currentDailyUsage: 1,
          currentMonthlyUsage: 1
        },
        $set: {
          lastResetDate: today,
          lastMonthReset: currentMonth,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      imageUrl,
      enhancedPrompt,
      originalFormData: formData,
      style,
      usage: {
        dailyUsage: settings.currentDailyUsage + 1,
        dailyLimit: settings.dailyLimit,
        monthlyUsage: settings.currentMonthlyUsage + 1,
        monthlyLimit: settings.monthlyLimit
      },
      message: process.env.HUGGINGFACE_API_KEY ?
        'Image generated successfully using Hugging Face AI' :
        'Image generated using placeholder (configure HUGGINGFACE_API_KEY for AI generation)'
    });

  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image', details: error.message },
      { status: 500 }
    );
  }
}