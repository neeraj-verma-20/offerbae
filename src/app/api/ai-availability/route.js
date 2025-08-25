import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const feature = searchParams.get('feature') || 'image'; // image, title, description
    
    const client = await clientPromise;
    const db = client.db('offerwala');
    
    let settings = await db.collection('ai_settings').findOne({ type: 'image_generation' });
    
    // Default settings if none exist
    if (!settings) {
      settings = {
        imageGeneration: true,
        titleGeneration: true,
        descriptionGeneration: true,
        dailyLimit: 100,
        monthlyLimit: 1000,
        currentDailyUsage: 0,
        currentMonthlyUsage: 0,
        lastResetDate: new Date().toISOString().split('T')[0],
        lastMonthReset: new Date().toISOString().substring(0, 7)
      };
    }
    
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().substring(0, 7);
    
    // Reset daily usage if it's a new day
    if (settings.lastResetDate !== today) {
      await db.collection('ai_settings').updateOne(
        { type: 'image_generation' },
        { 
          $set: { 
            currentDailyUsage: 0, 
            lastResetDate: today 
          } 
        }
      );
      settings.currentDailyUsage = 0;
    }
    
    // Reset monthly usage if it's a new month
    if (settings.lastMonthReset !== currentMonth) {
      await db.collection('ai_settings').updateOne(
        { type: 'image_generation' },
        { 
          $set: { 
            currentMonthlyUsage: 0, 
            lastMonthReset: currentMonth 
          } 
        }
      );
      settings.currentMonthlyUsage = 0;
    }
    
    // Check feature-specific availability
    let featureEnabled = false;
    let featureName = '';
    
    switch (feature) {
      case 'image':
        featureEnabled = settings.imageGeneration ?? true;
        featureName = 'AI image generation';
        break;
      case 'title':
        featureEnabled = settings.titleGeneration ?? true;
        featureName = 'AI title generation';
        break;
      case 'description':
        featureEnabled = settings.descriptionGeneration ?? true;
        featureName = 'AI description generation';
        break;
      default:
        featureEnabled = settings.imageGeneration ?? true;
        featureName = 'AI image generation';
    }
    
    const available = featureEnabled && 
                     settings.currentDailyUsage < settings.dailyLimit && 
                     settings.currentMonthlyUsage < settings.monthlyLimit;
    
    return NextResponse.json({
      available,
      enabled: featureEnabled,
      dailyUsage: settings.currentDailyUsage,
      dailyLimit: settings.dailyLimit,
      monthlyUsage: settings.currentMonthlyUsage,
      monthlyLimit: settings.monthlyLimit,
      message: !available ? 
        (!featureEnabled ? `${featureName} is currently disabled` :
         settings.currentDailyUsage >= settings.dailyLimit ? 'Daily limit reached' :
         'Monthly limit reached') : `${featureName} available`
    });
    
  } catch (error) {
    console.error('Error checking AI availability:', error);
    return NextResponse.json(
      { error: 'Failed to check AI availability' },
      { status: 500 }
    );
  }
}