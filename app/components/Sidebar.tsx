'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IoDocumentText,
  IoTime,
  IoTrash,
  IoBulb,
  IoCreate,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
} from 'react-icons/io5';
import { IoLanguage } from 'react-icons/io5';
import { IoMdChatbubbles } from 'react-icons/io';

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const links = [
    { href: '/', label: 'Home', icon: IoHomeOutline },
    { href: '/translator', label: 'Translator', icon: IoLanguage },
    { href: '/summarize', label: 'Summarize', icon: IoDocumentText },
    { href: '/generate', label: 'Content Generator', icon: IoCreate },
    { href: '/chatbot', label: 'AI Chatbot', icon: IoMdChatbubbles },
    { href: '/version-history', label: 'Version History', icon: IoTime },
    { href: '/trash', label: 'Trash', icon: IoTrash },
  ];

  const content = (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
            <IoBulb className="h-5 w-5" />
          </div>
          {!mobile && !isCollapsed ? (
            <div>
              <p className="text-base font-semibold text-slate-900 dark:text-white">DocuBrain</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">AI workspace</p>
            </div>
          ) : null}
        </div>
        {!mobile ? (
          <button
            type="button"
            onClick={() => setIsCollapsed((value) => !value)}
            className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            {isCollapsed ? <IoChevronForwardOutline className="h-4 w-4" /> : <IoChevronBackOutline className="h-4 w-4" />}
          </button>
        ) : null}
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => onClose?.()}
              className={`flex min-h-11 items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/15 dark:bg-sky-500 dark:text-slate-950'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              } ${isCollapsed && !mobile ? 'justify-center px-2' : ''}`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {(!isCollapsed || mobile) ? <span className="truncate">{label}</span> : null}
            </Link>
          );
        })}
      </nav>
    </>
  );

  if (mobile) {
    return <aside className="flex h-full w-full flex-col overflow-y-auto p-4">{content}</aside>;
  }

  return (
    <aside className="flex h-full w-72 flex-col rounded-[28px] border border-slate-200/80 bg-white/80 p-4 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/70">
      {content}
    </aside>
  );
}
