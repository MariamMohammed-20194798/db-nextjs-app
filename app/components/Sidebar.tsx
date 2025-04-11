'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IoDocumentText, IoTime, IoTrash, IoBulb } from 'react-icons/io5';
import { IoLanguage } from 'react-icons/io5';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-100 dark:bg-gray-900 p-4 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      <div className="mb-8">
        <Link
          href="/documents"
          className="text-2xl font-bold dark:text-pink-800 flex items-center gap-2"
        >
          <IoBulb className="w-6 h-6" />
          DocuBrain
        </Link>
      </div>
      <nav className="flex flex-col space-y-2">
        <Link
          href="/translator"
          className={`px-3 py-2 text-white rounded flex items-center gap-2 ${
            pathname === '/translator'
              ? 'bg-gray-200 dark:bg-gray-700'
              : 'hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <IoLanguage className="w-4 h-4" />
          Translator
        </Link>
        <Link
          href="/summarize"
          className={`px-3 py-2 text-white rounded flex items-center gap-2 ${
            pathname === '/summarize'
              ? 'bg-gray-200 dark:bg-gray-700'
              : 'hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <IoDocumentText className="w-4 h-4" />
          Summarize
        </Link>
        <Link
          href="/version-history"
          className={`px-3 py-2 text-white rounded flex items-center gap-2 ${
            pathname === '/version-history'
              ? 'bg-gray-200 dark:bg-gray-700'
              : 'hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <IoTime className="w-4 h-4" />
          Version History
        </Link>
        <Link
          href="/trash"
          className={`px-3 py-2 text-white rounded flex items-center gap-2 ${
            pathname === '/trash'
              ? 'bg-gray-200 dark:bg-gray-700'
              : 'hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <IoTrash className="w-4 h-4" />
          Trash
        </Link>
      </nav>
    </aside>
  );
}
