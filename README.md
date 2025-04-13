# NextJS Translation and Text-to-Speech App

This application provides translation services with text-to-speech capabilities using OpenAI API for translation and ElevenLabs API for text-to-speech synthesis.

## Features

- Translate text between multiple languages
- Text-to-speech for both source and translated text
- Save translations to history
- Modern UI with dark mode support

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
OPENAI_API_KEY=your_openai_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

## ElevenLabs Voice Configuration

The application uses ElevenLabs for text-to-speech. Different voices can be assigned to different languages:

1. Create an account at [ElevenLabs](https://elevenlabs.io/)
2. Browse the available voices in the ElevenLabs dashboard
3. Copy the voice IDs of voices you want to use for different languages
4. Update the `languageVoiceMap` object in `app/translator/page.tsx` with your preferred voice IDs

Default voice IDs are provided as examples, but you may want to customize them based on your preferences or to use voices in specific languages.

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Create and set up environment variables as described above
4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Endpoints

- `/api/translate` - Translates text between languages using OpenAI
- `/api/tts` - Converts text to speech using ElevenLabs API

## Technologies Used

- Next.js
- React
- OpenAI API
- ElevenLabs API
- NextUI components
- TailwindCSS

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
