
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Team from './pages/Team';
import Tasks from './pages/Tasks';
import Timeline from './pages/Timeline';
import Budget from './pages/Budget';
import Risks from './pages/Risks';
import NewProjectModal from './components/NewProjectModal';
import { Page, Project, Task, BudgetItem, Risk } from './types';
import { initialProjects } from './data/mockData';
// fix: Import `useLocalization` from hooks file instead of context file.
import { LocalizationProvider } from './context/LocalizationContext';
import { useLocalization } from './hooks/useLocalization';

const AppContent: React.FC = () => {
  const { t, dir } = useLocalization();
  const [activePage, setActivePage] = useState<Page>('Dashboard');
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(projects.length > 0 ? projects[0].id : null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleOpenProjectModal = (project: Project | null = null) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };
  
  const handleCloseProjectModal = () => {
    setEditingProject(null);
    setIsProjectModalOpen(false);
  };

  const handleSubmitProject = (projectData: { id?: number; name: string; goal: string; startDate: string; endDate: string; budget: number }) => {
    let newProjects: Project[];
    if (projectData.id) { // Editing existing project
      newProjects = projects.map(p => p.id === projectData.id ? { 
        ...p,
        name: projectData.name,
        goal: projectData.goal,
        duration: { start: projectData.startDate, end: projectData.endDate },
        budget: projectData.budget,
      } : p);
    } else { // Adding new project
      const newProject: Project = {
        id: projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1,
        name: projectData.name,
        goal: projectData.goal,
        duration: {
          start: projectData.startDate,
          end: projectData.endDate,
        },
        budget: projectData.budget,
        team: [],
        tasks: [],
        budgetItems: [],
        risks: [],
      };
      newProjects = [...projects, newProject];
      setSelectedProjectId(newProject.id);
    }
    setProjects(newProjects);
    handleCloseProjectModal();
  };

  const handleTasksUpdate = (updatedTasks: Task[]) => {
    if (!selectedProjectId) return;
    setProjects(projects.map(p =>
      p.id === selectedProjectId ? { ...p, tasks: updatedTasks } : p
    ));
  };
  
  const handleBudgetItemsUpdate = (updatedBudgetItems: BudgetItem[]) => {
    if (!selectedProjectId) return;
    setProjects(projects.map(p =>
      p.id === selectedProjectId ? { ...p, budgetItems: updatedBudgetItems } : p
    ));
  };
  
  const handleRisksUpdate = (updatedRisks: Risk[]) => {
    if (!selectedProjectId) return;
    setProjects(projects.map(p =>
      p.id === selectedProjectId ? { ...p, risks: updatedRisks } : p
    ));
  };

  const renderPage = () => {
    if (!selectedProject) {
      return (
        <div className="text-center p-10">
          <h2 className="text-2xl font-semibold">{t('noProjectSelected')}</h2>
          <p className="text-gray-500 mt-2">{t('selectOrCreateProject')}</p>
        </div>
      );
    }
    switch (activePage) {
      case 'Dashboard':
        return <Dashboard project={selectedProject} onEditProject={() => handleOpenProjectModal(selectedProject)} />;
      case 'Team':
        return <Team project={selectedProject} />;
      case 'Tasks':
        return <Tasks project={selectedProject} onTasksUpdate={handleTasksUpdate} />;
      case 'Timeline':
        return <Timeline project={selectedProject} />;
      case 'Budget':
        return <Budget project={selectedProject} onBudgetItemsUpdate={handleBudgetItemsUpdate} />;
      case 'Risks':
        return <Risks project={selectedProject} onRisksUpdate={handleRisksUpdate} />;
      default:
        return <Dashboard project={selectedProject} onEditProject={() => handleOpenProjectModal(selectedProject)} />;
    }
  };

  return (
    <div className="relative flex h-screen bg-light dark:bg-dark text-gray-800 dark:text-gray-200 font-sans" dir={dir}>
      <Sidebar
        activePage={activePage}
        setActivePage={(page) => {
            setActivePage(page);
            setIsSidebarOpen(false); // Close sidebar on page change
        }}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={(id) => {
            setSelectedProjectId(id);
            setIsSidebarOpen(false);
        }}
        onNewProject={() => {
            handleOpenProjectModal(null);
            setIsSidebarOpen(false);
        }}
        isSidebarOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
            title={activePage} 
            onMenuClick={() => setIsSidebarOpen(true)} 
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-light dark:bg-dark p-4 sm:p-6">
          {renderPage()}
        </main>
      </div>
      {isProjectModalOpen && (
        <NewProjectModal
          onClose={handleCloseProjectModal}
          onSubmit={handleSubmitProject}
          projectToEdit={editingProject}
        />
      )}
    </div>
  );
};


const App: React.FC = () => (
  <LocalizationProvider>
    <AppContent />
  </LocalizationProvider>
);

export default App;
