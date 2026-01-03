import { Metadata } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import MarkdownPage from '@/components/MarkdownPage';

export const metadata: Metadata = {
  title: 'Cookie Policy | BusTicket',
  description: 'Understand how BusTicket uses cookies and tracking technologies on our platform.',
};

export default async function CookiesPage() {
  const filePath = path.join(process.cwd(), 'public', 'cookies.md');
  const content = await fs.readFile(filePath, 'utf-8');

  return <MarkdownPage content={content} title="Cookie Policy" />;
}
