import { NextResponse } from 'next/server';
import { supabase } from '@/app/utils/supabase';

export async function GET() {
  try {
    // Fetch documents from Supabase
    const { data: documents, error } = await supabase
      .from('documents')
      .select('id, title, type, created_at, content')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }

    // Also fetch temporary documents
    const { data: tempDocuments, error: tempError } = await supabase
      .from('temp_documents')
      .select('id, title, type, created_at, content')
      .order('created_at', { ascending: false });

    if (tempError) {
      console.error('Error fetching temp documents:', tempError);
      // Continue with regular documents only
    }

    // Combine both document types and calculate word count
    const allDocuments = [...(documents || []), ...(tempDocuments || [])].map((doc) => {
      // Calculate word count if content exists
      const wordCount = doc.content ? doc.content.trim().split(/\s+/).length : 0;

      return {
        ...doc,
        word_count: wordCount,
      };
    });

    return NextResponse.json({ documents: allDocuments });
  } catch (error) {
    console.error('Unexpected error in documents API:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
