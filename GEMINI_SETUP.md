# 🤖 Gemini AI Integration Setup Guide

This guide will help you set up the Gemini AI integration for your OfferBae platform.

## 📋 What's Been Added

✅ **Environment Configuration**: Added `GEMINI_API_KEY` to `.env.local`  
✅ **API Route**: Created `/api/generate-content/route.js` for Gemini integration  
✅ **UI Integration**: Updated offer submission page with AI generation buttons  
✅ **Error Handling**: Added proper loading states and error messages  
✅ **Content Validation**: Ensures 30 words or less for descriptions and max 8 words for titles

## 🚀 Setup Instructions

### Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### Step 2: Configure Environment Variables

1. Open your `.env.local` file
2. Replace `your_gemini_api_key_here` with your actual API key:

```bash
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### Step 3: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the offer submission page: `http://localhost:3000/offer-submission`

3. Fill in the required fields:
   - Category (select any)
   - City (select from dropdown)
   - Area (select from dropdown)  
   - Expiry Date (pick a future date)
   - Keywords (optional, but helps with better generation)

4. Click any of the AI generation buttons:
   - 🤖 **Generate Title & Description** (generates both)
   - 🤖 **Generate Title** (generates title only)
   - 🤖 **Generate Description** (generates description only)

## ✨ Features

### AI Content Generation
- **Catchy Titles**: 7-8 words max, category-specific, attention-grabbing
- **Compelling Descriptions**: 30 words or less with urgency and promotional language
- **Keyword Integration**: Uses optional keywords to enhance content
- **Smart Validation**: Ensures content meets OfferBae's specifications

### User Experience
- **Loading States**: Shows spinning indicators while generating
- **Error Handling**: Clear error messages with helpful guidance
- **Validation**: Prevents generation without required fields
- **Real-time Feedback**: Word count tracking for descriptions

## 🔧 Technical Details

### API Endpoint
- **URL**: `/api/generate-content`
- **Method**: POST
- **Input**: `{ category, city, area, expiryDate, keywords? }`
- **Output**: `{ title, description, generatedAt }`

### Content Specifications
- **Titles**: Maximum 7-8 words, no city/area names unless valuable
- **Descriptions**: 30 words or less with urgency and benefits
- **JSON Format**: Pure JSON output as required by OfferBae standards

## 🎯 Usage Tips

1. **Fill Required Fields First**: The AI needs category, city, area, and expiry date to generate relevant content
2. **Use Keywords**: Add relevant keywords like "discount", "premium", "fresh" for better suggestions
3. **Try Different Buttons**: Use individual buttons to regenerate just title or description if needed
4. **Review Generated Content**: Always review and edit the generated content as needed

## 🐛 Troubleshooting

### "API key not configured" Error
- Check that your `GEMINI_API_KEY` is set in `.env.local`
- Restart your development server after adding the key
- Ensure the key is valid and active

### "Please fill required fields" Error
- Make sure Category, City, Area, and Expiry Date are all selected
- Check that the location dropdowns have loaded properly

### Generation Fails
- Check your internet connection
- Verify your Gemini API key has quota remaining
- Check the browser console for detailed error messages

## 💡 Next Steps

The Gemini AI integration is now ready! Your shopkeepers can:
- Get AI-generated titles and descriptions instantly
- Save time creating compelling offer content
- Ensure consistent, professional marketing copy
- Focus more on their business while AI handles the copywriting

Happy generating! 🎉 | Test
