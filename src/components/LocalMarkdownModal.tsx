import React, { useState } from 'react';
import { FileText, Upload, X } from 'lucide-react';

interface LocalMarkdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadMarkdown: (markdown: string, label: string) => void;
}

export const LocalMarkdownModal: React.FC<LocalMarkdownModalProps> = ({
  isOpen,
  onClose,
  onLoadMarkdown,
}) => {
  const [markdownInput, setMarkdownInput] = useState('');
  const [fileLabel, setFileLabel] = useState('local-preview.md');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      const text = await file.text();
      setMarkdownInput(text);
      setFileLabel(file.name);
    } catch {
      setError('Unable to read the selected Markdown file.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!markdownInput.trim()) {
      setError('Paste Markdown edition text or select a .md file first.');
      return;
    }
    onLoadMarkdown(markdownInput, fileLabel);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="local-md-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-[2px]"
    >
      <div className="w-full max-w-2xl bg-[#FBF9F5] dark:bg-[#191815] border border-stone-300 dark:border-stone-700 rounded-lg shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-[#1E3A8A] dark:text-[#93C5FD]" aria-hidden="true" />
            <h2
              id="local-md-modal-title"
              className="font-display text-xl font-semibold text-[#1C1917] dark:text-[#EFECE6]"
            >
              Inspect Local Markdown Edition
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-md text-[#57534E] dark:text-[#A8A29E] hover:bg-stone-200/70 dark:hover:bg-stone-800 cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-[#57534E] dark:text-[#A8A29E] leading-relaxed">
            Load a daily Markdown edition conforming to{' '}
            <code className="font-mono-tabular text-xs px-1 py-0.5 bg-stone-200/70 dark:bg-stone-800 rounded">
              docs/CONTENT_SCHEMA.md
            </code>{' '}
            for client-side parsing and preview across all four views. Nothing is uploaded or stored
            on a server.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 text-sm font-medium bg-[#F3EFE6] dark:bg-[#24221E] text-[#1C1917] dark:text-[#EFECE6] border border-stone-300 dark:border-stone-700 rounded-md hover:bg-stone-200/70 dark:hover:bg-stone-800 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" aria-hidden="true" />
              Choose .md File
              <input
                type="file"
                accept=".md,.markdown,text/markdown,text/plain"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
            <span className="text-xs font-mono-tabular text-[#57534E] dark:text-[#A8A29E]">
              {fileLabel}
            </span>
          </div>

          <div>
            <label
              htmlFor="markdown-paste-area"
              className="block text-xs font-medium uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E] mb-1.5"
            >
              Markdown Source
            </label>
            <textarea
              id="markdown-paste-area"
              rows={10}
              value={markdownInput}
              onChange={(e) => {
                setMarkdownInput(e.target.value);
                setError(null);
              }}
              placeholder="---&#10;schema_version: 1&#10;edition_date: &quot;2026-11-23&quot;&#10;..."
              className="w-full p-3 text-xs font-mono-tabular bg-[#F3EFE6]/60 dark:bg-[#121110] text-[#1C1917] dark:text-[#EFECE6] border border-stone-300 dark:border-stone-700 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E3A8A]"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-[#991B1B] dark:text-[#FCA5A5]">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[40px] px-4 py-2 text-sm font-medium text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#EFECE6] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[40px] px-5 py-2 text-sm font-medium bg-[#1C1917] dark:bg-[#EFECE6] text-[#FBF9F5] dark:text-[#121110] rounded-md hover:opacity-90 transition-opacity cursor-pointer"
            >
              Parse and Render
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
