import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { content, type, sourceLanguage, targetLanguage } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: 'No content provided for translation' },
        { status: 400 }
      );
    }

    // Get API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Call OpenAI API to translate the content
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a translator that translates content from ${sourceLanguage} to ${targetLanguage}. Translate the following ${type} content accurately while preserving the original meaning and formatting.`,
          },
          {
            role: 'user',
            content: content,
          },
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const translation = data.choices[0]?.message?.content?.trim();

    if (!translation) {
      return NextResponse.json(
        { error: 'Failed to generate translation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ translation });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to translate content',
      },
      { status: 500 }
    );
  }
}
