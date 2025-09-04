import React from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { Search, Bell, LogOut, Menu } from 'lucide-react';

interface HeaderProps {
  user: FirebaseUser | null;
  onSignOut: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onSignOut, onMenuClick }) => {
  return (
    <header className="flex items-center justify-between flex-shrink-0 h-16 px-4 bg-white border-b dark:bg-dark-secondary dark:border-gray-700">
      <div className="flex items-center">
        <button onClick={onMenuClick} className="p-2 mr-2 text-gray-500 rounded-md lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700">
            <Menu size={24} />
        </button>
        <div className="relative hidden md:block">
            <Search className="absolute text-gray-400 left-3 top-1/2 -translate-y-1/2" size={20} />
            <input 
            type="text" 
            placeholder="Search..." 
            className="w-full py-2 pl-10 pr-4 text-gray-900 bg-gray-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
            />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400">
          <Bell size={20} />
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 flex items-center justify-center font-bold text-white bg-primary rounded-full">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <span className="hidden text-sm font-medium text-gray-700 md:block dark:text-gray-300">{user?.email}</span>
        </div>
        <button onClick={onSignOut} title="Sign Out" className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;
