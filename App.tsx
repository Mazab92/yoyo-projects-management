// Yoyo Project Management - Single File Application
// This file contains the entire refactored React application, including all components, pages, types, and logic.

// 1. IMPORTS
import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { 
    getFirestore, collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, query, where, writeBatch, serverTimestamp
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { 
    LayoutDashboard, Users, CheckSquare, Calendar, DollarSign, AlertTriangle, FileText, Image, Plus, Settings, X, 
    Search, Bell, LogOut, Menu, Sun, Moon, Loader2, UploadCloud, Trash2, Edit, Save, PackagePlus
} from 'lucide-react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { motion, AnimatePresence } from 'framer-motion';

// 2. CHART.JS REGISTRATION
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

// 3. FIREBASE INITIALIZATION
const firebaseConfig = {
  apiKey: "AIzaSyCr6zvT7MqzlLGylTUvWlWfJudgi_nFCos",
  authDomain: "yoyo-projects-management.firebaseapp.com",
  projectId: "yoyo-projects-management",
  storageBucket: "yoyo-projects-management.appspot.com",
  messagingSenderId: "314270688402",
  appId: "1:314270688402:web:4dbe40616d4732d444724b",
  measurementId: "G-9YHY63624V"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// 4. TYPE DEFINITIONS
export type Status = 'To Do' | 'In Progress' | 'Done' | 'Archived';

export interface Task {
  id: string;
  name: string;
  description: string;
  status: Status;
  dueDate: string;
  assigneeId?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
}

export interface BudgetItem {
    id: string;
    category: string;
    allocated: number;
    spent: number;
}

export interface Risk {
    id: string;
    description: string;
    likelihood: 'Low' | 'Medium' | 'High';
    impact: 'Low' | 'Medium' | 'High';
    mitigation: string;
}

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface Design {
  id: string;
  name: string;
  imageUrl: string;
  storagePath: string;
  uploadedAt: any; // Firestore Timestamp
}

// 5. HELPER FUNCTIONS
export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'To Do': return 'bg-gray-500';
    case 'In Progress': return 'bg-blue-500';
    case 'Done': return 'bg-green-500';
    case 'Archived': return 'bg-yellow-500';
    default: return 'bg-gray-500';
  }
};

export const formatCurrencyEGP = (amount: number): string => {
    return `E£${amount.toLocaleString('en-US')}`;
};

// 6. UI & LAYOUT COMPONENTS

// EmptyState Component
const EmptyState: React.FC<{ title: string; message: string; action?: React.ReactNode; }> = ({ title, message, action }) => (
    <div className="py-16 text-center">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
);

// SkeletonLoader Component
const SkeletonLoader: React.FC = () => (
    <div className="flex items-center justify-center w-full h-full p-4 mx-auto">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
);

// Card Component
const Card: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <motion.div 
      className="p-4 bg-white rounded-lg shadow-md dark:bg-dark-secondary"
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center">
        <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mr-4 text-white rounded-full" style={{ backgroundColor: color }}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </motion.div>
);

// ThemeToggle Component
const ThemeToggle: React.FC<{ theme: 'light' | 'dark'; toggleTheme: () => void; }> = ({ theme, toggleTheme }) => (
    <motion.button
      onClick={toggleTheme}
      className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400"
      aria-label="Toggle theme"
      whileHover={{ scale: 1.1, rotate: 15 }} whileTap={{ scale: 0.9 }}
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </motion.button>
);

// Header Component
const Header: React.FC<{ user: User | null; onSignOut: () => void; onMenuClick: () => void; theme: 'light' | 'dark'; toggleTheme: () => void; }> = ({ user, onSignOut, onMenuClick, theme, toggleTheme }) => {
    return (
        <header className="flex items-center justify-between flex-shrink-0 h-16 px-4 bg-white border-b dark:bg-dark-secondary dark:border-gray-700">
          <div className="flex items-center">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onMenuClick} className="p-2 mr-2 text-gray-500 rounded-md lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700">
                <Menu size={24} />
            </motion.button>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center font-bold text-white bg-primary rounded-full">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden text-sm font-medium text-gray-700 md:block dark:text-gray-300">{user?.email}</span>
            </div>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onSignOut} title="Sign Out" className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400">
              <LogOut size={20} />
            </motion.button>
          </div>
        </header>
    );
};

