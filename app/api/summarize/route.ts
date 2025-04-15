import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Validate environment variables
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey || apiKey === '') {
  console.error('OPENAI_API_KEY is not defined in environment variables');
}

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: apiKey as string,
});

// Function to fetch content from a URL
async function fetchUrlContent(url: string): Promise<string> {
  try {
    const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
    console.log(`Fetching content from: ${formattedUrl}`);
    const response = await fetch(formattedUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }
    const textContent = await response.text();

    // Extract visible text content (simple approach)
    // Remove HTML tags, scripts, styles, etc.
    const visibleText = textContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return visibleText.substring(0, 5000); // Limit text length
  } catch (error) {
    console.error('Error fetching URL:', error);
    throw new Error(
      `Failed to extract content from URL: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

export async function POST(req: Request) {
  try {
    // Validate API key
    if (!apiKey) {
      console.error('OpenAI API key is missing');
      return NextResponse.json({ error: 'API key configuration error' }, { status: 500 });
    }

    // Parse the request body
    const body = await req.json();
    const { content, type } = body;

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    console.log(`Processing ${type} summarization request`);

    // Prepare the prompt based on content type
    let prompt = '';
    let contentToSummarize = content;

    try {
      // For URLs, fetch the content first
      if (type === 'url') {
        contentToSummarize = await fetchUrlContent(content);
        prompt = `Please summarize the following webpage content:\n\n${contentToSummarize}`;
      } else if (type === 'text') {
        prompt = `Please summarize the following text concisely:\n\n${content}`;
      } else if (type === 'file') {
        prompt = `Please summarize the content of this file:\n\n${content}`;
      } else {
        prompt = `Please summarize the following content:\n\n${content}`;
      }
    } catch (error) {
      console.error('Error preparing content:', error);
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : 'Failed to prepare content for summarization',
        },
        { status: 500 }
      );
    }

    // Make the API call to OpenAI
    console.log('Sending request to OpenAI API');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that summarizes content accurately and concisely.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 400,
      temperature: 0.3,
    });

    // Extract and return the summary
    const summary = response.choices[0]?.message?.content || 'No summary generated';
    console.log('Summary generated successfully');

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error in summarize API:', error);

    // Provide more specific error messages
    if (error instanceof OpenAI.APIError) {
      console.error(`OpenAI API Error: ${error.status} - ${error.message}`);
      return NextResponse.json(
        { error: `OpenAI API Error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to summarize content' },
      { status: 500 }
    );
  }
}
