import clientPromise from '../../../lib/mongodb';
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get filter parameters
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const status = searchParams.get('status');
    const includeApproved = searchParams.get('includeApproved') === 'true';
    const includeRejected = searchParams.get('includeRejected') === 'true';
    const includePending = searchParams.get('includePending') === 'true';

    const client = await clientPromise;
    const db = client.db('dealsDB');
    const collection = db.collection('offer_submissions');

    // Build query filter
    let query = {};

    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom + 'T00:00:00.000Z');
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo + 'T23:59:59.999Z');
      }
    }

    // Status filter - Always filter for approved only for unique downloads
    query.status = 'approved';

    console.log('Download query:', JSON.stringify(query, null, 2));

    const submissions = await collection.find(query).sort({ createdAt: -1 }).toArray();

    console.log(`Found ${submissions.length} submissions matching filters`);

    // Remove duplicates based on key fields (title, ownerName, phoneNumber, city, area)
    const uniqueSubmissions = [];
    const seenCombinations = new Set();

    submissions.forEach(submission => {
      // Create a unique key based on important fields
      const uniqueKey = `${submission.title?.toLowerCase().trim()}-${submission.ownerName?.toLowerCase().trim()}-${submission.phoneNumber?.trim()}-${submission.city?.toLowerCase().trim()}-${submission.area?.toLowerCase().trim()}`;
      
      if (!seenCombinations.has(uniqueKey)) {
        seenCombinations.add(uniqueKey);
        uniqueSubmissions.push(submission);
      }
    });

    console.log(`After removing duplicates: ${uniqueSubmissions.length} unique submissions`);

    const data = uniqueSubmissions.map(s => ({
      Title: s.title || '',
      Description: s.description || '',
      ImageURL: s.imageUrl || '',
      Category: s.category || '',
      OwnerName: s.ownerName || '',
      PhoneNumber: s.phoneNumber || '',
      City: s.city || '',
      Area: s.area || '',
      MapLink: s.mapLink || '',
      SocialLink: s.socialLink || '',
      ExpiryDate: s.expiryDate || '',
      Status: s.status || 'pending',
      SubmittedAt: s.submittedAt || s.createdAt || '',
      CreatedAt: s.createdAt ? new Date(s.createdAt).toLocaleString() : '',
    }));

    // Create workbook with better formatting
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Set column widths
    const colWidths = [
      { wch: 25 }, // Title
      { wch: 40 }, // Description
      { wch: 50 }, // ImageURL
      { wch: 20 }, // Category
      { wch: 15 }, // OwnerName
      { wch: 15 }, // PhoneNumber
      { wch: 15 }, // City
      { wch: 15 }, // Area
      { wch: 40 }, // MapLink
      { wch: 40 }, // SocialLink
      { wch: 12 }, // ExpiryDate
      { wch: 12 }, // Status
      { wch: 20 }, // SubmittedAt
      { wch: 20 }, // CreatedAt
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Submissions');
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // Create filename with filter info
    let filename = 'unique-approved-submissions';
    if (dateFrom) filename += `-from-${dateFrom}`;
    if (dateTo) filename += `-to-${dateTo}`;
    filename += `-${new Date().toISOString().split('T')[0]}.xlsx`;

    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('[API:/api/download-submissions][GET] Error:', error);
    return NextResponse.json({ success:false, error: error?.message || 'Internal server error' }, { status: 500 });
  }
}

