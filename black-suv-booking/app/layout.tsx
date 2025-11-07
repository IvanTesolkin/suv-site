import './globals.css';
import { ReactNode } from 'react';

/**
 * Root layout component. This file is required by Next.js when using
 * the App Router. It wraps every page in a consistent HTML
 * structure and imports the global stylesheet.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}