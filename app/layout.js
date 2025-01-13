import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// app/layout.js
export const metadata = {
  title: 'orbits',
  description: 'A stochastic drum machine',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/iimaginaryLogoDarkGray.ico" />
        <meta name="rnbo-version" content="1.0.0-alpha.5" />
      </head>
      <body>{children}</body>
    </html>
  );
}
