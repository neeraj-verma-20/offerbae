import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

// GET a single banner by ID
export async function GET(request, { params }) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 });
    }

    const client = await clientPromise;
    const db = client.db('dealsDB');
    const collection = db.collection('banners');

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    const banner = await collection.findOne({ _id: new ObjectId(id) });

    if (!banner) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(banner, { status: 200 });
  } catch (error) {
    console.error('Error fetching banner:', error);
    return NextResponse.json(
      { error: 'Failed to fetch banner', details: error.message },
      { status: 500 }
    );
  }
}

// PUT/UPDATE a banner by ID
export async function PUT(request, { params }) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 });
    }

    const client = await clientPromise;
    const db = client.db('dealsDB');
    const collection = db.collection('banners');

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    const data = await request.json();

    // Find and update the banner
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...data, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { error: 'Failed to update banner', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE a banner by ID
export async function DELETE(request, { params }) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 });
    }

    const client = await clientPromise;
    const db = client.db('dealsDB');
    const collection = db.collection('banners');

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }
    
    const result = await collection.findOneAndDelete({ _id: new ObjectId(id) });

    if (!result) {
      return NextResponse.json(
        { error: 'Banner not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Banner deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { error: 'Failed to delete banner', details: error.message },
      { status: 500 }
    );
  }
}