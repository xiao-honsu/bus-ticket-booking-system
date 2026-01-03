import { Metadata } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import MarkdownPage from '@/components/MarkdownPage';

export const metadata: Metadata = {
  title: 'About Us | BusTicket',
  description:
    "Learn about BusTicket's mission, technology, and commitment to making bus travel convenient for everyone.",
};

export default async function AboutPage() {
  const filePath = path.join(process.cwd(), 'public', 'about.md');
  const content = await fs.readFile(filePath, 'utf-8');

  return <MarkdownPage content={content} title="About BusTicket" />;
}
