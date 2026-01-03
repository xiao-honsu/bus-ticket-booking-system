import { Metadata } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import MarkdownPage from '@/components/MarkdownPage';

export const metadata: Metadata = {
  title: 'FAQ | BusTicket',
  description: 'Frequently asked questions about booking bus tickets, payments, cancellations, and more.',
};

export default async function FAQPage() {
  const filePath = path.join(process.cwd(), 'public', 'faq.md');
  const content = await fs.readFile(filePath, 'utf-8');

  return <MarkdownPage content={content} title="Frequently Asked Questions" />;
}
