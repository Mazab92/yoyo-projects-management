import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC<{ theme: 'light' | 'dark'; toggleTheme: () => void; }> = ({ theme, toggleTheme }) => (
    <motion.button onClick={toggleTheme} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400" aria-label="Toggle theme" whileHover={{ scale: 1.1, rotate: 15 }} whileTap={{ scale: 0.9 }}>
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </motion.button>
);

export default ThemeToggle;
