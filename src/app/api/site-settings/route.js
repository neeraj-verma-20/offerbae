import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

// GET site settings
export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MONGODB_URI environment variable is not set' },
        { status: 500 }
      );
    }

    const client = await clientPromise;
    const db = client.db('dealsDB');
    const collection = db.collection('siteSettings');

    // Get site settings
    let settings = await collection.findOne({ _id: 'app_download_links' });

    // If no settings exist, create default ones
    if (!settings) {
      const defaultSettings = {
        _id: 'app_download_links',
        settings: {
          androidAppUrl: '',
          iosAppUrl: '',
          appStoreEnabled: false,
          playStoreEnabled: false,
          downloadButtonText: 'Download App',
          showDownloadButton: false,
          companyName: 'OfferBae',
          companyDescription: 'Discover exclusive offers from top malls and shops across India',
          socialLinks: {
            facebook: '',
            instagram: '',
            twitter: '',
            linkedin: ''
          },
          contactInfo: {
            email: 'hello@offerbae.com',
            phone: '+91 98765 43210',
            address: 'Indore, Madhya Pradesh, India'
          }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await collection.insertOne(defaultSettings);
      settings = defaultSettings;
    }

    return NextResponse.json(settings.settings, { status: 200 });
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch site settings', details: error.message },
      { status: 500 }
    );
  }
}

// POST/PUT update site settings
export async function POST(request) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MONGODB_URI environment variable is not set' },
        { status: 500 }
      );
    }

    const client = await clientPromise;
    const db = client.db('dealsDB');
    const collection = db.collection('siteSettings');

    const newSettings = await request.json();

    // Update or create site settings
    const result = await collection.updateOne(
      { _id: 'app_download_links' },
      {
        $set: {
          settings: newSettings,
          updatedAt: new Date().toISOString()
        },
        $setOnInsert: {
          _id: 'app_download_links',
          createdAt: new Date().toISOString()
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, settings: newSettings }, { status: 200 });
  } catch (error) {
    console.error('Error updating site settings:', error);
    return NextResponse.json(
      { error: 'Failed to update site settings', details: error.message },
      { status: 500 }
    );
  }
}