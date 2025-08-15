import clientPromise from '../../../lib/mongodb';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";

// ✅ GET: Fetch locations (admin sees all, public sees only enabled)
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db('dealsDB');
    const collection = db.collection('locations');

    // Check if this is an admin request
    const session = await getServerSession(authOptions);
    const isAdmin = !!session;

    let query = {};
    if (!isAdmin) {
      // Public users only see enabled locations (or locations without status field)
      query = {
        $or: [
          { status: 'enabled' },
          { status: { $exists: false } } // Include locations without status (legacy)
        ]
      };
    }

    const locations = await collection.find(query).sort({ city: 1 }).toArray();
    return NextResponse.json(locations);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ✅ POST: Create new location
export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { city, areas } = body;

    if (!city || !areas || !Array.isArray(areas)) {
      return NextResponse.json(
        { success: false, error: "City and areas array are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("dealsDB");
    const collection = db.collection("locations");

    const newLocation = {
      city: city.trim(),
      areas: areas.map(area => area.trim()).filter(area => area),
      createdAt: new Date().toISOString()
    };

    const result = await collection.insertOne(newLocation);
    return NextResponse.json({ success: true, insertedId: result.insertedId });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ✅ PUT: Update existing location
export async function PUT(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { city, areas } = body;

    if (!city || !areas || !Array.isArray(areas)) {
      return NextResponse.json(
        { success: false, error: "City and areas array are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("dealsDB");
    const collection = db.collection("locations");

    const result = await collection.updateOne(
      { city: city.trim() },
      { 
        $set: { 
          areas: areas.map(area => area.trim()).filter(area => area),
          updatedAt: new Date().toISOString()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Location not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, updated: result.modifiedCount === 1 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ✅ PATCH: Update location status (enable/disable)
export async function PATCH(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { city, status } = body;

    if (!city || !status || !['enabled', 'disabled'].includes(status)) {
      return NextResponse.json(
        { success: false, error: "City and valid status (enabled/disabled) are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("dealsDB");
    const collection = db.collection("locations");

    const result = await collection.updateOne(
      { city: city.trim() },
      { 
        $set: { 
          status: status,
          updatedAt: new Date().toISOString()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Location not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      updated: result.modifiedCount === 1,
      status: status 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ✅ DELETE: Delete location
export async function DELETE(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');

    if (!city) {
      return NextResponse.json(
        { success: false, error: "City parameter is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("dealsDB");
    const collection = db.collection("locations");

    const result = await collection.deleteOne({ city: city.trim() });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Location not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, deleted: result.deletedCount === 1 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 