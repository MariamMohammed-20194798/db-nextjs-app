'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FiMenu, FiX } from 'react-icons/fi';
import { IoSparkles } from 'react-icons/io5';
import Sidebar from './Sidebar';

const pageTitles: Record<string, string> = {
  '/': 'Home',
  '/translator': 'Translator',
  '/summarize': 'Summarize',
  '/generate': 'Content Generator',
  '/chatbot': 'AI Chatbot',
  '/version-history': 'Version History',
  '/trash': 'Trash',
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const pageTitle = pageTitles[pathname] || 'Workspace';
  const showSidebar = pathname !== '/';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_30%),linear-gradient(135deg,_rgba(248,250,252,0.95),_rgba(255,255,255,0.96))] text-slate-900 transition-colors dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.24),_transparent_35%),linear-gradient(135deg,_rgba(2,6,23,0.95),_rgba(15,23,42,0.98))] dark:text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-3 py-3 sm:px-4 lg:flex-row lg:px-6 lg:py-6">
        {showSidebar ? (
          <div className="hidden lg:block">
            <Sidebar />
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <header className="mb-4 flex items-center justify-between rounded-[24px] border border-slate-200/80 bg-white/80 px-3 py-3 shadow-[0_20px_45px_-24px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/70 sm:px-4 lg:px-5">
            <div className="flex min-w-0 items-center gap-3">
              {showSidebar ? (
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 lg:hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  aria-label="Open navigation menu"
                >
                  <FiMenu className="h-5 w-5" />
                </button>
              ) : null}

              <Link href="/" className="flex min-w-0 items-center gap-3 rounded-2xl px-1 py-1 transition hover:bg-slate-100/70 dark:hover:bg-slate-800/70">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
                  <IoSparkles className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    DocuBrain
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {pageTitle}
                  </p>
                </div>
              </Link>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/90 px-3 py-2 text-xs font-medium text-slate-600 sm:flex dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-300">
              <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-emerald-600 dark:text-emerald-400">
                Mobile ready
              </span>
              <span className="hidden md:inline">Accessible • polished • responsive</span>
            </div>
          </header>

          {showSidebar ? (
            <>
              <div
                className={`fixed inset-0 z-40 bg-slate-950/60 transition ${mobileMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'} lg:hidden`}
                onClick={() => setMobileMenuOpen(false)}
              />
              <div
                className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] transition-transform duration-300 lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
              >
                <div className="flex h-full flex-col bg-white/95 shadow-2xl backdrop-blur-xl dark:bg-slate-900/95">
                  <div className="flex items-center justify-between border-b border-slate-200/80 px-4 py-4 dark:border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 text-white">
                        <IoSparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">DocuBrain</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Quick navigation</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      aria-label="Close navigation menu"
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  </div>
                  <Sidebar mobile onClose={() => setMobileMenuOpen(false)} />
                </div>
              </div>
            </>
          ) : null}

          <main className="rounded-[28px] border border-slate-200/80 bg-white/80 p-4 shadow-[0_25px_70px_-28px_rgba(15,23,42,0.45)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/70 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
