import { Metadata } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import MarkdownPage from '@/components/MarkdownPage';

export const metadata: Metadata = {
  title: 'Help Center | BusTicket',
  description: 'Find answers to common questions and guidance on how to use the BusTicket platform.',
};

export default async function HelpPage() {
  const filePath = path.join(process.cwd(), 'public', 'help.md');
  const content = await fs.readFile(filePath, 'utf-8');

  return <MarkdownPage content={content} title="Help Center" />;
}
