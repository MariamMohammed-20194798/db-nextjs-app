'use client';

import Link from 'next/link';
import {
  IoBulb,
  IoLanguageOutline,
  IoDocumentTextOutline,
  IoCreateOutline,
  IoTimerOutline,
} from 'react-icons/io5';
import { IoMdChatbubbles } from 'react-icons/io';

export default function Home() {
  return (
    <div className="h-full max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900 flex flex-col rounded-lg">
      <main className="flex-1 p-6 md:p-12">
        <div className="flex items-center justify-center gap-3 mb-8">
          <IoBulb className="w-10 h-10 text-blue-400 animate-pulse" />
          <h1 className="text-3xl text-center font-bold text-blue-400 animate-pulse">
            Welcome to DocuBrain
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/translator"
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg hover:scale-105 transition-all duration-300 border-2 border-blue-400"
          >
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
              <IoLanguageOutline className="text-blue-400" />
              Translator
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Translate Your Text Between Languages.
            </p>
          </Link>

          <Link
            href="/summarize"
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg hover:scale-105 transition-all duration-300 border-2 border-blue-400"
          >
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
              <IoDocumentTextOutline className="text-blue-400" />
              Summarize
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Generate concise summaries for your text, documents, and urls.
            </p>
          </Link>

          <Link
            href="/generate"
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg hover:scale-105 transition-all duration-300 border-2 border-blue-400"
          >
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
              <IoCreateOutline className="text-blue-400" />
              Content Generator
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Create professional emails, reports, blog posts, and more.
            </p>
          </Link>

          <Link
            href="/chatbot"
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg hover:scale-105 transition-all duration-300 border-2 border-blue-400"
          >
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
              <IoMdChatbubbles className="text-blue-400" />
              AI Chatbot{' '}
              <span className="text-xs bg-blue-400 text-white px-2 py-0.5 rounded-full">
                New
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Chat with your documents and get instant answers to your questions.
            </p>
          </Link>

          <Link
            href="/version-history"
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg hover:scale-105 transition-all duration-300 border-2 border-blue-400"
          >
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
              <IoTimerOutline className="text-blue-400" />
              Version History
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Track changes to your documents over time and restore previous versions.
            </p>
          </Link>
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-800 shadow py-4 px-6 text-center text-gray-600 dark:text-gray-300">
        <p>© 2023 DocuBrain. All rights reserved.</p>
      </footer>
    </div>
  );
}
