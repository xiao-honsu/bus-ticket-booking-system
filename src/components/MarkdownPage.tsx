import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MarkdownPageProps {
  content: string;
  title: string;
}

export default function MarkdownPage({ content, title }: MarkdownPageProps) {
  return (
    <div className="max-w-5xl container mx-auto px-4 py-12">
      <div className="p-8 md:p-12">
        <article className="prose prose-neutral dark:prose-invert lg:prose-lg max-w-none prose-a:text-primary prose-img:rounded-lg prose-code:before:content-[''] prose-code:after:content-['']">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