// Sidebar Component
const Sidebar: React.FC<{ projects: Project[]; selectedProjectId: string | null; onSelectProject: (id: string) => void; onNewProject: () => void; isOpen: boolean; onClose: () => void; }> = ({ projects, selectedProjectId, onSelectProject, onNewProject, isOpen, onClose }) => {
    const navLinks = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
        { name: 'Tasks', icon: <CheckSquare size={20} />, path: '/tasks' },
        { name: 'Team', icon: <Users size={20} />, path: '/team' },
        { name: 'Budget', icon: <DollarSign size={20} />, path: '/budget' },
        { name: 'Risks', icon: <AlertTriangle size={20} />, path: '/risks' },
        { name: 'Designs', icon: <Image size={20} />, path: '/designs' },
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
                    <NavLink to={link.path} end onClick={onClose}
                      className={({ isActive }) => `flex items-center px-4 py-2 text-sm font-medium rounded-md ${isActive ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                      {link.icon} <span className="ml-3">{link.name}</span>
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
                    <motion.button key={project.id} whileHover={{ x: 2 }} onClick={() => { onSelectProject(project.id); onClose(); }}
                      className={`w-full text-left flex items-center px-4 py-2 text-sm font-medium rounded-md ${selectedProjectId === project.id ? 'bg-primary-light text-primary-dark font-semibold' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                      <span className="flex-1 truncate">{project.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </>
    );
};

// ConfirmationModal Component
const ConfirmationModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; }> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl dark:bg-dark-secondary">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>
            <div className="flex justify-end mt-6 space-x-4">
              <motion.button onClick={onClose} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">Cancel</motion.button>
              <motion.button onClick={onConfirm} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Confirm</motion.button>
            </div>
          </div>
        </div>
    );
};

// NewProjectModal Component
const NewProjectModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (project: Omit<Project, 'id' | 'ownerId'>) => void; editingProject: Project | null; }> = ({ isOpen, onClose, onSave, editingProject }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
  
    useEffect(() => {
      if (editingProject) {
        setName(editingProject.name);
        setDescription(editingProject.description);
        setStartDate(new Date(editingProject.startDate).toISOString().split('T')[0]);
        setEndDate(new Date(editingProject.endDate).toISOString().split('T')[0]);
      } else {
        setName(''); setDescription(''); setStartDate(''); setEndDate('');
      }
    }, [editingProject, isOpen]);
  
    if (!isOpen) return null;
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({ name, description, startDate, endDate });
      onClose();
    };
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-dark-secondary">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editingProject ? 'Edit Project' : 'New Project'}</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project Name</label>
              <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} required className="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required className="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} required className="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
            </div>
            <div className="flex justify-end pt-4 space-x-4">
              <motion.button type="button" onClick={onClose} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">Cancel</motion.button>
              <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-primary-dark">{editingProject ? 'Update Project' : 'Create Project'}</motion.button>
            </div>
          </form>
        </div>
      </div>
    );
};

// DashboardLayout Component
const DashboardLayout: React.FC<{ children: React.ReactNode; user: User; projects: Project[]; selectedProjectId: string | null; onSelectProject: (id: string) => void; onNewProject: () => void; onSignOut: () => void; theme: 'light' | 'dark'; toggleTheme: () => void; }> = (props) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    return (
        <div className="flex h-screen overflow-hidden bg-light dark:bg-dark">
          <Sidebar {...props} isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex flex-col flex-1 w-0 overflow-hidden">
            <Header user={props.user} onSignOut={props.onSignOut} onMenuClick={() => setSidebarOpen(true)} theme={props.theme} toggleTheme={props.toggleTheme} />
            {props.children}
          </div>
        </div>
    );
};


