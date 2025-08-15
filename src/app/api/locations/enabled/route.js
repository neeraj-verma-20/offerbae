import clientPromise from '../../../../lib/mongodb';
import { NextResponse } from 'next/server';

// GET: Fetch only enabled locations (public endpoint)
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('dealsDB');
    const collection = db.collection('locations');

    // Only return enabled locations (or locations without status field for backward compatibility)
    const query = {
      $or: [
        { status: 'enabled' },
        { status: { $exists: false } } // Include locations without status (legacy)
      ]
    };

    const locations = await collection.find(query).sort({ city: 1 }).toArray();
    return NextResponse.json(locations);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
