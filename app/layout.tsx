import type { Metadata } from 'next';
import './globals.css';
import AppShell from './components/AppShell';
import { ThemeProvider } from './utils/ThemeContext';

export const metadata: Metadata = {
  title: 'DocuBrain',
  description: 'A polished AI workspace for translating, summarizing, generating content, and chatting with your documents.',
};

function SystemThemeInitializer() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
        (function() {
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
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <SystemThemeInitializer />
      </head>
      <body className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