// 7. PAGE COMPONENTS

// Dashboard Page
const DashboardPage: React.FC<{ project: Project | null; tasks: Task[]; team: TeamMember[]; budget: BudgetItem[]; risks: Risk[]; }> = ({ project, tasks, team, budget, risks }) => {
    if (!project) return <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark"><EmptyState title="No Project Selected" message="Please select a project from the sidebar to view its dashboard." /></main>;
    const tasksByStatus = tasks.reduce((acc, task) => { acc[task.status] = (acc[task.status] || 0) + 1; return acc; }, {} as Record<string, number>);
    const budgetOverview = { allocated: budget.reduce((sum, item) => sum + item.allocated, 0), spent: budget.reduce((sum, item) => sum + item.spent, 0) };
    const cardData = [
        { title: 'Total Tasks', value: tasks.length.toString(), icon: <CheckSquare size={24} />, color: '#3B82F6' },
        { title: 'Team Members', value: team.length.toString(), icon: <Users size={24} />, color: '#10B981' },
        { title: 'Open Risks', value: risks.length.toString(), icon: <AlertTriangle size={24} />, color: '#F59E0B' },
        { title: 'Budget Spent', value: formatCurrencyEGP(budgetOverview.spent), icon: <DollarSign size={24} />, color: '#EF4444' },
    ];
    const taskStatusData = { labels: Object.keys(tasksByStatus), datasets: [{ data: Object.values(tasksByStatus), backgroundColor: ['#9CA3AF', '#3B82F6', '#10B981', '#F59E0B'] }] };
    const budgetData = { labels: ['Spent', 'Remaining'], datasets: [{ data: [budgetOverview.spent, budgetOverview.allocated - budgetOverview.spent], backgroundColor: ['#EF4444', '#10B981'] }] };
    return (
        <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard: {project.name}</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{project.description}</p>
          <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-4">
            {cardData.map(card => <Card key={card.title} {...card} />)}
          </div>
          <div className="grid grid-cols-1 gap-6 mt-8 lg:grid-cols-2">
            <div className="p-4 bg-white rounded-lg shadow-md dark:bg-dark-secondary"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Task Status</h2><Bar data={taskStatusData} /></div>
            <div className="p-4 bg-white rounded-lg shadow-md dark:bg-dark-secondary"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Budget Overview</h2><Pie data={budgetData} /></div>
          </div>
        </main>
    );
};

