import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('Request:', request);
    const formData = await request.formData();
    const file = formData.get('file') as File;
    console.log('File:', file);

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop() || '';

    // Only allow txt files
    if (fileExtension !== 'txt') {
      return NextResponse.json({ error: 'Only .txt files are allowed' }, { status: 400 });
    }

    let content = buffer.toString('utf-8');

    return NextResponse.json({ content });
  } catch (error) {
    console.error('File processing error:', error);
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
  }
}
