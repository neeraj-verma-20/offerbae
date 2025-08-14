import clientPromise from '../../../lib/mongodb';
import { NextResponse } from 'next/server';

// GET: list submissions
export async function GET(req) {
  try {
    const client = await clientPromise;
    const db = client.db('dealsDB');
    const collection = db.collection('offer_submissions');
    const submissions = await collection.find().sort({ createdAt: -1 }).toArray();
    const sanitized = submissions.map(s => ({ ...s, _id: s._id?.toString?.() || s._id }));
    return NextResponse.json(sanitized);
  } catch (error) {
    console.error('[API:/api/submissions][GET] Error:', error);
    return NextResponse.json({ success:false, error: error?.message || 'Internal server error' }, { status: 500 });
  }
}

// PUT: update status or approve (move into offers)
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, action } = body;
    if (!id || !action) return NextResponse.json({ success:false, error:'id and action required' }, { status: 400 });

    const client = await clientPromise;
    const db = client.db('dealsDB');
    const submissions = db.collection('offer_submissions');
    const offers = db.collection('offers');

    const { ObjectId } = await import('mongodb');
    const _id = new ObjectId(id);
    const doc = await submissions.findOne({ _id });
    if (!doc) return NextResponse.json({ success:false, error:'Submission not found' }, { status: 404 });

    if (action === 'approve') {
      const last = await offers.find().sort({ id: -1 }).limit(1).toArray();
      const newId = last.length > 0 ? last[0].id + 1 : 1;
      const { _id: sid, status, ...rest } = doc;
      const image = (typeof doc.image === 'string' && doc.image.trim() !== '')
        ? doc.image
        : ((typeof doc.imageUrl === 'string' && doc.imageUrl.trim() !== '') ? doc.imageUrl : '');
      const toInsert = { ...rest, image, id: newId, createdAt: new Date().toISOString() };
      await offers.insertOne(toInsert);
      await submissions.updateOne({ _id }, { $set: { status: 'approved', updatedAt: new Date().toISOString() } });
      return NextResponse.json({ success:true, approved:true });
    }

    if (action === 'reject') {
      await submissions.updateOne({ _id }, { $set: { status: 'rejected', updatedAt: new Date().toISOString() } });
      return NextResponse.json({ success:true, rejected:true });
    }

    return NextResponse.json({ success:false, error:'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('[API:/api/submissions][PUT] Error:', error);
    return NextResponse.json({ success:false, error: error?.message || 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Clear all submissions
export async function DELETE() {
  try {
    const client = await clientPromise;
    const db = client.db('dealsDB');
    const collection = db.collection('offer_submissions');

    const result = await collection.deleteMany({});

    return NextResponse.json({ 
      success: true, 
      deletedCount: result.deletedCount,
      message: `Successfully cleared ${result.deletedCount} submissions`
    });
  } catch (error) {
    console.error('[API:/api/submissions][DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

