'use client';

import type { Metadata } from 'next';
import './globals.css';
import Sidebar from './components/Sidebar';
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden dark:bg-gray-800 text-gray-900 dark:text-white">
        <CustomSidebar />
        <main className="flex-1 h-screen overflow-y-auto p-4 sm:p-8 md:p-12 dark:bg-gray-800 text-gray-900 dark:text-white">
          {children}
        </main>
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
