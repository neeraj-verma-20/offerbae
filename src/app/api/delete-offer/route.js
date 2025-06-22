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
    console.error('❌ Error deleting offer:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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

    const now = new Date();

    // ✅ Fetch only non-expired offers
    const offers = await collection
      .find({
        $or: [
          { expiryDate: { $exists: false } },
          { expiryDate: { $gt: now.toISOString() } },
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(offers);
  } catch (error) {
    console.error('❌ Error fetching offers:', error);
    return NextResponse.json([], { status: 500 });
  }
}
