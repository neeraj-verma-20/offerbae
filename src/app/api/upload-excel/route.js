import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import clientPromise from '../../../lib/mongodb';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      return NextResponse.json({ success: false, error: 'No data found in Excel file' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('dealsDB');
    const collection = db.collection('offers');

    // Get the next ID
    const lastOffer = await collection.find().sort({ id: -1 }).limit(1).toArray();
    let nextId = lastOffer.length > 0 ? lastOffer[0].id + 1 : 1;

    const offers = [];
    let successCount = 0;
    let errorCount = 0;

    for (const row of data) {
      try {
        // Validate required fields
        if (!row.Title || !row.Description || !row.Category || !row.City || !row.Area) {
          console.log('Skipping row due to missing required fields:', row);
          errorCount++;
          continue;
        }

        // Handle image URL or base64
        let imageUrl = row.ImageURL || '';
        if (row.ImageURL && row.ImageURL.startsWith('data:image')) {
          // Upload base64 image to Cloudinary
          try {
            const uploadResponse = await fetch('https://api.cloudinary.com/v1_1/dn4dv5zlz/image/upload', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                file: row.ImageURL,
                upload_preset: 'offers_unsigned',
                folder: 'offers/img'
              })
            });
            
            if (uploadResponse.ok) {
              const uploadResult = await uploadResponse.json();
              imageUrl = uploadResult.secure_url;
            }
          } catch (uploadError) {
            console.error('Failed to upload image to Cloudinary:', uploadError);
            imageUrl = '';
          }
        }

        const offer = {
          id: nextId++,
          title: row.Title.trim(),
          description: row.Description.trim(),
          image: imageUrl,
          category: row.Category.trim(),
          ownerName: row.OwnerName?.trim() || '',
          phoneNumber: row.PhoneNumber?.trim() || '',
          city: row.City.trim(),
          area: row.Area.trim(),
          mapLink: row.MapLink?.trim() || '',
          socialLink: row.SocialLink?.trim() || '',
          expiryDate: row.ExpiryDate || '',
          createdAt: new Date().toISOString()
        };

        await collection.insertOne(offer);
        offers.push(offer);
        successCount++;
      } catch (error) {
        console.error('Error processing row:', row, error);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      count: successCount,
      errors: errorCount,
      message: `Successfully uploaded ${successCount} offers${errorCount > 0 ? `, ${errorCount} errors` : ''}`
    });

  } catch (error) {
    console.error('Excel upload error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 