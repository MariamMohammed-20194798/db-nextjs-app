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
  IoChevronForwardOutline,
  IoChevronBackOutline,
} from 'react-icons/io5';
import { IoLanguage } from 'react-icons/io5';
import { IoMdChatbubbles } from 'react-icons/io';
import { IoSunnyOutline, IoMoonOutline } from 'react-icons/io5';
import { IoDesktopOutline } from 'react-icons/io5';
import { useTheme } from '../utils/ThemeContext';

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const { theme, setTheme } = useTheme();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <aside
      className={`${
        isOpen ? 'w-64' : 'w-20'
      } bg-white dark:bg-gray-900 p-4 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full transition-width duration-300`}
    >
      <div className="mb-8 flex items-center justify-between">
        {isOpen ? (
          <p className="text-2xl mt-2 ml-2 font-bold text-blue-600 dark:text-blue-400 animate-pulse flex items-center gap-2">
            <IoBulb className="w-6 h-6" />
            DocuBrain
          </p>
        ) : (
          <p className="text-2xl mt-2 ml-2 font-bold text-blue-600 dark:text-blue-400 animate-pulse flex items-center justify-center">
            <IoBulb className="w-8 h-8" />
          </p>
        )}
      </div>
      <nav className="flex flex-col space-y-2 flex-grow">
        <button
          onClick={toggleSidebar}
          className="p-1 ml-2 text-gray-700 dark:text-gray-300"
        >
          {isOpen ? (
            <IoChevronBackOutline
              className={`${
                isOpen ? 'w-5 h-5' : 'w-6 h-6'
              } hover:text-gray-500 transition-colors`}
            />
          ) : (
            <IoChevronForwardOutline
              className={`${
                isOpen ? 'w-5 h-5' : 'w-6 h-6'
              } hover:text-gray-500 transition-colors`}
            />
          )}
        </button>
        <Link
          href="/translator"
          className={`px-3 py-2 rounded flex items-center ${
            isOpen ? 'gap-2' : 'justify-center'
          } ${
            pathname === '/translator'
              ? 'bg-blue-50 text-blue-700 dark:bg-gray-700 dark:text-white'
              : 'text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <IoLanguage className={isOpen ? 'w-5 h-5' : 'w-6 h-6'} />
          {isOpen && 'Translator'}
        </Link>
        <Link
          href="/summarize"
          className={`px-3 py-2 rounded flex items-center ${
            isOpen ? 'gap-2' : 'justify-center'
          } ${
            pathname === '/summarize'
              ? 'bg-blue-50 text-blue-700 dark:bg-gray-700 dark:text-white'
              : 'text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <IoDocumentText className={isOpen ? 'w-5 h-5' : 'w-6 h-6'} />
          {isOpen && 'Summarize'}
        </Link>
        <Link
          href="/generate"
          className={`px-3 py-2 rounded flex items-center ${
            isOpen ? 'gap-2' : 'justify-center'
          } ${
            pathname === '/generate'
              ? 'bg-blue-50 text-blue-700 dark:bg-gray-700 dark:text-white'
              : 'text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <IoCreate className={isOpen ? 'w-5 h-5' : 'w-6 h-6'} />
          {isOpen && 'Content Generator'}
        </Link>
        <Link
          href="/chatbot"
          className={`px-3 py-2 rounded flex items-center ${
            isOpen ? 'gap-2' : 'justify-center'
          } ${
            pathname === '/chatbot'
              ? 'bg-blue-50 text-blue-700 dark:bg-gray-700 dark:text-white'
              : 'text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <IoMdChatbubbles className={isOpen ? 'w-5 h-5' : 'w-6 h-6'} />
          {isOpen && 'ChatBot'}
        </Link>
        <Link
          href="/version-history"
          className={`px-3 py-2 rounded flex items-center ${
            isOpen ? 'gap-2' : 'justify-center'
          } ${
            pathname === '/version-history'
              ? 'bg-blue-50 text-blue-700 dark:bg-gray-700 dark:text-white'
              : 'text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <IoTime className={isOpen ? 'w-5 h-5' : 'w-6 h-6'} />
          {isOpen && 'Version History'}
        </Link>
        <Link
          href="/trash"
          className={`px-3 py-2 rounded flex items-center ${
            isOpen ? 'gap-2' : 'justify-center'
          } ${
            pathname === '/trash'
              ? 'bg-blue-50 text-blue-700 dark:bg-gray-700 dark:text-white'
              : 'text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <IoTrash className={isOpen ? 'w-5 h-5' : 'w-6 h-6'} />
          {isOpen && 'Trash'}
        </Link>
      </nav>

      {/* Theme toggle buttons */}
      <div
        className={`mt-auto flex ${
          isOpen ? 'justify-evenly' : 'flex-col space-y-4 items-center'
        } pt-4 border-t border-gray-200 dark:border-gray-700`}
      >
        <button
          onClick={() => setTheme('light')}
          className={`p-2 rounded-full ${
            theme === 'light'
              ? 'bg-blue-100 text-blue-600 dark:bg-gray-700 dark:text-yellow-500'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
          }`}
          title="Light Theme"
        >
          <IoSunnyOutline className="w-5 h-5" />
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`p-2 rounded-full ${
            theme === 'dark'
              ? 'bg-blue-100 text-blue-600 dark:bg-gray-700 dark:text-blue-400'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
          }`}
          title="Dark Theme"
        >
          <IoMoonOutline className="w-5 h-5" />
        </button>
        <button
          onClick={() => setTheme('system')}
          className={`p-2 rounded-full ${
            theme === 'system'
              ? 'bg-blue-100 text-blue-600 dark:bg-gray-700 dark:text-green-500'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
          }`}
          title="System Theme"
        >
          <IoDesktopOutline className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
}
