import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { isSafeHttpUrl } from '../lib/markdown/parseEdition';

interface SafeMarkdownProps {
  content: string;
  className?: string;
  onSelectSignal?: (signalId: string) => void;
}

const SIGNAL_REF_PATTERN = /\b((?:WORLD|AI|ECON)-[A-Za-z0-9]+-[A-Za-z0-9-]+)\b/g;

function renderTextWithSignalLinks(
  text: string,
  onSelectSignal?: (signalId: string) => void
): React.ReactNode {
  if (!onSelectSignal || !SIGNAL_REF_PATTERN.test(text)) {
    return text;
  }
  SIGNAL_REF_PATTERN.lastIndex = 0;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = SIGNAL_REF_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const signalId = match[1];
    parts.push(
      <button
        key={`${signalId}-${match.index}`}
        type="button"
        onClick={() => onSelectSignal(signalId)}
        className="font-mono-tabular text-[0.88em] font-medium underline decoration-[#9A3412]/50 underline-offset-4 hover:text-[#9A3412] dark:hover:text-[#FDBA74] transition-colors cursor-pointer"
      >
        {signalId}
      </button>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export const SafeMarkdown: React.FC<SafeMarkdownProps> = ({
  content,
  className = '',
  onSelectSignal,
}) => {
  if (!content.trim()) return null;

  const processChildren = (children: React.ReactNode): React.ReactNode => {
    return React.Children.map(children, (child) => {
      if (typeof child === 'string') {
        return renderTextWithSignalLinks(child, onSelectSignal);
      }
      return child;
    });
  };

  return (
    <div
      className={`text-[15.5px] leading-[1.72] text-[#292524] dark:text-[#E2DFD7] max-w-prose space-y-3 ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={(url) => (isSafeHttpUrl(url) ? url : '')}
        components={{
          a: ({ href, children }) => {
            if (!href || !isSafeHttpUrl(href)) {
              return <span className="text-[#78716C]">{children}</span>;
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-stone-400 dark:decoration-stone-600 underline-offset-4 hover:decoration-[#1E3A8A] dark:hover:decoration-[#93C5FD] text-[#1E3A8A] dark:text-[#93C5FD] transition-colors"
              >
                {children}
              </a>
            );
          },
          p: ({ children }) => <p className="leading-[1.72]">{processChildren(children)}</p>,
          li: ({ children }) => <li className="leading-[1.68]">{processChildren(children)}</li>,
          ul: ({ children }) => <ul className="list-disc pl-5 space-y-1.5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1.5">{children}</ol>,
          blockquote: ({ children }) => (
            <blockquote className="py-2 my-3 border-y border-stone-200 dark:border-stone-800 text-[#57534E] dark:text-[#A8A29E] italic">
              {children}
            </blockquote>
          ),
          code: ({ children, className: codeClass }) => {
            const isBlock = Boolean(codeClass);
            if (isBlock) {
              return (
                <code className="block font-mono-tabular text-xs p-3 bg-[#F3EFE6] dark:bg-[#1C1A17] border border-stone-200 dark:border-stone-800 rounded-md overflow-x-auto">
                  {children}
                </code>
              );
            }
            return (
              <code className="font-mono-tabular text-[0.88em] px-1 py-0.5 bg-[#F3EFE6] dark:bg-[#1F1D1A] rounded">
                {children}
              </code>
            );
          },
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 border border-stone-200 dark:border-stone-800 rounded-md">
              <table className="w-full text-sm text-left border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 bg-[#F3EFE6] dark:bg-[#1C1A17] font-semibold text-xs uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E] border-b border-stone-200 dark:border-stone-800">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border-b border-stone-200/70 dark:border-stone-800/70 align-top">
              {processChildren(children)}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
