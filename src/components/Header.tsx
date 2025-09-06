import React from 'react';
import { Link } from 'react-router-dom';
// Fix: Separated Firebase 'User' type import from function imports.
// FIX: Use User type from firebase/compat/auth
// import type { User } from 'firebase/compat/auth';
// FIX: The User type is not a named export from 'firebase/compat/auth'. It must be accessed via the firebase namespace.
import firebase from 'firebase/compat/app';
import { LogOut, Menu, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import { Locale } from '../types';

interface HeaderProps {
    // FIX: Use firebase.User type from the firebase namespace.
    user: firebase.User | null;
    onSignOut: () => void;
    onMenuClick: () => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    locale: Locale;
    toggleLocale: () => void;
    t: (key: string) => string;
}

const Header: React.FC<HeaderProps> = ({ user, onSignOut, onMenuClick, theme, toggleTheme, locale, toggleLocale, t }) => {
    return (
        <header className="flex items-center justify-between flex-shrink-0 h-16 px-4 bg-white/80 backdrop-blur-sm border-b dark:bg-dark-secondary/80 dark:border-gray-700">
          <div className="flex items-center">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onMenuClick} className="p-2 mr-2 text-gray-500 rounded-md lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700"> <Menu size={24} /> </motion.button>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <LanguageSwitcher locale={locale} toggleLocale={toggleLocale} />
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <Link to="/profile" title={t('profile')} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400"> <UserIcon size={20} /> </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center font-bold text-white bg-gradient-to-br from-primary to-emerald-500 rounded-full"> {user?.email?.charAt(0).toUpperCase()} </div>
              <span className="hidden text-sm font-medium text-gray-700 md:block dark:text-gray-300">{user?.email}</span>
            </div>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onSignOut} title={t('signOut')} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400"> <LogOut size={20} /> </motion.button>
          </div>
        </header>
    );
};

export default Header;