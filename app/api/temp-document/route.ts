import { NextResponse } from 'next/server';
import { supabase } from '@/app/utils/supabase';

export async function POST(req: Request) {
  try {
    const { title, content, type } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Calculate word count
    const wordCount = content.trim().split(/\s+/).length;

    // Insert into Supabase
    const { data, error } = await supabase
      .from('temp_documents')
      .insert({
        title: title || 'Untitled Document',
        content,
        type: type || 'document',
        created_at: new Date().toISOString(),
        word_count: wordCount,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to save temporary document:', error);
      return NextResponse.json(
        { error: 'Failed to save temporary document' },
        { status: 500 }
      );
    }

    return NextResponse.json({ document: data });
  } catch (error) {
    console.error('Error in temp-document API:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
