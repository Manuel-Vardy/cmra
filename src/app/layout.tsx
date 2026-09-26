import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import 'leaflet/dist/leaflet.css';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CivicPulse — Community Issue Reporting & Resolution Platform',
  description:
    'A professional web-based platform for residents to report community problems and for administrators to manage, respond to, and resolve them.',
  keywords: [
    'community issues',
    'civic reports',
    'infrastructure repair',
    'public works',
    'issue resolution',
    'municipal management',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
