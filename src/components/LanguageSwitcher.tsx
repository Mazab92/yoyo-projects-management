import React from 'react';
import { motion } from 'framer-motion';
import { Locale } from '../types';

const LanguageSwitcher: React.FC<{ locale: Locale; toggleLocale: () => void; }> = ({ locale, toggleLocale }) => (
    <motion.button onClick={toggleLocale} className="p-2 text-sm font-medium text-gray-500 rounded-full w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400" aria-label="Toggle Language" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      {locale === 'en' ? 'AR' : 'EN'}
    </motion.button>
);

export default LanguageSwitcher;
