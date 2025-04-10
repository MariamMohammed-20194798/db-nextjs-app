import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
// Using require instead of import to avoid TypeScript errors
const pdfParse = require('pdf-parse');

// Default PDF parsing options with timeout and limits
const PDF_PARSE_OPTIONS = {
  // Limit processing time (milliseconds)
  timeout: 30000,
  // Maximum pages to parse
  max: 0, // 0 means parse all pages
  // Version of PDF
  version: 'v1.10.100',
};

// Since Next.js App Router handles file uploads natively with FormData API
export async function POST(req: Request) {
  // Create a temporary directory for file uploads
  const uploadDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Create a unique filename
  const fileName = `upload_${Date.now()}`;
  const filePath = path.join(uploadDir, fileName);
  let fileWithExt = '';

  try {
    // Get the file from the request
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log(`Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`);

    // Get file extension
    const fileExtension = path.extname(file.name).toLowerCase();
    fileWithExt = filePath + fileExtension;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Early validation for minimal PDF size
    if (fileExtension === '.pdf' && buffer.length < 100) {
      return NextResponse.json(
        {
          error: 'Invalid PDF file: The file appears to be corrupted or too small.',
        },
        { status: 400 }
      );
    }

    // Save file temporarily
    fs.writeFileSync(fileWithExt, buffer);

    // Extract content based on file type
    let content = '';

    if (fileExtension === '.pdf') {
      // Process PDF file
      try {
        console.log('Parsing PDF file...');

        // Validate PDF signature (simple check for PDF header)
        const pdfHeader = buffer.slice(0, 5).toString();
        if (pdfHeader !== '%PDF-') {
          throw new Error('Invalid PDF file: Missing PDF signature');
        }

        // Try to parse the PDF with options
        const pdfData = await pdfParse(buffer, PDF_PARSE_OPTIONS);

        // Handle empty content case
        if (!pdfData || !pdfData.text) {
          return NextResponse.json({
            content: 'No text content could be extracted from this PDF.',
          });
        }

        content = pdfData.text;
        console.log(`PDF parsed, extracted ${content.length} characters`);
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);

        // Check if file is readable
        try {
          // Try alternative approach - read from filesystem
          const fileBuffer = fs.readFileSync(fileWithExt);
          if (fileBuffer.length > 0) {
            console.log('Attempting alternative parsing method...');

            // Return a user-friendly error
            return NextResponse.json(
              {
                error:
                  'This PDF file could not be parsed. It may be encrypted, damaged, or contain only images without text.',
                detail:
                  pdfError instanceof Error
                    ? pdfError.message
                    : 'Unknown PDF parsing error',
              },
              { status: 400 }
            );
          }
        } catch (fsError) {
          console.error('File system error:', fsError);
        }

        return NextResponse.json(
          {
            error:
              'Failed to process PDF file. The file may be corrupted or password-protected.',
            detail: pdfError instanceof Error ? pdfError.message : 'Unknown error',
          },
          { status: 400 }
        );
      }
    } else if (['.docx', '.doc'].includes(fileExtension)) {
      // For DOCX files, we would need additional libraries like mammoth.js
      return NextResponse.json(
        {
          error: 'DOCX/DOC extraction not implemented yet',
        },
        { status: 501 }
      );
    } else if (fileExtension === '.xlsx') {
      // For XLSX files, we would need libraries like xlsx
      return NextResponse.json(
        {
          error: 'XLSX extraction not implemented yet',
        },
        { status: 501 }
      );
    } else if (['.csv'].includes(fileExtension)) {
      // For CSV files, read as text
      content = buffer.toString('utf-8');
      console.log(`CSV parsed, extracted ${content.length} characters`);
    } else {
      // For unrecognized file types
      return NextResponse.json(
        {
          error: `Unsupported file type: ${fileExtension}`,
        },
        { status: 400 }
      );
    }

    // Return the content - handle empty content case
    console.log('Successfully extracted content, returning response');
    return NextResponse.json({
      content: content || 'No text content could be extracted from this file.',
    });
  } catch (error) {
    console.error('Error in extract-content API:', error);

    // Provide a more detailed error message
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to extract content';
    const errorStack = error instanceof Error ? error.stack : '';

    console.error('Error details:', errorMessage, errorStack);

    return NextResponse.json(
      {
        error: errorMessage,
        detail: 'Server encountered an error while processing your file.',
      },
      { status: 500 }
    );
  } finally {
    // Clean up temporary file
    try {
      if (fileWithExt && fs.existsSync(fileWithExt)) {
        fs.unlinkSync(fileWithExt);
      }
    } catch (err) {
      console.error('Error deleting temporary file:', err);
    }
  }
}
