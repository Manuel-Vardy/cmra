import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CivicPulse — Staff Command Center',
  description:
    'Authorized municipal staff portal for managing, triaging, and resolving community issue reports.',
  robots: 'noindex, nofollow', // Keep admin out of search engines
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
