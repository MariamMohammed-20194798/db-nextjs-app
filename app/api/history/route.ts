import { NextResponse } from 'next/server';
import { supabase } from '@/app/utils/supabase';

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
    const { title, content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Calculate word count
    const wordCount = content.trim().split(/\s+/).length;

    // Insert into Supabase
    const { data, error } = await supabase
      .from('documents')
      .insert({
        title: title || 'Untitled Document',
        content,
        type: 'history',
        created_at: new Date().toISOString(),
        word_count: wordCount,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to save to history:', error);
      return NextResponse.json(
        { error: 'Failed to save document to history' },
        { status: 500 }
      );
    }

    return NextResponse.json({ document: data });
  } catch (error) {
    console.error('Error in history API:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
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

    // Delete from Supabase
    const { error } = await supabase.from('documents').delete().eq('id', id);

    if (error) {
      console.error('Error deleting document:', error);
      return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
