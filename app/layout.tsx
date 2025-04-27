'use client';

import type { Metadata } from 'next';
import './globals.css';
import Sidebar from './components/Sidebar';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from './utils/ThemeContext';

// Simple component to check system dark mode preference
function SystemThemeInitializer() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
        (function() {
          // Check system preference and apply theme
          var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          var root = document.documentElement;
          
          if (prefersDark) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        })();
      `,
      }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <SystemThemeInitializer />
      </head>
      <body className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white">
        <ThemeProvider>
          <CustomSidebar />
          <div className="flex flex-col flex-1 h-screen">
            <main className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white">
              {children}
            </main>
            <footer className="py-5 px-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
              © 2025 DocuBrains. All rights reserved.
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

function CustomSidebar() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  if (isHomePage) {
    return null;
  }

  return <Sidebar />;
}
