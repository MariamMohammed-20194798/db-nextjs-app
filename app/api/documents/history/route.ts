import { NextResponse } from 'next/server';

// Define a type for our document
interface HistoryDocument {
  id: string;
  title: string;
  content: string;
  date: string;
  wordCount: number;
}

// Maximum number of versions to keep
const MAX_VERSIONS = 9;
const sampleDocuments: HistoryDocument[] = [];

export async function GET() {
  try {
    return NextResponse.json({ documents: sampleDocuments });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    const newDocument: HistoryDocument = {
      id: String(Date.now()), // Generate a unique ID
      title,
      content,
      date: new Date().toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
      }),
      wordCount: content.split(/\s+/).length,
    };

    // Add the new document to the array
    sampleDocuments.push(newDocument);

    // Keep only the 9 most recent documents
    if (sampleDocuments.length > MAX_VERSIONS) {
      // Sort by ID (timestamp) descending, then remove the oldest ones
      sampleDocuments.sort((a, b) => parseInt(b.id) - parseInt(a.id));
      // Keep only the MAX_VERSIONS most recent documents
      sampleDocuments.splice(MAX_VERSIONS);
    }

    // In a real app, you would save this to a database
    // The client will handle saving to localStorage
    return NextResponse.json({
      success: true,
      document: newDocument,
    });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}

// Add a DELETE endpoint for removing documents
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    // In a real app, you would delete from a database
    // The client will handle removing from localStorage
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
