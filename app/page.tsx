'use client';

import Link from 'next/link';
import {
  IoBulb,
  IoLanguageOutline,
  IoDocumentTextOutline,
  IoCreateOutline,
  IoTimerOutline,
  IoSparkles,
} from 'react-icons/io5';
import { IoMdChatbubbles } from 'react-icons/io';

const modules = [
  {
    href: '/translator',
    title: 'Translator',
    description:
      'Translate content between languages with instant previews and audio playback.',
    icon: IoLanguageOutline,
  },
  {
    href: '/summarize',
    title: 'Summarize',
    description: 'Turn long text, PDFs, or URLs into concise summaries with one tap.',
    icon: IoDocumentTextOutline,
  },
  {
    href: '/generate',
    title: 'Content Generator',
    description: 'Create polished emails, reports, blogs, and social posts in seconds.',
    icon: IoCreateOutline,
  },
  {
    href: '/chatbot',
    title: 'AI Chatbot',
    description:
      'Ask questions, compare ideas, and explore your saved content in a guided chat.',
    icon: IoMdChatbubbles,
  },
  {
    href: '/version-history',
    title: 'Version History',
    description:
      'Manage saved assets and revisit recent content without leaving the workspace.',
    icon: IoTimerOutline,
  },
];

export default function Home() {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200/80 bg-gradient-to-br from-sky-500/10 via-white/80 to-indigo-500/10 p-6 shadow-[0_25px_70px_-28px_rgba(15,23,42,0.45)] dark:border-slate-800/80 dark:from-sky-500/15 dark:via-slate-900/80 dark:to-indigo-500/10 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
                <IoBulb className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  Welcome to DocuBrain
                </h1>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                  Work through content translation, summarization, generation, and chat
                  experiences from a single polished dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map(({ href, title, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_44px_-28px_rgba(15,23,42,0.45)] transition-all duration-200 hover:-translate-y-1 hover:border-sky-300 hover:shadow-[0_24px_48px_-22px_rgba(59,130,246,0.45)] dark:border-slate-800/80 dark:bg-slate-900/80"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 transition group-hover:bg-sky-100 dark:bg-slate-800 dark:text-sky-300 dark:group-hover:bg-slate-700">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {title}
              </h2>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
