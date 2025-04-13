import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
const pdf = require('pdf-parse');
import * as mammoth from 'mammoth';
import * as xlsx from 'xlsx';

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

    let content = '';

    switch (fileExtension) {
      case 'txt':
        content = buffer.toString('utf-8');
        break;

      case 'pdf':
        try {
          const pdfData = await pdf(buffer);
          content = pdfData.text || '';
          if (!content.trim()) {
            content = 'No text content could be extracted from this PDF.';
          }
        } catch (error) {
          console.error('PDF parsing error:', error);
          return NextResponse.json(
            { error: 'Failed to parse PDF file' },
            { status: 500 }
          );
        }
        break;

      case 'docx':
      case 'doc':
        try {
          const result = await mammoth.extractRawText({ buffer });
          content = result.value;
        } catch (error) {
          console.error('Document parsing error:', error);
          return NextResponse.json(
            { error: 'Failed to parse Word document' },
            { status: 500 }
          );
        }
        break;

      case 'csv':
      case 'xlsx':
        try {
          const workbook = xlsx.read(buffer, { type: 'buffer' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

          content = data.map((row: any) => row.join(',')).join('\n');
        } catch (error) {
          console.error('Spreadsheet parsing error:', error);
          return NextResponse.json(
            { error: 'Failed to parse spreadsheet file' },
            { status: 500 }
          );
        }
        break;

      default:
        return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    //return content;

    return NextResponse.json({ content });
  } catch (error) {
    console.error('File processing error:', error);
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
  }
}
