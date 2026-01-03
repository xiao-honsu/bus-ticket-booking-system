import { Metadata } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import MarkdownPage from '@/components/MarkdownPage';

export const metadata: Metadata = {
  title: 'Terms of Service | BusTicket',
  description: 'Read our terms and conditions for using the BusTicket platform and services.',
};

export default async function TermsPage() {
  const filePath = path.join(process.cwd(), 'public', 'terms.md');
  const content = await fs.readFile(filePath, 'utf-8');

  return <MarkdownPage content={content} title="Terms of Service" />;
}
