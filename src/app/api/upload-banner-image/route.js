import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: 'offerbae_banners', // Optional: specify a folder in Cloudinary
    });

    return NextResponse.json({ imageUrl: result.secure_url }, { status: 200 });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}