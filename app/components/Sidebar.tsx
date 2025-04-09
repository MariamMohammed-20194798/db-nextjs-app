import Link from 'next/link';
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
  return (
    <aside className="w-64 bg-gray-100 p-4 border-r border-gray-200 flex flex-col">
      <div className="mb-8">
        <Link
          href="/"
          className="text-2xl font-bold text-green-800 flex items-center gap-2"
        >
          <IoBulb className="w-6 h-6" />
          DocuBrain
        </Link>
      </div>
      <nav className="flex flex-col space-y-2">
        <Link
          href="/"
          className="px-3 py-2 rounded hover:bg-gray-200 flex items-center gap-2"
        >
          <IoDocumentText className="w-4 h-4" />
          Documents
        </Link>
        <Link
          href="/version-history"
          className="px-3 py-2 rounded hover:bg-gray-200 flex items-center gap-2"
        >
          <IoTime className="w-4 h-4" />
          Version History
        </Link>
        <Link
          href="/trash"
          className="px-3 py-2 rounded hover:bg-gray-200 flex items-center gap-2"
        >
          <IoTrash className="w-4 h-4" />
          Trash
        </Link>
        <Link
          href="/account"
          className="px-3 py-2 rounded hover:bg-gray-200 flex items-center gap-2"
        >
          <IoPerson className="w-4 h-4" />
          Account
        </Link>
        <Link
          href="/apps"
          className="px-3 py-2 rounded hover:bg-gray-200 flex items-center gap-2"
        >
          <IoApps className="w-4 h-4" />
          Apps
        </Link>
      </nav>
      <div className="mt-auto space-y-2">
        <Link
          href="/support"
          className="block px-3 py-2 rounded hover:bg-gray-200 flex items-center gap-2"
        >
          <IoHelpCircle className="w-4 h-4" />
          Support
        </Link>
        <button className="w-full text-left px-3 py-2 rounded hover:bg-gray-200 flex items-center gap-2">
          <IoLogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
