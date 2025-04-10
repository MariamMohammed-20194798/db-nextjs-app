'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  IoDocumentText,
  IoTime,
  IoTrash,
  IoPerson,
  IoApps,
  IoHelpCircle,
  IoLogOut,
  IoBulb,
} from 'react-icons/io5';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-100 p-4 border-r border-gray-200 flex flex-col">
      <div className="mb-8">
        <Link
          href="/documents"
          className="text-2xl font-bold text-pink-800 flex items-center gap-2"
        >
          <IoBulb className="w-6 h-6" />
          DocuBrain
        </Link>
      </div>
      <nav className="flex flex-col space-y-2">
        <Link
          href="/documents"
          className={`px-3 py-2 rounded flex items-center gap-2 ${
            pathname === '/documents' ? 'bg-gray-200' : 'hover:bg-gray-200'
          }`}
        >
          <IoDocumentText className="w-4 h-4" />
          Documents
        </Link>
        <Link
          href="/version-history"
          className={`px-3 py-2 rounded flex items-center gap-2 ${
            pathname === '/version-history' ? 'bg-gray-200' : 'hover:bg-gray-200'
          }`}
        >
          <IoTime className="w-4 h-4" />
          Version History
        </Link>
        <Link
          href="/trash"
          className={`px-3 py-2 rounded flex items-center gap-2 ${
            pathname === '/trash' ? 'bg-gray-200' : 'hover:bg-gray-200'
          }`}
        >
          <IoTrash className="w-4 h-4" />
          Trash
        </Link>
      </nav>
    </aside>
  );
}
