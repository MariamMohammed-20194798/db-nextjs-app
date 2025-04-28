import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabase } from '@/app/utils/supabase';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

// Helper function to get document content
async function getDocumentContent(documentId: string) {
  // Check if this is a temporary document from localStorage
  if (documentId.startsWith('temp-')) {
    try {
      // For temp documents, fetch from Supabase temp_documents
      const { data, error } = await supabase
        .from('temp_documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (error || !data) {
        console.error('Error getting temporary document:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting temporary document:', error);
      return null;
    }
  }

  // Fetch from Supabase documents
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (error) {
    console.error('Failed to fetch document:', error);
    return null;
  }

  return data;
}

export async function POST(req: Request) {
  try {
    const { message, documentId, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    // Fetch document content
    const document = await getDocumentContent(documentId);

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Prepare messages for OpenAI
    const systemMessage = {
      role: 'system',
      content: `You are a helpful assistant that answers questions based ONLY on the provided document. 
      The document content is enclosed in triple backticks below:
      
      \`\`\`
      ${document.content}
      \`\`\`
      
      If the answer cannot be found in the document, politely say that you don't have that information.
      Keep your answers concise and focused on the document content.
      Do not make up information or draw from knowledge outside of this document.`,
    };

    // Format conversation history
    const formattedHistory = history
      ? history.slice(0, -1).map((msg: { role: string; content: string }) => ({
          role: msg.role,
          content: msg.content,
        }))
      : [];

    // Add user's current message
    const userMessage = {
      role: 'user',
      content: message,
    };

    // Make the API call to OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [systemMessage, ...formattedHistory, userMessage],
      max_tokens: 500,
      temperature: 0.7,
    });

    // Get the response
    const responseText =
      completion.choices[0]?.message?.content ||
      'Sorry, I could not generate a response.';

    // Save the conversation to Supabase
    await supabase.from('conversations').insert({
      document_id: documentId,
      user_message: message,
      assistant_message: responseText,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ message: responseText });
  } catch (error) {
    console.error('Error in chatbot API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
