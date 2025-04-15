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

export async function POST(req: Request) {
  try {
    // Validate API key
    if (!apiKey) {
      console.error('OpenAI API key is missing');
      return NextResponse.json({ error: 'API key configuration error' }, { status: 500 });
    }

    // Parse the request body
    const body = await req.json();
    const { contentType, topic, tone, length, additionalInfo } = body;

    if (!contentType || !topic) {
      return NextResponse.json(
        { error: 'Content type and topic are required' },
        { status: 400 }
      );
    }

    // Create system message based on content type
    let systemMessage = 'You are a professional content writer.';

    switch (contentType) {
      case 'email':
        systemMessage += ' You specialize in writing clear, effective emails.';
        break;
      case 'blog':
        systemMessage +=
          " You specialize in engaging blog posts that capture readers' attention.";
        break;
      case 'report':
        systemMessage +=
          ' You specialize in formal, structured reports with clear sections.';
        break;
      case 'social':
        systemMessage += ' You specialize in concise, engaging social media content.';
        break;
      default:
        systemMessage += " You create high-quality content tailored to the user's needs.";
    }

    // Create user prompt
    let userPrompt = `Generate a ${contentType} about ${topic}`;

    if (tone) {
      userPrompt += ` with a ${tone} tone`;
    }

    if (length) {
      userPrompt += ` that is approximately ${length} in length`;
    }

    if (additionalInfo) {
      userPrompt += `.\n\nAdditional requirements: ${additionalInfo}`;
    } else {
      userPrompt += '.';
    }

    console.log('Sending request to OpenAI API for content generation');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Can be upgraded to more capable model if needed
      messages: [
        {
          role: 'system',
          content: systemMessage,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.7, // Slightly more creative than summarization
      max_tokens: 1500, // Higher token limit for longer content
    });

    // Extract and return the generated content
    const generatedContent =
      response.choices[0]?.message?.content || 'No content generated';
    console.log('Content generated successfully');

    return NextResponse.json({ generatedContent });
  } catch (error) {
    console.error('Error in generate API:', error);

    // Provide more specific error messages
    if (error instanceof OpenAI.APIError) {
      console.error(`OpenAI API Error: ${error.status} - ${error.message}`);
      return NextResponse.json(
        { error: `OpenAI API Error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate content' },
      { status: 500 }
    );
  }
}
