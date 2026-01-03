import { Metadata } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import MarkdownPage from '@/components/MarkdownPage';

export const metadata: Metadata = {
  title: 'Privacy Policy | BusTicket',
  description: 'Learn how BusTicket collects, uses, and protects your personal information.',
};

export default async function PrivacyPage() {
  const filePath = path.join(process.cwd(), 'public', 'privacy.md');
  const content = await fs.readFile(filePath, 'utf-8');

  return <MarkdownPage content={content} title="Privacy Policy" />;
}
