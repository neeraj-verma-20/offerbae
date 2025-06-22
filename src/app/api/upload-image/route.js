import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";

export async function POST(req) {
  // ✅ Authenticate the request
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // ✅ Get the uploaded file
  const formData = await req.formData();
  const file = formData.get('file');

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
  }

  // ✅ Convert to base64
  const buffer = Buffer.from(await file.arrayBuffer());

  // ✅ Upload to Cloudinary
  const response = await fetch(`https://api.cloudinary.com/v1_1/dn4dv5zlz/image/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      file: `data:${file.type};base64,${buffer.toString('base64')}`,
      upload_preset: 'offers_unsigned', // ✅ Use your actual unsigned preset name
      folder: 'offers/img' // ✅ Optional: specify your folder
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json({
      success: false,
      error: data.error?.message || 'Upload failed'
    }, { status: 500 });
  }

  // ✅ Return Cloudinary secure URL
  return NextResponse.json({ success: true, url: data.secure_url });
}
