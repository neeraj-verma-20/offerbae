import clientPromise from '../../../lib/mongodb';
import { NextResponse } from 'next/server';

// Save a public submission into offer_submissions collection
export async function POST(req) {
  try {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db('dealsDB');
    const collection = db.collection('offer_submissions');

    const doc = {
      ...body,
      createdAt: new Date().toISOString(),
      status: body.status || 'pending',
    };

    const result = await collection.insertOne(doc);
    return NextResponse.json({ success: true, insertedId: result.insertedId.toString(), submissionId: result.insertedId.toString() });
  } catch (error) {
    console.error('[API:/api/submit-offer][POST] Error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Internal server error' }, { status: 500 });
  }
}

