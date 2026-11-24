import { useCallback, useEffect, useState } from 'react';
import type { UiLanguage } from '../types/edition';
import { normalizeUiLanguage } from '../lib/i18n/uiStrings';

const THEME_STORAGE_KEY = 'world-signal-theme';
const LANG_STORAGE_KEY = 'world-signal-lang';

function readInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // Ignore storage access errors in restricted iframes
  }
  return 'light';
}

function readSavedLanguageOverride(): UiLanguage | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'zh-CN' || saved === 'en') return saved;
  } catch {
    // Ignore storage errors
  }
  return null;
}

export function usePreferences(editionLanguage?: string) {
  const [theme, setThemeState] = useState<'light' | 'dark'>(readInitialTheme);
  const [langOverride, setLangOverride] = useState<UiLanguage | null>(
    readSavedLanguageOverride
  );

  // Default UI language to the loaded edition's content_language unless the reader chose an explicit override
  const effectiveLang: UiLanguage =
    langOverride ?? normalizeUiLanguage(editionLanguage ?? 'en');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = effectiveLang;
  }, [effectiveLang]);

  const setTheme = useCallback((next: 'light' | 'dark') => {
    setThemeState(next);
  }, []);

  const setLang = useCallback((next: UiLanguage) => {
    setLangOverride(next);
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // Ignore storage errors
    }
  }, []);

  return {
    theme,
    setTheme,
    lang: effectiveLang,
    setLang,
  };
}
