import { Metadata } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import MarkdownPage from '@/components/MarkdownPage';

export const metadata: Metadata = {
  title: 'Accessibility | BusTicket',
  description:
    'Learn about our commitment to digital accessibility and how we make BusTicket accessible for all users.',
};

export default async function AccessibilityPage() {
  const filePath = path.join(process.cwd(), 'public', 'accessibility.md');
  const content = await fs.readFile(filePath, 'utf-8');

  return <MarkdownPage content={content} title="Accessibility Statement" />;
}
