import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, CheckSquare, Calendar, DollarSign, AlertTriangle, FileText, Image, Plus, Settings, X } from 'lucide-react';
import { Project } from '../types';

interface SidebarProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ projects, selectedProjectId, onSelectProject, onNewProject, isOpen, onClose }) => {
  const navLinks = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Tasks', icon: <CheckSquare size={20} />, path: '/tasks' },
    { name: 'Timeline', icon: <Calendar size={20} />, path: '/timeline' },
    { name: 'Team', icon: <Users size={20} />, path: '/team' },
    { name: 'Budget', icon: <DollarSign size={20} />, path: '/budget' },
    { name: 'Risks', icon: <AlertTriangle size={20} />, path: '/risks' },
    { name: 'Designs', icon: <Image size={20} />, path: '/designs' },
    { name: 'Reports', icon: <FileText size={20} />, path: '/reports' },
  ];

  return (
    <>
      <div className={`fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-white border-r transform transition-transform lg:relative lg:translate-x-0 dark:bg-dark-secondary dark:border-gray-700 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-4 border-b flex-shrink-0 dark:border-gray-700">
          <h1 className="text-xl font-bold text-primary">ProjectHub</h1>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="p-2 text-gray-500 rounded-md lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={24} />
          </motion.button>
        </div>
        <div className="flex flex-col flex-grow p-4 overflow-y-auto">
          <nav className="flex-1 space-y-2">
            {navLinks.map((link) => (
              <motion.div key={link.name} whileHover={{ x: 2 }}>
                <NavLink
                  to={link.path}
                  end
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`
                  }
                >
                  {link.icon}
                  <span className="ml-3">{link.name}</span>
                </NavLink>
              </motion.div>
            ))}
          </nav>

          <div className="mt-8">
            <div className="flex items-center justify-between px-4">
                <h2 className="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">Projects</h2>
                <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={onNewProject} className="p-1 text-gray-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <Plus size={16} />
                </motion.button>
            </div>
            <div className="mt-2 space-y-1">
              {projects.map(project => (
                <motion.button
                  key={project.id}
                  whileHover={{ x: 2 }}
                  onClick={() => { onSelectProject(project.id); onClose(); }}
                  className={`w-full text-left flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    selectedProjectId === project.id
                      ? 'bg-primary-light text-primary-dark font-semibold'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="flex-1 truncate">{project.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 p-4 border-t dark:border-gray-700">
            <motion.a whileHover={{ x: 2 }} href="#" className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                <Settings size={20} />
                <span className="ml-3">Settings</span>
            </motion.a>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;