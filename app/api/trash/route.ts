import { NextResponse } from 'next/server';

// Define a type for our document
interface HistoryDocument {
  id: string;
  title: string;
  content: string;
  date: string;
  wordCount: number;
  trashedAt?: number; // Timestamp when document was trashed
}

// In a real app, this would be stored in a database
const trashedDocuments: Record<string, HistoryDocument> = {};

// Get all trashed documents
export async function GET() {
  try {
    // Clean up expired documents (older than 24 hours)
    const now = Date.now();
    const twentyFourHoursInMs = 24 * 60 * 60 * 1000;

    Object.keys(trashedDocuments).forEach((id) => {
      const doc = trashedDocuments[id];
      if (doc.trashedAt && now - doc.trashedAt > twentyFourHoursInMs) {
        delete trashedDocuments[id];
      }
    });

    return NextResponse.json({
      documents: Object.values(trashedDocuments),
    });
  } catch (error) {
    console.error('Error fetching trashed documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trashed documents' },
      { status: 500 }
    );
  }
}

// Add a document to trash
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { document } = body;

    if (!document || !document.id) {
      return NextResponse.json({ error: 'Document data is required' }, { status: 400 });
    }

    // Add trashedAt timestamp
    trashedDocuments[document.id] = {
      ...document,
      trashedAt: Date.now(),
    };

    return NextResponse.json({
      success: true,
      document: trashedDocuments[document.id],
    });
  } catch (error) {
    console.error('Error adding document to trash:', error);
    return NextResponse.json(
      { error: 'Failed to add document to trash' },
      { status: 500 }
    );
  }
}

// Restore document from trash
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    const document = trashedDocuments[id];
    if (!document) {
      return NextResponse.json({ error: 'Document not found in trash' }, { status: 404 });
    }

    // Return the document without the trashedAt property
    const { trashedAt, ...restoredDocument } = document;

    // Remove from trash
    delete trashedDocuments[id];

    return NextResponse.json({
      success: true,
      document: restoredDocument,
    });
  } catch (error) {
    console.error('Error restoring document:', error);
    return NextResponse.json({ error: 'Failed to restore document' }, { status: 500 });
  }
}

// Permanently delete document from trash
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    if (!trashedDocuments[id]) {
      return NextResponse.json({ error: 'Document not found in trash' }, { status: 404 });
    }

    delete trashedDocuments[id];

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error permanently deleting document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
