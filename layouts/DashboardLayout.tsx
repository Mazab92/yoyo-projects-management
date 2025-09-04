import React, { useState } from 'react';
import { User } from 'firebase/auth';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Project } from '../types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onSignOut: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = (props) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-light dark:bg-dark">
      <Sidebar 
        {...props}
        isOpen={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <Header 
          user={props.user}
          onSignOut={props.onSignOut}
          onMenuClick={() => setSidebarOpen(true)}
        />
        {props.children}
      </div>
    </div>
  );
};

export default DashboardLayout;
