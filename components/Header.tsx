
import React from 'react';
import { Search, Bell, Languages, Menu } from 'lucide-react';
import { useLocalization } from '../hooks/useLocalization';
import { Page } from '../types';

interface HeaderProps {
  title: Page;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  const { language, setLanguage, t } = useLocalization();

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
  };

  return (
    <header className="flex-shrink-0 flex items-center justify-between p-4 bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
            <button onClick={onMenuClick} className="md:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors me-2" aria-label="Open menu">
                <Menu size={24} />
            </button>
            <h2 className="text-xl sm:text-2xl font-bold text-dark dark:text-light">{t(title.toLowerCase() as any)}</h2>
        </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="relative hidden sm:block">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={t('search')}
            className="ps-10 pe-4 py-2 w-40 lg:w-64 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button 
          onClick={toggleLanguage}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center"
          aria-label="Toggle language"
        >
          <Languages size={20} />
          <span className="hidden sm:inline font-semibold text-sm ms-2">{language === 'en' ? 'AR' : 'EN'}</span>
        </button>
        <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <Bell size={20} />
        </button>
        <div className="flex items-center">
            <img src="https://picsum.photos/id/1005/200" alt="User Avatar" className="w-10 h-10 rounded-full object-cover" />
            <div className="ms-3 hidden md:block">
                <p className="font-semibold text-sm">Eleanor Vance</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Project Manager</p>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
