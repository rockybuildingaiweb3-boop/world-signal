import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import type { UiLanguage } from '../../types/edition';
import { getUiStrings } from '../../lib/i18n/uiStrings';
import { useAccessibleModal } from '../../hooks/useAccessibleModal';

interface LocalMarkdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadMarkdown: (markdown: string, label: string) => void;
  lang: UiLanguage;
}

export const LocalMarkdownModal: React.FC<LocalMarkdownModalProps> = ({
  isOpen,
  onClose,
  onLoadMarkdown,
  lang,
}) => {
  const t = getUiStrings(lang);
  const [text, setText] = useState('');
  const [label, setLabel] = useState('local-preview.md');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const modalRef = useRef<HTMLFormElement | null>(null);

  useAccessibleModal(isOpen, onClose, modalRef);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLabel(file.name);
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setText(reader.result);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError(t.localModal.emptyWarning);
      return;
    }
    onLoadMarkdown(text, label);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="local-md-modal-title"
        tabIndex={-1}
        onSubmit={handleSubmit}
        className="w-full max-w-2xl rounded-lg border border-[var(--ws-border)] bg-[var(--ws-surface)] shadow-xl overflow-hidden outline-none"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--ws-border)] px-5 py-4">
          <div>
            <h2
              id="local-md-modal-title"
              className="font-display text-lg font-semibold text-[var(--ws-ink)]"
            >
              {t.localModal.title}
            </h2>
            <p className="mt-0.5 text-xs text-[var(--ws-ink-muted)]">
              {t.localModal.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.archive.close}
            className="rounded-md p-1.5 text-[var(--ws-ink-muted)] hover:bg-[var(--ws-surface-subtle)] hover:text-[var(--ws-ink)] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown,text/markdown,text/plain"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface-subtle)] px-3.5 py-2 text-xs font-medium text-[var(--ws-ink)] hover:border-[var(--ws-border-strong)] cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" />
              {t.localModal.uploadFile}
            </button>
            <span className="font-mono-tabular text-xs text-[var(--ws-ink-muted)]">
              {label}
            </span>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="local-md-textarea"
              className="block text-xs font-medium text-[var(--ws-ink-secondary)]"
            >
              {t.localModal.pasteLabel}
            </label>
            <textarea
              id="local-md-textarea"
              rows={12}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError(null);
              }}
              placeholder={t.localModal.pastePlaceholder}
              className="w-full rounded-md border border-[var(--ws-border)] bg-[var(--ws-canvas)] p-3 font-mono-tabular text-xs text-[var(--ws-ink)] placeholder:text-[var(--ws-ink-muted)]/60"
            />
          </div>

          {error && (
            <p className="text-xs font-medium text-[var(--ws-error)]">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-[var(--ws-border)] bg-[var(--ws-surface-subtle)] px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[var(--ws-border)] bg-[var(--ws-surface)] px-3.5 py-1.5 text-xs font-medium text-[var(--ws-ink)] hover:border-[var(--ws-border-strong)] cursor-pointer"
          >
            {t.localModal.cancelButton}
          </button>
          <button
            type="submit"
            className="rounded-md bg-[var(--ws-ink)] px-4 py-1.5 text-xs font-medium text-[var(--ws-surface)] hover:opacity-90 cursor-pointer"
          >
            {t.localModal.previewButton}
          </button>
        </div>
      </form>
    </div>
  );
};
