
import React, { useState } from 'react';
import { Page, Project } from '../types';
import { LayoutDashboard, Users, ListChecks, GanttChartSquare, ChevronsUpDown, PlusCircle, Wallet, ShieldAlert, X, Rocket, Trash2 } from 'lucide-react';
import { useLocalization } from '../hooks/useLocalization';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  projects: Project[];
  selectedProjectId: number | null;
  onSelectProject: (id: number) => void;
  onNewProject: () => void;
  onDeleteProject: (id: number) => void;
  isSidebarOpen: boolean;
  onClose: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <li
    onClick={onClick}
    className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors
      ${isActive
        ? 'bg-primary text-white shadow-lg'
        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-secondary'
      }`}
  >
    {icon}
    <span className="ms-4 font-medium">{label}</span>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, projects, selectedProjectId, onSelectProject, onNewProject, onDeleteProject, isSidebarOpen, onClose }) => {
  const { t } = useLocalization();

  const navItems: { label: Page; icon: React.ReactNode }[] = [
    { label: 'Dashboard', icon: <LayoutDashboard size={22} /> },
    { label: 'Team', icon: <Users size={22} /> },
    { label: 'Tasks', icon: <ListChecks size={22} /> },
    { label: 'Timeline', icon: <GanttChartSquare size={22} /> },
    { label: 'Budget', icon: <Wallet size={22} /> },
    { label: 'Risks', icon: <ShieldAlert size={22} /> },
  ];
  const [isProjectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleDeleteClick = (e: React.MouseEvent, projectId: number) => {
    e.stopPropagation();
    if (window.confirm(t('deleteProjectConfirmation'))) {
        onDeleteProject(projectId);
        setProjectDropdownOpen(false); // Close dropdown after deletion
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        ></div>
      )}
      <aside className={`fixed md:relative inset-y-0 start-0 z-50 w-64 flex-shrink-0 bg-white dark:bg-dark-secondary p-4 border-e border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="flex items-center justify-center mb-6 relative">
            <div className="flex flex-col items-center text-center">
                <div className="bg-primary rounded-lg p-2 mb-2">
                    <Rocket size={28} className="text-white" />
                </div>
                <h1 className="text-lg font-bold text-dark dark:text-light leading-tight">{t('appNameEnglish')}</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('appNameArabic')}</p>
            </div>
            <button onClick={onClose} className="md:hidden absolute top-0 end-0 mt-1 me-1 p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700">
                <X size={20} />
            </button>
        </div>

        <div className="mb-4 relative">
          <button onClick={() => setProjectDropdownOpen(!isProjectDropdownOpen)} className="w-full flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-left">
            <span className="font-semibold truncate text-dark dark:text-light">{selectedProject?.name || t('selectProject')}</span>
            <ChevronsUpDown size={18} className="text-gray-500" />
          </button>
          {isProjectDropdownOpen && (
            <div className="absolute mt-2 w-full bg-white dark:bg-dark-secondary rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
              <ul>
                {projects.map(project => (
                  <li key={project.id} onClick={() => { onSelectProject(project.id); setProjectDropdownOpen(false); }} className="group px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-sm flex justify-between items-center">
                    <span className="truncate">{project.name}</span>
                    <button 
                      onClick={(e) => handleDeleteClick(e, project.id)}
                      className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title={t('deleteProject')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <button onClick={onNewProject} className="flex items-center justify-center w-full bg-primary text-white p-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors mb-4">
          <PlusCircle size={20} className="me-2" />
          {t('newProject')}
        </button>

        <nav className="flex-grow">
          <ul>
            {navItems.map((item) => (
              <NavItem
                key={item.label}
                icon={item.icon}
                label={t(item.label.toLowerCase() as any)}
                isActive={activePage === item.label}
                onClick={() => setActivePage(item.label)}
              />
            ))}
          </ul>
        </nav>
        <div className="mt-auto">
          <div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">{t('upgradeToPro')}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('getMoreFeatures')}</p>
              <button className="mt-4 w-full bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors">
              {t('upgradeNow')}
              </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
