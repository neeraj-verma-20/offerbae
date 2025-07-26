import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/authOptions';
import clientPromise from '../../../lib/mongodb';

// ✅ DELETE Offer by ID (POST)
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();

    // ✅ Validate input
    if (typeof id !== 'number') {
      return NextResponse.json({ success: false, error: 'Invalid or missing ID.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('dealsDB');
    const collection = db.collection('offers');

    // ✅ Delete offer
    const result = await collection.deleteOne({ id });
    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Offer not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ✅ GET Valid Offers (non-expired)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('dealsDB');
    const collection = db.collection('offers');

    const offers = await collection.find().sort({ createdAt: -1 }).toArray();
    return NextResponse.json(offers);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}
