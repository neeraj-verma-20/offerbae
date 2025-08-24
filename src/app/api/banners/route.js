import { NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

// GET all banners
export async function GET() {
  try {
    // Check if MongoDB URI exists
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MONGODB_URI environment variable is not set' },
        { status: 500 }
      );
    }

    const client = await clientPromise;
    const db = client.db('dealsDB');
    const collection = db.collection('banners');

    // Get all active banners, sorted by order
    const banners = await collection.find({ active: true }).sort({ order: 1 }).toArray();

    // If no banners exist, create some sample ones
    if (banners.length === 0) {
      const sampleBanners = [
        {
          title: 'Welcome to OfferBae',
          description: 'Discover amazing deals and offers',
          imageUrl: 'https://via.placeholder.com/800x300/4F46E5/FFFFFF?text=Welcome+to+OfferBae',
          link: '#',
          active: true,
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          title: 'Best Deals Today',
          description: 'Don\'t miss out on today\'s hottest deals',
          imageUrl: 'https://via.placeholder.com/800x300/10B981/FFFFFF?text=Best+Deals+Today',
          link: '#',
          active: true,
          order: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      await collection.insertMany(sampleBanners);
      return NextResponse.json(sampleBanners, { status: 200 });
    }

    return NextResponse.json(banners, { status: 200 });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banners', details: error.message },
      { status: 500 }
    );
  }
}

// POST a new banner
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
    const collection = db.collection('banners');

    // Check if request contains FormData (file upload) or JSON
    const contentType = request.headers.get('content-type');
    let data = {};
    let imageUrl = '';

    if (contentType && contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();

      const image = formData.get('image');
      const title = formData.get('title') || '';
      const description = formData.get('description') || '';
      const link = formData.get('link') || '';
      const openInNewTab = formData.get('openInNewTab') === 'true';
      const active = formData.get('active') === 'true';
      const order = parseInt(formData.get('order') || '0', 10);



      if (!image) {
        return NextResponse.json(
          { error: 'Image is required' },
          { status: 400 }
        );
      }

      try {
        // Convert image to base64 for Cloudinary upload
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = `data:${image.type};base64,${buffer.toString('base64')}`;

        // Upload to Cloudinary using existing API
        const uploadResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/upload-banner-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: base64Image }),
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image to Cloudinary');
        }

        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult.imageUrl;
      } catch (fileError) {
        console.error('Cloudinary upload error:', fileError);
        return NextResponse.json(
          { error: 'Failed to upload image to Cloudinary', details: fileError.message },
          { status: 500 }
        );
      }

      // Calculate order if not provided
      const finalOrder = order || (await collection.countDocuments()) + 1;

      data = {
        title,
        description,
        imageUrl,
        link,
        openInNewTab,
        active,
        order: finalOrder
      };
    } else {
      // Handle JSON data (existing functionality)
      data = await request.json();

      // Validate required fields
      if (!data.imageUrl) {
        return NextResponse.json(
          { error: 'Image URL is required' },
          { status: 400 }
        );
      }
    }

    // Create new banner with timestamp
    const newBanner = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await collection.insertOne(newBanner);

    return NextResponse.json({ ...newBanner, _id: result.insertedId.toString() }, { status: 201 });
  } catch (error) {
    console.error('Error creating banner:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to create banner', details: error.message },
      { status: 500 }
    );
  }
}