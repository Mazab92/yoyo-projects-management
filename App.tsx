// Fix: Replaced placeholder content with a complete, functional App component.
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User as FirebaseUser } from 'firebase/auth';
import { mockProjects } from './data/mockData';
import { Project } from './types';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Timeline from './pages/Timeline';
import Team from './pages/Team';
import Budget from './pages/Budget';
import Risks from './pages/Risks';
import Designs from './pages/Designs';
import NewProjectModal from './components/NewProjectModal';
import ConfirmationModal from './components/ConfirmationModal';

// Mock user for demonstration purposes as per project setup.
const mockUser: FirebaseUser = {
  email: 'test@example.com',
} as FirebaseUser;


const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(mockUser);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
  };

  const handleNewProject = () => {
    setEditingProject(null);
    setIsNewProjectModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsNewProjectModalOpen(true);
  };

  const handleDeleteProject = (id: string) => {
    setProjectToDelete(id);
    setIsConfirmModalOpen(true);
  };
  
  const confirmDeleteProject = () => {
    if (projectToDelete) {
      setProjects(projects.filter(p => p.id !== projectToDelete));
      if (selectedProjectId === projectToDelete) {
        const remainingProjects = projects.filter(p => p.id !== projectToDelete);
        setSelectedProjectId(remainingProjects.length > 0 ? remainingProjects[0].id : null);
      }
      setProjectToDelete(null);
    }
    setIsConfirmModalOpen(false);
  };

  const handleSaveProject = (projectData: Omit<Project, 'id' | 'tasks' | 'team' | 'budget' | 'risks'>) => {
    if (editingProject) {
      const updatedProject = { ...editingProject, ...projectData };
      setProjects(projects.map(p => p.id === editingProject.id ? updatedProject : p));
    } else {
      const newProject: Project = {
        ...projectData,
        id: `proj-${Date.now()}`,
        tasks: [],
        team: [],
        budget: [],
        risks: [],
      };
      setProjects([...projects, newProject]);
      setSelectedProjectId(newProject.id);
    }
    setIsNewProjectModalOpen(false);
    setEditingProject(null);
  };

  const handleSignOut = () => {
    setUser(null);
  };
  
  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;

  if (!user) {
    return <div className="flex items-center justify-center h-screen bg-light dark:bg-dark">Please log in to continue.</div>;
  }
  
  return (
    <BrowserRouter>
      <DashboardLayout
        user={user}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={handleSelectProject}
        onNewProject={handleNewProject}
        onEditProject={handleEditProject}
        onDeleteProject={handleDeleteProject}
        onSignOut={handleSignOut}
        theme={theme}
        toggleTheme={toggleTheme}
      >
        <Routes>
          <Route path="/" element={<Dashboard project={selectedProject} />} />
          <Route path="/tasks" element={<Tasks project={selectedProject} />} />
          <Route path="/timeline" element={<Timeline project={selectedProject} />} />
          <Route path="/team" element={<Team project={selectedProject} />} />
          <Route path="/budget" element={<Budget project={selectedProject} />} />
          <Route path="/risks" element={<Risks project={selectedProject} />} />
          <Route path="/designs" element={<Designs project={selectedProject} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </DashboardLayout>
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onSave={handleSaveProject}
        editingProject={editingProject}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDeleteProject}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
      />
    </BrowserRouter>
  );
};

export default App;
