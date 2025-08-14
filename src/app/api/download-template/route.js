import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    // Sample data for the template
    const templateData = [
      {
        Title: "50% Off on Pizza",
        Description: "Get 50% discount on all pizzas this weekend",
        ImageURL: "https://example.com/pizza-image.jpg",
        Category: "Food & Beverages",
        OwnerName: "John Doe",
        PhoneNumber: "+91-9876543210",
        City: "Indore",
        Area: "Vijay Nagar",
        MapLink: "https://maps.google.com/...",
        SocialLink: "https://instagram.com/pizzashop",
        ExpiryDate: "2024-12-31"
      },
      {
        Title: "Free Haircut",
        Description: "Free haircut for new customers",
        ImageURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
        Category: "Beauty & Wellness",
        OwnerName: "Jane Smith",
        PhoneNumber: "+91-9876543211",
        City: "Bhopal",
        Area: "MP Nagar",
        MapLink: "https://maps.google.com/...",
        SocialLink: "https://facebook.com/salonsmith",
        ExpiryDate: "2024-11-30"
      }
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    const colWidths = [
      { wch: 20 }, // Title
      { wch: 30 }, // Description
      { wch: 40 }, // ImageURL
      { wch: 20 }, // Category
      { wch: 15 }, // OwnerName
      { wch: 15 }, // PhoneNumber
      { wch: 15 }, // City
      { wch: 15 }, // Area
      { wch: 40 }, // MapLink
      { wch: 40 }, // SocialLink
      { wch: 12 }  // ExpiryDate
    ];
    ws['!cols'] = colWidths;

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Template');

    // Generate the Excel file
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="offers-template.xlsx"',
      },
    });
  } catch (error) {
    console.error('Template download error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 