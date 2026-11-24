import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { SignalSource } from '../../types/edition';
import { isSafeHttpUrl } from '../../lib/markdown/parseEdition';

interface SafeMarkdownProps {
  content: string;
  className?: string;
  onSelectSignal?: (signalId: string) => void;
  onInspectSource?: (sourceId: string) => void;
  sources?: SignalSource[];
  compact?: boolean;
}

const TOKEN_PATTERN = /(\b(?:WORLD|AI|ECON)-\d{8}-[a-z0-9-]+\b|\[S\d+\])/g;
const SIGNAL_ID_EXACT = /^(?:WORLD|AI|ECON)-\d{8}-[a-z0-9-]+$/;
const SOURCE_CITE_EXACT = /^\[(S\d+)\]$/;

export const SafeMarkdown: React.FC<SafeMarkdownProps> = ({
  content,
  className = '',
  onSelectSignal,
  onInspectSource,
  sources,
  compact = false,
}) => {
  const sourceMap = React.useMemo(() => {
    const map = new Map<string, SignalSource>();
    if (sources) {
      for (const s of sources) {
        map.set(s.source_id, s);
      }
    }
    return map;
  }, [sources]);

  if (!content || !content.trim()) return null;

  const decorateText = (text: string): React.ReactNode => {
    if (!onSelectSignal && !onInspectSource) return text;
    const parts = text.split(TOKEN_PATTERN);
    if (parts.length === 1) return text;

    return parts.map((part, idx) => {
      if (onSelectSignal && SIGNAL_ID_EXACT.test(part)) {
        return (
          <button
            key={`${part}-${idx}`}
            type="button"
            onClick={() => onSelectSignal(part)}
            className="inline font-mono-tabular text-[0.86em] font-medium text-[var(--ws-world)] underline decoration-[var(--ws-border-strong)] underline-offset-2 hover:decoration-current cursor-pointer"
          >
            {part}
          </button>
        );
      }

      const citeMatch = part.match(SOURCE_CITE_EXACT);
      if (citeMatch && onInspectSource) {
        const sid = citeMatch[1];
        const src = sourceMap.get(sid);
        return (
          <button
            key={`${sid}-${idx}`}
            type="button"
            onClick={() => onInspectSource(sid)}
            title={src ? `${sid}: ${src.outlet} — ${src.title}` : sid}
            className="mx-0.5 inline-flex items-baseline font-mono-tabular text-[0.78em] font-semibold text-[var(--ws-ink-muted)] hover:text-[var(--ws-ink)] underline decoration-dotted underline-offset-2 cursor-pointer"
          >
            [{sid}]
          </button>
        );
      }

      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  };

  const renderInteractiveChildren = (children: React.ReactNode): React.ReactNode =>
    React.Children.map(children, (child) => {
      if (typeof child === 'string') {
        return decorateText(child);
      }
      if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.props.children) {
        return React.cloneElement(child, {
          ...child.props,
          children: renderInteractiveChildren(child.props.children),
        });
      }
      return child;
    });

  const textSpacing = compact ? 'space-y-2 text-[0.92rem] leading-[1.68]' : 'space-y-3 text-[0.97rem] leading-[1.76]';

  return (
    <div className={`${textSpacing} text-[var(--ws-ink-secondary)] ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          p: ({ children }) => <p className="m-0">{renderInteractiveChildren(children)}</p>,
          ul: ({ children }) => (
            <ul className="my-2 ml-4 list-disc space-y-1.5 marker:text-[var(--ws-ink-muted)]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 ml-4 list-decimal space-y-1.5 marker:text-[var(--ws-ink-muted)]">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-1">{renderInteractiveChildren(children)}</li>,
          h2: ({ children }) => (
            <h3 className="font-display text-lg font-semibold text-[var(--ws-ink)] pt-3">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className="font-display text-base font-semibold text-[var(--ws-ink)] pt-2">
              {children}
            </h4>
          ),
          h4: ({ children }) => (
            <h5 className="text-sm font-semibold uppercase tracking-wide text-[var(--ws-ink)] pt-1.5">
              {children}
            </h5>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-[var(--ws-ink)]">
              {renderInteractiveChildren(children)}
            </strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-2 border-[var(--ws-border-strong)] pl-4 text-[var(--ws-ink-secondary)]">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-md border border-[var(--ws-border)]">
              <table className="w-full border-collapse text-left text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[var(--ws-surface-subtle)] text-xs font-semibold uppercase tracking-wider text-[var(--ws-ink-muted)]">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="border-b border-[var(--ws-border)] px-3 py-2">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border-b border-[var(--ws-border)] px-3 py-2 align-top">
              {renderInteractiveChildren(children)}
            </td>
          ),
          code: ({ children }) => (
            <code className="rounded bg-[var(--ws-surface-subtle)] px-1.5 py-0.5 font-mono-tabular text-[0.84em] text-[var(--ws-ink)]">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="my-3 overflow-x-auto rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface-subtle)] p-3 font-mono-tabular text-xs text-[var(--ws-ink)]">
              {children}
            </pre>
          ),
          a: ({ href, children }) => {
            if (!href || !isSafeHttpUrl(href)) {
              return (
                <span className="underline decoration-dotted text-[var(--ws-ink-muted)]">
                  {children}
                </span>
              );
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--ws-world)] underline decoration-[var(--ws-border-strong)] underline-offset-2 hover:decoration-current"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
