import React from 'react';
import { Project } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { LayoutDashboard, Users, ListChecks, GanttChartSquare, DollarSign, ShieldAlert, Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  projects, 
  selectedProjectId, 
  onSelectProject,
  onNewProject,
  onEditProject,
  onDeleteProject,
}) => {
  const { t, setLocale, locale } = useLocalization();
  const [openDropdown, setOpenDropdown] = React.useState<string | null>(null);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Team', path: '/team', icon: Users },
    { name: 'Tasks', path: '/tasks', icon: ListChecks },
    { name: 'Timeline', path: '/timeline', icon: GanttChartSquare },
    { name: 'Budget', path: '/budget', icon: DollarSign },
    { name: 'Risks', path: '/risks', icon: ShieldAlert },
  ];

  const toggleDropdown = (projectId: string) => {
    setOpenDropdown(openDropdown === projectId ? null : projectId);
  };

  return (
    <aside className="w-64 bg-white dark:bg-dark-secondary flex flex-col h-screen shadow-lg">
      <div className="p-4 border-b dark:border-gray-700">
        <h1 className="text-2xl font-bold text-primary">Yoyo PM</h1>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-semibold text-gray-500 uppercase dark:text-gray-400">Projects</h2>
            <button onClick={onNewProject} className="p-1 text-gray-500 rounded hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400">
                <Plus size={18} />
            </button>
        </div>
        <ul className="space-y-1">
          {projects.map(project => (
            <li key={project.id} className={`flex justify-between items-center p-2 rounded-md cursor-pointer text-sm ${selectedProjectId === project.id ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
              <span onClick={() => onSelectProject(project.id)} className="flex-grow truncate">{project.name}</span>
              <div className="relative">
                <button onClick={() => toggleDropdown(project.id)} className={`p-1 rounded ${selectedProjectId === project.id ? 'hover:bg-primary-dark' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                    <MoreVertical size={16} />
                </button>
                {openDropdown === project.id && (
                    <div className="absolute right-0 z-10 w-32 mt-1 bg-white rounded-md shadow-lg dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                        <button onClick={() => { onEditProject(project); setOpenDropdown(null); }} className="flex items-center w-full px-3 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                            <Pencil size={14} className="mr-2" /> Edit
                        </button>
                        <button onClick={() => { onDeleteProject(project.id); setOpenDropdown(null); }} className="flex items-center w-full px-3 py-2 text-sm text-left text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                            <Trash2 size={14} className="mr-2" /> Delete
                        </button>
                    </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <nav className="flex-grow p-4 mt-4 border-t dark:border-gray-700">
        <ul className="space-y-2">
            {navItems.map(item => (
                <li key={item.name}>
                    <NavLink to={item.path} className={({ isActive }) => `flex items-center p-2 space-x-3 rounded-md text-sm ${isActive ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                        <item.icon size={20} />
                        <span>{t(item.name.toLowerCase())}</span>
                    </NavLink>
                </li>
            ))}
        </ul>
      </nav>

      <div className="p-4 mt-auto border-t dark:border-gray-700">
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as 'en' | 'ar')}
          className="w-full p-2 text-sm bg-gray-100 border-transparent rounded-md dark:bg-gray-700 dark:text-gray-300 focus:ring-primary focus:border-primary"
        >
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>
      </div>
    </aside>
  );
};

export default Sidebar;
