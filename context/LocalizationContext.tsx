import React, { createContext, useState, ReactNode, useEffect } from 'react';
import en from '../locales/en.json';
import ar from '../locales/ar.json';

type Language = 'en' | 'ar';
type Translations = typeof en;

interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: keyof Translations, fallback?: string) => string;
  dir: 'ltr' | 'rtl';
}

export const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

const translations: Record<Language, Translations> = { en, ar };

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: keyof Translations, fallback?: string): string => {
    return translations[language][key] || fallback || key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  return (
    <LocalizationContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LocalizationContext.Provider>
  );
};