// Tasks Page
const TasksPage: React.FC<{ project: Project | null; tasks: Task[]; }> = ({ project, tasks }) => {
    if (!project) return <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark"><EmptyState title="No Project Selected" message="Please select a project to see tasks." /></main>;
    return (
        <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks for {project.name}</h1>
          {tasks.length === 0 ? <EmptyState title="No Tasks" message="Get started by creating a new task." /> : (
            <div className="mt-6 space-y-4">
              {tasks.map(task => (
                <div key={task.id} className="p-4 bg-white rounded-lg shadow dark:bg-dark-secondary">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{task.name}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${getStatusColor(task.status)}`}>{task.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">Due: {task.dueDate}</p>
                </div>
              ))}
            </div>
          )}
        </main>
    );
};

// Team Page
const TeamPage: React.FC<{ project: Project | null; team: TeamMember[]; }> = ({ project, team }) => {
    if (!project) return <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark"><EmptyState title="No Project Selected" message="Please select a project to see the team." /></main>;
    return (
        <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team for {project.name}</h1>
          {team.length === 0 ? <EmptyState title="No Team Members" message="Add team members to your project." /> : (
            <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow dark:bg-dark-secondary">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr><th scope="col" className="px-6 py-3">Name</th><th scope="col" className="px-6 py-3">Role</th><th scope="col" className="px-6 py-3">Email</th></tr>
                </thead>
                <tbody>
                  {team.map(member => (<tr key={member.id} className="bg-white border-b dark:bg-dark-secondary dark:border-gray-700"><th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{member.name}</th><td className="px-6 py-4">{member.role}</td><td className="px-6 py-4">{member.email}</td></tr>))}
                </tbody>
              </table>
            </div>
          )}
        </main>
    );
};

// Budget Page (with currency fix)
const BudgetPage: React.FC<{ project: Project | null; budget: BudgetItem[]; }> = ({ project, budget }) => {
    if (!project) return <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark"><EmptyState title="No Project Selected" message="Please select a project to see the budget." /></main>;
    const totalAllocated = budget.reduce((sum, item) => sum + item.allocated, 0);
    const totalSpent = budget.reduce((sum, item) => sum + item.spent, 0);
    return (
        <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget for {project.name}</h1>
          {budget.length === 0 ? <EmptyState title="No Budget Items" message="Add budget items to track project expenses." /> : (
            <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow dark:bg-dark-secondary">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr><th scope="col" className="px-6 py-3">Category</th><th scope="col" className="px-6 py-3">Allocated</th><th scope="col" className="px-6 py-3">Spent</th><th scope="col" className="px-6 py-3">Remaining</th></tr>
                </thead>
                <tbody>
                  {budget.map(item => (<tr key={item.id} className="bg-white border-b dark:bg-dark-secondary dark:border-gray-700"><th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.category}</th><td className="px-6 py-4">{formatCurrencyEGP(item.allocated)}</td><td className="px-6 py-4">{formatCurrencyEGP(item.spent)}</td><td className="px-6 py-4">{formatCurrencyEGP(item.allocated - item.spent)}</td></tr>))}
                </tbody>
                <tfoot className="font-semibold text-gray-900 dark:text-white">
                  <tr className="border-t-2 dark:border-gray-700"><th scope="row" className="px-6 py-3 text-base">Total</th><td className="px-6 py-3">{formatCurrencyEGP(totalAllocated)}</td><td className="px-6 py-3">{formatCurrencyEGP(totalSpent)}</td><td className="px-6 py-3">{formatCurrencyEGP(totalAllocated - totalSpent)}</td></tr>
                </tfoot>
              </table>
            </div>
          )}
        </main>
    );
};

// Risks Page
const RisksPage: React.FC<{ project: Project | null; risks: Risk[]; }> = ({ project, risks }) => {
    if (!project) return <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark"><EmptyState title="No Project Selected" message="Please select a project to see the risks." /></main>;
    return (
        <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Risks for {project.name}</h1>
          {risks.length === 0 ? <EmptyState title="No Risks Identified" message="Add potential risks to your project." /> : (
            <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow dark:bg-dark-secondary">
               <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr><th scope="col" className="px-6 py-3">Description</th><th scope="col" className="px-6 py-3">Impact</th><th scope="col" className="px-6 py-3">Likelihood</th><th scope="col" className="px-6 py-3">Mitigation</th></tr>
                </thead>
                <tbody>
                  {risks.map(risk => (<tr key={risk.id} className="bg-white border-b dark:bg-dark-secondary dark:border-gray-700"><td className="px-6 py-4">{risk.description}</td><td className="px-6 py-4">{risk.impact}</td><td className="px-6 py-4">{risk.likelihood}</td><td className="px-6 py-4">{risk.mitigation}</td></tr>))}
                </tbody>
              </table>
            </div>
          )}
        </main>
    );
};

// Designs Page (Refactored)
const DesignsPage: React.FC<{ project: Project | null; designs: Design[]; onDelete: (design: Design) => void; onUpload: (file: File) => void; }> = ({ project, designs, onDelete, onUpload }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type === 'image/png') {
                setSelectedFile(file);
                setError(null);
            } else {
                setError('Only PNG files are allowed.');
                setSelectedFile(null);
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        setError(null);
        try {
            await onUpload(selectedFile);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err) {
            setError('File upload failed. Please try again.');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };
    
    if (!project) return <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark"><EmptyState title="No Project Selected" message="Please select a project to manage designs." /></main>;

    return (
        <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Designs for {project.name}</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Upload and manage design assets for your project.</p>

          <div className="p-4 my-6 bg-white rounded-lg shadow-md dark:bg-dark-secondary">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Upload New Design</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="design-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300">PNG File</label>
                <div className="flex items-center mt-1 space-x-2">
                    <input ref={fileInputRef} type="file" id="design-upload" accept="image/png" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary-dark hover:file:bg-indigo-200 dark:file:bg-gray-700 dark:file:text-gray-300 dark:hover:file:bg-gray-600"/>
                    <button onClick={handleUpload} disabled={!selectedFile || uploading} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-primary hover:bg-primary-dark disabled:bg-primary-light disabled:cursor-not-allowed">
                        {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Uploading...</> : <><UploadCloud className="w-4 h-4 mr-2"/> Upload</>}
                    </button>
                </div>
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
          </div>
          
          {designs.length === 0 ? <EmptyState title="No Designs Yet" message="Upload your first design using the form above." /> : (
            <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence>
              {designs.map(design => (
                <motion.div key={design.id} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="relative overflow-hidden bg-white rounded-lg shadow-md group dark:bg-dark-secondary">
                  <img src={design.imageUrl} alt={design.name} className="object-cover w-full h-48" />
                  <div className="p-4">
                    <p className="font-semibold text-gray-900 truncate dark:text-white" title={design.name}>{design.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Uploaded: {design.uploadedAt?.toDate().toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => onDelete(design)} className="absolute top-2 right-2 p-1.5 text-white bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"><Trash2 size={16}/></button>
                </motion.div>
              ))}
              </AnimatePresence>
            </div>
          )}
        </main>
    );
};


// 8. MAIN APP COMPONENT

const App: React.FC = () => {
    // Auth State
    const [user, setUser] = useState<User | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    // Global State
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // Data for selected project
    const [tasks, setTasks] = useState<Task[]>([]);
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [budget, setBudget] = useState<BudgetItem[]>([]);
    const [risks, setRisks] = useState<Risk[]>([]);
    const [designs, setDesigns] = useState<Design[]>([]);
    
    // Modal States
    const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
    
    // Auth Effect
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoadingAuth(false);
        });
        return () => unsubscribe();
    }, []);

    // Theme Effect
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    // Fetch Projects Effect
    useEffect(() => {
        if (!user) {
            setProjects([]);
            return;
        }
        const q = query(collection(db, "projects"), where("ownerId", "==", user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
            setProjects(projectsData);
            if (!selectedProjectId && projectsData.length > 0) {
                setSelectedProjectId(projectsData[0].id);
            } else if (projectsData.length === 0) {
                setSelectedProjectId(null);
            }
        });
        return () => unsubscribe();
    }, [user, selectedProjectId]);
    
    // Fetch Sub-collections Effect
    useEffect(() => {
        if (!selectedProjectId) {
            setTasks([]); setTeam([]); setBudget([]); setRisks([]); setDesigns([]);
            return;
        }
        const unsubscribers = [
            onSnapshot(collection(db, "projects", selectedProjectId, "tasks"), snap => setTasks(snap.docs.map(d => ({id: d.id, ...d.data()})) as Task[])),
            onSnapshot(collection(db, "projects", selectedProjectId, "team"), snap => setTeam(snap.docs.map(d => ({id: d.id, ...d.data()})) as TeamMember[])),
            onSnapshot(collection(db, "projects", selectedProjectId, "budget"), snap => setBudget(snap.docs.map(d => ({id: d.id, ...d.data()})) as BudgetItem[])),
            onSnapshot(collection(db, "projects", selectedProjectId, "risks"), snap => setRisks(snap.docs.map(d => ({id: d.id, ...d.data()})) as Risk[])),
            onSnapshot(collection(db, "projects", selectedProjectId, "designs"), snap => setDesigns(snap.docs.map(d => ({id: d.id, ...d.data()})) as Design[])),
        ];
        return () => unsubscribers.forEach(unsub => unsub());
    }, [selectedProjectId]);

    // Handlers
    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    const handleSignOut = () => signOut(auth);
    const handleNewProject = () => { setEditingProject(null); setIsNewProjectModalOpen(true); };
    
    const handleSaveProject = async (projectData: Omit<Project, 'id' | 'ownerId'>) => {
        if (!user) return;
        if (editingProject) {
            await updateDoc(doc(db, "projects", editingProject.id), projectData);
        } else {
            await addDoc(collection(db, "projects"), { ...projectData, ownerId: user.uid });
        }
        setIsNewProjectModalOpen(false);
        setEditingProject(null);
    };

    const handleDeleteProject = (id: string) => { setProjectToDelete(id); setIsConfirmModalOpen(true); };
    const confirmDeleteProject = async () => {
        if (projectToDelete) {
            // Firestore does not support deep deletes natively.
            // For a production app, a Cloud Function is recommended for this.
            // Here, we'll just delete the project doc for simplicity.
            await deleteDoc(doc(db, "projects", projectToDelete));
            setProjectToDelete(null);
        }
        setIsConfirmModalOpen(false);
    };

    const handleUploadDesign = async (file: File) => {
        if (!user || !selectedProjectId) return;
        const storagePath = `designs/${selectedProjectId}/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        await addDoc(collection(db, "projects", selectedProjectId, "designs"), {
            name: file.name,
            imageUrl: downloadURL,
            storagePath: storagePath,
            uploadedAt: serverTimestamp()
        });
    };

    const handleDeleteDesign = async (design: Design) => {
        if (!selectedProjectId) return;
        const storageRef = ref(storage, design.storagePath);
        await deleteObject(storageRef);
        await deleteDoc(doc(db, "projects", selectedProjectId, "designs", design.id));
    };

    const selectedProject = projects.find(p => p.id === selectedProjectId) || null;

    if (loadingAuth) {
        return <div className="flex items-center justify-center h-screen bg-light dark:bg-dark"><SkeletonLoader /></div>;
    }

    if (!user) {
        return <LoginPage />;
    }
  
    return (
        <BrowserRouter>
          <DashboardLayout user={user} projects={projects} selectedProjectId={selectedProjectId} onSelectProject={setSelectedProjectId} onNewProject={handleNewProject} onSignOut={handleSignOut} theme={theme} toggleTheme={toggleTheme}>
            <Routes>
              <Route path="/" element={<DashboardPage project={selectedProject} tasks={tasks} team={team} budget={budget} risks={risks} />} />
              <Route path="/tasks" element={<TasksPage project={selectedProject} tasks={tasks} />} />
              <Route path="/team" element={<TeamPage project={selectedProject} team={team} />} />
              <Route path="/budget" element={<BudgetPage project={selectedProject} budget={budget} />} />
              <Route path="/risks" element={<RisksPage project={selectedProject} risks={risks} />} />
              <Route path="/designs" element={<DesignsPage project={selectedProject} designs={designs} onDelete={handleDeleteDesign} onUpload={handleUploadDesign} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </DashboardLayout>
          <NewProjectModal isOpen={isNewProjectModalOpen} onClose={() => setIsNewProjectModalOpen(false)} onSave={handleSaveProject} editingProject={editingProject} />
          <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={confirmDeleteProject} title="Delete Project" message="Are you sure you want to delete this project? This action cannot be undone." />
        </BrowserRouter>
    );
};

// LoginPage Component
const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-light dark:bg-dark">
            <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-dark-secondary">
                <h1 className="text-2xl font-bold text-center text-primary">ProjectHub Login</h1>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="text-sm font-bold text-gray-600 dark:text-gray-300">Email</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 mt-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>
                    <div>
                        <label htmlFor="password"className="text-sm font-bold text-gray-600 dark:text-gray-300">Password</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 mt-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button type="submit" className="w-full py-2 text-white rounded bg-primary hover:bg-primary-dark">Log In</button>
                </form>
            </div>
        </div>
    );
};

export default App;
