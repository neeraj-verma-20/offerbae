import clientPromise from '../../../lib/mongodb';
import { NextResponse } from 'next/server';

// ✅ POST: Create new offer
export async function POST(req) {
  try {
    const body = await req.json();

    // Basic validation (optional but helpful)
    if (!body || !body.title || !body.description) {
      return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('dealsDB');
    const collection = db.collection('offers');

    // Auto-generate unique ID
    const lastOffer = await collection.find().sort({ id: -1 }).limit(1).toArray();
    const newId = lastOffer.length > 0 ? lastOffer[0].id + 1 : 1;

    const newOffer = {
      ...body,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    const result = await collection.insertOne(newOffer);

    return NextResponse.json({ success: true, insertedId: result.insertedId });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ✅ GET: Fetch all offers (without filtering expiry)
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("dealsDB");
    const collection = db.collection("offers");

    const offers = await collection.find().sort({ createdAt: -1 }).toArray();
    return NextResponse.json(offers);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}
