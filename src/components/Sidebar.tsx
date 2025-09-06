import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    LayoutDashboard, Users, CheckSquare, Calendar, DollarSign, AlertTriangle, FileText, Plus, Settings, X, Trash2, Edit 
} from 'lucide-react';
import { Project } from '../types';

interface SidebarProps {
    projects: Project[];
    selectedProjectId: string | null;
    onSelectProject: (id: string) => void;
    onNewProject: () => void;
    onEditProject: (project: Project) => void;
    onDeleteProject: (project: Project) => void;
    isOpen: boolean;
    onClose: () => void;
    t: (key: string) => string;
}

const Sidebar: React.FC<SidebarProps> = ({ projects, selectedProjectId, onSelectProject, onNewProject, onEditProject, onDeleteProject, isOpen, onClose, t }) => {
    const navLinks = [
        { name: t('dashboard'), icon: <LayoutDashboard size={20} />, path: '/' }, { name: t('tasks'), icon: <CheckSquare size={20} />, path: '/tasks' }, { name: t('calendar'), icon: <Calendar size={20} />, path: '/calendar' }, { name: t('team'), icon: <Users size={20} />, path: '/team' }, { name: t('budget'), icon: <DollarSign size={20} />, path: '/budget' }, { name: t('risks'), icon: <AlertTriangle size={20} />, path: '/risks' }, { name: t('reports'), icon: <FileText size={20} />, path: '/reports' }, { name: t('settings'), icon: <Settings size={20} />, path: '/settings' },
    ];
    return (
        <>
          <div className={`fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
          <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-white border-r transform transition-transform lg:relative lg:translate-x-0 dark:bg-dark-secondary dark:border-gray-700 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center justify-between h-16 px-4 border-b flex-shrink-0 dark:border-gray-700"> <h1 className="text-xl font-bold text-primary">ProjectHub</h1> <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="p-2 text-gray-500 rounded-md lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700"> <X size={24} /> </motion.button> </div>
            <div className="flex flex-col flex-grow p-4 overflow-y-auto">
              <nav className="flex-1 space-y-2"> {navLinks.map((link) => ( <motion.div key={link.name} whileHover={{ x: 2 }}> <NavLink to={link.path} end={link.path === '/'} onClick={onClose} className={({ isActive }) => `flex items-center px-4 py-2 text-sm font-medium rounded-lg ${isActive ? 'bg-gradient-to-r from-primary to-emerald-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}> {link.icon} <span className="ml-3">{link.name}</span> </NavLink> </motion.div> ))} </nav>
              <div className="mt-8">
                <div className="flex items-center justify-between px-4"> <h2 className="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">{t('projects')}</h2> <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={onNewProject} className="p-1 text-gray-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"> <Plus size={16} /> </motion.button> </div>
                <div className="mt-2 space-y-1">
                  {projects.map(project => (
                    <motion.div
                      key={project.id}
                      className={`flex group items-center justify-between p-2 text-sm rounded-lg cursor-pointer ${selectedProjectId === project.id ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                      onClick={() => onSelectProject(project.id)}
                    >
                        <span className="truncate">{project.name}</span>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button whileTap={{scale:0.9}} onClick={(e) => { e.stopPropagation(); onEditProject(project); }} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"> <Edit size={14} /> </motion.button>
                            <motion.button whileTap={{scale:0.9}} onClick={(e) => { e.stopPropagation(); onDeleteProject(project); }} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"> <Trash2 size={14} /> </motion.button>
                        </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </>
    );
};

export default Sidebar;