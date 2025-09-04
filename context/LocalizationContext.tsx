import React, { createContext, useState, useEffect, ReactNode } from 'react';

import en from '../locales/en.json';
import ar from '../locales/ar.json';

type Locale = 'en' | 'ar';
type Translations = typeof en;

interface LocalizationContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof Translations) => string;
}

export const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

const translations: Record<Locale, Translations> = { en, ar };

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    const dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [locale]);

  const t = (key: keyof Translations): string => {
    return translations[locale][key] || translations['en'][key] || key;
  };

  return (
    <LocalizationContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocalizationContext.Provider>
  );
};