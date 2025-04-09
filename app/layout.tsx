import type { Metadata } from 'next';
// import { Geist, Geist_Mono } from 'next/font/google'; // Assuming Geist fonts are not strictly needed for this layout
import './globals.css';
import Sidebar from './components/Sidebar'; // Import the Sidebar component

// export const metadata: Metadata = { ... }; // Define metadata if needed

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Use flexbox to create the sidebar layout */}
      <body className="flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-h-screen overflow-y-auto p-4 sm:p-8 md:p-12">
          {children}
        </main>
      </body>
    </html>
  );
}
