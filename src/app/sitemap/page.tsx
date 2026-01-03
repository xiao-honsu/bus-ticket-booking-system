import { Metadata } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import MarkdownPage from '@/components/MarkdownPage';

export const metadata: Metadata = {
  title: 'Sitemap | BusTicket',
  description: 'Navigate all pages and features available on the BusTicket platform.',
};

export default async function SitemapPage() {
  const filePath = path.join(process.cwd(), 'public', 'sitemap.md');
  const content = await fs.readFile(filePath, 'utf-8');

  return <MarkdownPage content={content} title="Sitemap" />;
}
