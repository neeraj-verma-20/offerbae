import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/authOptions';
import clientPromise from '../../../../lib/mongodb';

// GET - Fetch AI settings
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('offerwala');
    
    let settings = await db.collection('ai_settings').findOne({ type: 'image_generation' });
    
    // Default settings if none exist
    if (!settings) {
      settings = {
        type: 'image_generation',
        imageGeneration: true,
        titleGeneration: true,
        descriptionGeneration: true,
        dailyLimit: 100,
        monthlyLimit: 1000,
        currentDailyUsage: 0,
        currentMonthlyUsage: 0,
        lastResetDate: new Date().toISOString().split('T')[0],
        lastMonthReset: new Date().toISOString().substring(0, 7), // YYYY-MM
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('ai_settings').insertOne(settings);
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching AI settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI settings' },
      { status: 500 }
    );
  }
}

// PUT - Update AI settings (Admin only)
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
    
    const { imageGeneration, titleGeneration, descriptionGeneration, dailyLimit, monthlyLimit, resetUsage } = await request.json();
    
    const client = await clientPromise;
    const db = client.db('offerwala');
    
    const updateData = {
      imageGeneration: Boolean(imageGeneration),
      titleGeneration: Boolean(titleGeneration),
      descriptionGeneration: Boolean(descriptionGeneration),
      dailyLimit: Number(dailyLimit) || 100,
      monthlyLimit: Number(monthlyLimit) || 1000,
      updatedAt: new Date()
    };
    
    // Reset usage if requested
    if (resetUsage) {
      updateData.currentDailyUsage = 0;
      updateData.currentMonthlyUsage = 0;
      updateData.lastResetDate = new Date().toISOString().split('T')[0];
      updateData.lastMonthReset = new Date().toISOString().substring(0, 7);
    }
    
    const result = await db.collection('ai_settings').updateOne(
      { type: 'image_generation' },
      { $set: updateData },
      { upsert: true }
    );
    
    return NextResponse.json({
      success: true,
      message: 'AI settings updated successfully',
      modifiedCount: result.modifiedCount
    });
    
  } catch (error) {
    console.error('Error updating AI settings:', error);
    return NextResponse.json(
      { error: 'Failed to update AI settings' },
      { status: 500 }
    );
  }
}