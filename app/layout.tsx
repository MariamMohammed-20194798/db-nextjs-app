'use client';

import type { Metadata } from 'next';
import './globals.css';
import Sidebar from './components/Sidebar';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from './utils/ThemeContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white">
        <ThemeProvider>
          <CustomSidebar />
          <main className="flex-1 h-screen overflow-y-auto p-4 sm:p-8 md:p-12 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white">
            {children}
          </main>
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
