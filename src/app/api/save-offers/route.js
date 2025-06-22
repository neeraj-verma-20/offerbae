// app/api/save-offers/route.js
import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";

export async function POST(req) {
  console.log("✅ POST /api/save-offers hit!");

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  console.log("🧩 Session:", session?.user?.email);

  try {
    const body = await req.json();
    console.log("📦 Incoming data:", body);

    // ✅ Validate description existence and word count
    if (!body.description || typeof body.description !== "string") {
      return NextResponse.json(
        { success: false, error: "Description is required." },
        { status: 400 }
      );
    }

    const wordCount = body.description.trim().split(/\s+/).length;
    if (wordCount > 30) {
      return NextResponse.json(
        {
          success: false,
          error: "Description too long (max 30 words allowed).",
        },
        { status: 400 }
      );
    }

    if (!body.title || typeof body.title !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid or missing title." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("dealsDB");
    const collection = db.collection("offers");

    // 🔄 Update existing offer
    if (body.id !== undefined && body.id !== null) {
      const existing = await collection.findOne({ id: body.id });
      if (existing) {
        const { id, _id, ...updatableFields } = body;

        const result = await collection.updateOne(
          { id: body.id },
          { $set: { ...updatableFields, updatedAt: new Date().toISOString() } }
        );

        console.log("🛠️ Update result:", result);
        return NextResponse.json({
          success: true,
          updated: result.modifiedCount === 1,
        });
      }
    }

    // ➕ Insert new offer
    const last = await collection.find().sort({ id: -1 }).limit(1).toArray();
    const newId = last.length > 0 ? last[0].id + 1 : 1;

    const newOffer = {
      ...body,
      id: newId,
      createdAt: new Date().toISOString(),
      createdBy: "admin",
      city: body.city || "Indore",
    };

    const result = await collection.insertOne(newOffer);
    console.log("✅ New offer created:", newOffer);

    return NextResponse.json({ success: true, insertedId: result.insertedId });
  } catch (error) {
    console.error("❌ Error saving offer:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("dealsDB");
    const collection = db.collection("offers");

    const now = new Date().toISOString();

    // Optionally delete expired offers
    await collection.deleteMany({ expiryDate: { $lte: now } });

    const offers = await collection.find().sort({ createdAt: -1 }).toArray();
    console.log(`📤 Returned ${offers.length} offers`);

    return NextResponse.json(offers);
  } catch (error) {
    console.error("❌ Error fetching offers:", error);
    return NextResponse.json([], { status: 500 });
  }
}

