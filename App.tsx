// Yoyo Project Management - Single File Application
// This file contains the entire refactored React application, including all components, pages, types, and logic.

// 1. IMPORTS
import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, Link } from 'react-router-dom';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { 
    getFirestore, collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, query, where, writeBatch, serverTimestamp, getDocs
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { 
    LayoutDashboard, Users, CheckSquare, Calendar, DollarSign, AlertTriangle, FileText, Image, Plus, Settings, X, 
    Search, Bell, LogOut, Menu, Sun, Moon, Loader2, UploadCloud, Trash2, Edit, Save, PackagePlus, User as UserIcon
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
const appId = firebaseConfig.projectId; // Use projectId as the identifier for the collection path

// 4. INTERNATIONALIZATION (i18n)
const translations = {
  en: {
    // General
    "save": "Save", "cancel": "Cancel", "delete": "Delete", "confirm": "Confirm", "edit": "Edit", "add": "Add",
    // Sidebar
    "dashboard": "Dashboard", "tasks": "Tasks", "team": "Team", "budget": "Budget", "risks": "Risks", "designs": "Designs", "projects": "Projects",
    // Header
    "signOut": "Sign Out", "profile": "Profile",
    // Login
    "loginTitle": "ProjectHub Login", "email": "Email", "password": "Password", "logIn": "Log In",
    // Modals
    "newProject": "New Project", "editProject": "Edit Project", "projectName": "Project Name", "description": "Description", "startDate": "Start Date", "endDate": "End Date", "createProject": "Create Project", "updateProject": "Update Project",
    "deleteProjectTitle": "Delete Project", "deleteProjectMessage": "Are you sure you want to delete this project? This will permanently delete all associated tasks, team members, budget items, risks, and designs. This action cannot be undone.",
    "deleteItemTitle": "Confirm Deletion", "deleteItemMessage": "Are you sure? This cannot be undone.",
    "addTask": "Add Task", "editTask": "Edit Task", "taskName": "Task Name", "status": "Status", "assignee": "Assignee", "dueDate": "Due Date",
    "addTeamMember": "Add Team Member", "editTeamMember": "Edit Team Member", "memberName": "Member Name", "role": "Role",
    "addBudgetItem": "Add Budget Item", "editBudgetItem": "Edit Budget Item", "category": "Category", "allocatedBudget": "Allocated Budget", "spentBudget": "Amount Spent",
    "addRisk": "Add Risk", "editRisk": "Edit Risk", "likelihood": "Likelihood", "impact": "Impact", "mitigation": "Mitigation Strategy",
    "editDesign": "Edit Design", "designName": "Design Name",
    // Pages
    "noProjectSelected": "No Project Selected", "noProjectMessage": "Please select a project to begin.",
    "dashboardTitle": "Dashboard: {projectName}",
    "totalTasks": "Total Tasks", "teamMembers": "Team Members", "openRisks": "Open Risks", "budgetSpent": "Budget Spent", "taskStatus": "Task Status", "budgetOverview": "Budget Overview",
    "tasksTitle": "Tasks for {projectName}", "noTasks": "No Tasks", "noTasksMessage": "Get started by creating a new task.",
    "teamTitle": "Team for {projectName}", "noTeam": "No Team Members", "noTeamMessage": "Add team members to your project.",
    "budgetTitle": "Budget for {projectName}", "noBudget": "No Budget Items", "noBudgetMessage": "Add budget items to track project expenses.", "allocated": "Allocated", "spent": "Spent", "remaining": "Remaining", "total": "Total",
    "risksTitle": "Risks for {projectName}", "noRisks": "No Risks Identified", "noRisksMessage": "Add potential risks to your project.",
    "designsTitle": "Designs for {projectName}", "designsMessage": "Upload and manage design assets for your project.", "uploadDesign": "Upload New Design", "pngFile": "PNG File", "upload": "Upload", "uploading": "Uploading...", "pngOnlyError": "Only PNG files are allowed.", "uploadError": "File upload failed. Please try again.", "noDesigns": "No Designs Yet", "noDesignsMessage": "Upload your first design using the form above.", "uploaded": "Uploaded",
    "profileTitle": "User Profile", "myTasks": "My Assigned Tasks", "myProjects": "My Projects", "achievements": "Achievements", "noAssignedTasks": "You have no tasks assigned to you.", "completedProjects": "Completed 5 projects.",
  },
  ar: {
    // General
    "save": "حفظ", "cancel": "إلغاء", "delete": "حذف", "confirm": "تأكيد", "edit": "تعديل", "add": "إضافة",
    // Sidebar
    "dashboard": "لوحة التحكم", "tasks": "المهام", "team": "الفريق", "budget": "الميزانية", "risks": "المخاطر", "designs": "التصاميم", "projects": "المشاريع",
    // Header
    "signOut": "تسجيل الخروج", "profile": "الملف الشخصي",
    // Login
    "loginTitle": "تسجيل الدخول - ProjectHub", "email": "البريد الإلكتروني", "password": "كلمة المرور", "logIn": "تسجيل الدخول",
    // Modals
    "newProject": "مشروع جديد", "editProject": "تعديل المشروع", "projectName": "اسم المشروع", "description": "الوصف", "startDate": "تاريخ البدء", "endDate": "تاريخ الانتهاء", "createProject": "إنشاء مشروع", "updateProject": "تحديث المشروع",
    "deleteProjectTitle": "حذف المشروع", "deleteProjectMessage": "هل أنت متأكد أنك تريد حذف هذا المشروع؟ سيؤدي هذا إلى حذف جميع المهام وأعضاء الفريق وبنود الميزانية والمخاطر والتصاميم المرتبطة به بشكل دائم. لا يمكن التراجع عن هذا الإجراء.",
    "deleteItemTitle": "تأكيد الحذف", "deleteItemMessage": "هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.",
    "addTask": "إضافة مهمة", "editTask": "تعديل المهمة", "taskName": "اسم المهمة", "status": "الحالة", "assignee": "المسؤول", "dueDate": "تاريخ الاستحقاق",
    "addTeamMember": "إضافة عضو للفريق", "editTeamMember": "تعديل عضو الفريق", "memberName": "اسم العضو", "role": "الدور",
    "addBudgetItem": "إضافة بند للميزانية", "editBudgetItem": "تعديل بند الميزانية", "category": "الفئة", "allocatedBudget": "الميزانية المخصصة", "spentBudget": "المبلغ المنفق",
    "addRisk": "إضافة مخاطرة", "editRisk": "تعديل المخاطرة", "likelihood": "الاحتمالية", "impact": "التأثير", "mitigation": "استراتيجية التخفيف",
    "editDesign": "تعديل التصميم", "designName": "اسم التصميم",
    // Pages
    "noProjectSelected": "لم يتم اختيار مشروع", "noProjectMessage": "يرجى اختيار مشروع للبدء.",
    "dashboardTitle": "لوحة التحكم: {projectName}",
    "totalTasks": "إجمالي المهام", "teamMembers": "أعضاء الفريق", "openRisks": "المخاطر القائمة", "budgetSpent": "الميزانية المنفقة", "taskStatus": "حالة المهام", "budgetOverview": "نظرة عامة على الميزانية",
    "tasksTitle": "مهام مشروع {projectName}", "noTasks": "لا توجد مهام", "noTasksMessage": "ابدأ بإنشاء مهمة جديدة.",
    "teamTitle": "فريق مشروع {projectName}", "noTeam": "لا يوجد أعضاء في الفريق", "noTeamMessage": "أضف أعضاء الفريق إلى مشروعك.",
    "budgetTitle": "ميزانية مشروع {projectName}", "noBudget": "لا توجد بنود في الميزانية", "noBudgetMessage": "أضف بنود الميزانية لتتبع نفقات المشروع.", "allocated": "المخصص", "spent": "المنفق", "remaining": "المتبقي", "total": "الإجمالي",
    "risksTitle": "مخاطر مشروع {projectName}", "noRisks": "لم يتم تحديد مخاطر", "noRisksMessage": "أضف المخاطر المحتملة لمشروعك.",
    "designsTitle": "تصاميم مشروع {projectName}", "designsMessage": "قم برفع وإدارة أصول التصميم لمشروعك.", "uploadDesign": "رفع تصميم جديد", "pngFile": "ملف PNG", "upload": "رفع", "uploading": "جاري الرفع...", "pngOnlyError": "يُسمح فقط بملفات PNG.", "uploadError": "فشل رفع الملف. يرجى المحاولة مرة أخرى.", "noDesigns": "لا توجد تصاميم بعد", "noDesignsMessage": "قم برفع تصميمك الأول باستخدام النموذج أعلاه.", "uploaded": "تم الرفع",
    "profileTitle": "الملف الشخصي للمستخدم", "myTasks": "المهام المسندة إلي", "myProjects": "مشاريعي", "achievements": "الإنجازات", "noAssignedTasks": "ليس لديك مهام مسندة إليك.", "completedProjects": "أكمل 5 مشاريع.",
  }
};

type Locale = 'en' | 'ar';

// 5. TYPE DEFINITIONS
export type Status = 'To Do' | 'In Progress' | 'Done' | 'Archived';

export interface Task {
  id: string;
  name: string;
  description: string;
  status: Status;
  dueDate: string;
  assigneeId?: string;
  projectId?: string; // For profile page
  projectName?: string; // for profile page
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
    id:string;
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

// 6. HELPER FUNCTIONS
export const formatDate = (dateString: string, locale: Locale): string => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', options);
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

export const formatCurrencyEGP = (amount: number, locale: Locale): string => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
        style: 'currency',
        currency: 'EGP',
        minimumFractionDigits: 0,
    }).format(amount).replace('EGP', 'E£');
};

// 7. UI & LAYOUT COMPONENTS

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

// LanguageSwitcher Component
const LanguageSwitcher: React.FC<{ locale: Locale; toggleLocale: () => void; }> = ({ locale, toggleLocale }) => (
    <motion.button
      onClick={toggleLocale}
      className="p-2 text-sm font-medium text-gray-500 rounded-full w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400"
      aria-label="Toggle Language"
      whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
    >
      {locale === 'en' ? 'AR' : 'EN'}
    </motion.button>
);


// Header Component
const Header: React.FC<{ user: User | null; onSignOut: () => void; onMenuClick: () => void; theme: 'light' | 'dark'; toggleTheme: () => void; locale: Locale; toggleLocale: () => void; t: (key: string) => string; }> = ({ user, onSignOut, onMenuClick, theme, toggleTheme, locale, toggleLocale, t }) => {
    return (
        <header className="flex items-center justify-between flex-shrink-0 h-16 px-4 bg-white border-b dark:bg-dark-secondary dark:border-gray-700">
          <div className="flex items-center">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onMenuClick} className="p-2 mr-2 text-gray-500 rounded-md lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700">
                <Menu size={24} />
            </motion.button>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <LanguageSwitcher locale={locale} toggleLocale={toggleLocale} />
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <Link to="/profile" title={t('profile')} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400">
              <UserIcon size={20} />
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center font-bold text-white bg-primary rounded-full">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden text-sm font-medium text-gray-700 md:block dark:text-gray-300">{user?.email}</span>
            </div>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onSignOut} title={t('signOut')} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400">
              <LogOut size={20} />
            </motion.button>
          </div>
        </header>
    );
};

// Sidebar Component
const Sidebar: React.FC<{ projects: Project[]; selectedProjectId: string | null; onSelectProject: (id: string) => void; onNewProject: () => void; onEditProject: (project: Project) => void; onDeleteProject: (id: string) => void; isOpen: boolean; onClose: () => void; t: (key: string) => string; }> = ({ projects, selectedProjectId, onSelectProject, onNewProject, onEditProject, onDeleteProject, isOpen, onClose, t }) => {
    const navLinks = [
        { name: t('dashboard'), icon: <LayoutDashboard size={20} />, path: '/' },
        { name: t('tasks'), icon: <CheckSquare size={20} />, path: '/tasks' },
        { name: t('team'), icon: <Users size={20} />, path: '/team' },
        { name: t('budget'), icon: <DollarSign size={20} />, path: '/budget' },
        { name: t('risks'), icon: <AlertTriangle size={20} />, path: '/risks' },
        { name: t('designs'), icon: <Image size={20} />, path: '/designs' },
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
                    <h2 className="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">{t('projects')}</h2>
                    <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={onNewProject} className="p-1 text-gray-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <Plus size={16} />
                    </motion.button>
                </div>
                <div className="mt-2 space-y-1">
                  {projects.map(project => (
                    <motion.div key={project.id} whileHover={{ x: 2 }} className="relative group">
                      <button onClick={() => { onSelectProject(project.id); onClose(); }}
                        className={`w-full text-left flex items-center px-4 py-2 text-sm font-medium rounded-md ${selectedProjectId === project.id ? 'bg-primary-light text-primary-dark font-semibold' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}>
                        <span className="flex-1 truncate">{project.name}</span>
                      </button>
                      <div className="absolute right-0 top-0 h-full flex items-center pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => {e.stopPropagation(); onEditProject(project);}} className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"><Edit size={14} /></button>
                          <button onClick={(e) => {e.stopPropagation(); onDeleteProject(project.id);}} className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"><Trash2 size={14} /></button>
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

// ConfirmationModal Component
const ConfirmationModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; t: (key: string) => string; }> = ({ isOpen, onClose, onConfirm, title, message, t }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl dark:bg-dark-secondary">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>
            <div className="flex justify-end mt-6 space-x-4">
              <motion.button onClick={onClose} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">{t('cancel')}</motion.button>
              <motion.button onClick={onConfirm} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">{t('confirm')}</motion.button>
            </div>
          </div>
        </div>
    );
};

// 8. CRUD MODAL COMPONENTS

// NewProjectModal Component
const NewProjectModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (project: Omit<Project, 'id' | 'ownerId'> | (Omit<Project, 'id' | 'ownerId'> & {id: string})) => void; editingProject: Project | null; t: (key: string) => string; }> = ({ isOpen, onClose, onSave, editingProject, t }) => {
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
      const projectData = { name, description, startDate, endDate };
      if (editingProject) {
        onSave({ ...projectData, id: editingProject.id });
      } else {
        onSave(projectData);
      }
      onClose();
    };
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-dark-secondary">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editingProject ? t('editProject') : t('newProject')}</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('projectName')}</label>
              <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('description')}</label>
              <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} required className="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('startDate')}</label>
                <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required className="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('endDate')}</label>
                <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} required className="block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
            </div>
            <div className="flex justify-end pt-4 space-x-4">
              <motion.button type="button" onClick={onClose} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">{t('cancel')}</motion.button>
              <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-primary-dark">{editingProject ? t('updateProject') : t('createProject')}</motion.button>
            </div>
          </form>
        </div>
      </div>
    );
};

// TaskModal Component
const TaskModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (task: Omit<Task, 'id'> | Task) => void; editingTask: Task | null; team: TeamMember[]; t: (key: string) => string; }> = ({ isOpen, onClose, onSave, editingTask, team, t }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<Status>('To Do');
    const [dueDate, setDueDate] = useState('');
    const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (editingTask) {
            setName(editingTask.name);
            setDescription(editingTask.description);
            setStatus(editingTask.status);
            setDueDate(new Date(editingTask.dueDate).toISOString().split('T')[0]);
            setAssigneeId(editingTask.assigneeId);
        } else {
            setName(''); setDescription(''); setStatus('To Do'); setDueDate(''); setAssigneeId(undefined);
        }
    }, [editingTask, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const taskData = { name, description, status, dueDate, assigneeId };
        onSave(editingTask ? { ...taskData, id: editingTask.id } : taskData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-dark-secondary">
                <h2 className="text-lg font-semibold">{editingTask ? t('editTask') : t('addTask')}</h2>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <input type="text" placeholder={t('taskName')} value={name} onChange={e => setName(e.target.value)} required className="w-full input"/>
                    <textarea placeholder={t('description')} value={description} onChange={e => setDescription(e.target.value)} required className="w-full input"></textarea>
                    <div className="grid grid-cols-2 gap-4">
                        <select value={status} onChange={e => setStatus(e.target.value as Status)} className="w-full input">
                            <option>To Do</option><option>In Progress</option><option>Done</option><option>Archived</option>
                        </select>
                        <select value={assigneeId || ''} onChange={e => setAssigneeId(e.target.value)} className="w-full input">
                            <option value="">{t('assignee')}</option>
                            {team.map(member => <option key={member.id} value={member.id}>{member.name}</option>)}
                        </select>
                    </div>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required className="w-full input"/>
                    <div className="flex justify-end pt-2 space-x-2">
                        <button type="button" onClick={onClose} className="btn-secondary">{t('cancel')}</button>
                        <button type="submit" className="btn-primary">{t('save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// TeamMemberModal Component
const TeamMemberModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (member: Omit<TeamMember, 'id'> | TeamMember) => void; editingMember: TeamMember | null; t: (key: string) => string; }> = ({ isOpen, onClose, onSave, editingMember, t }) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [email, setEmail] = useState('');
    const [avatar] = useState(''); // Avatar logic can be extended

    useEffect(() => {
        if (editingMember) {
            setName(editingMember.name);
            setRole(editingMember.role);
            setEmail(editingMember.email);
        } else {
            setName(''); setRole(''); setEmail('');
        }
    }, [editingMember, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const memberData = { name, role, email, avatar };
        onSave(editingMember ? { ...memberData, id: editingMember.id } : memberData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-dark-secondary">
                <h2 className="text-lg font-semibold">{editingMember ? t('editTeamMember') : t('addTeamMember')}</h2>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <input type="text" placeholder={t('memberName')} value={name} onChange={e => setName(e.target.value)} required className="w-full input"/>
                    <input type="text" placeholder={t('role')} value={role} onChange={e => setRole(e.target.value)} required className="w-full input"/>
                    <input type="email" placeholder={t('email')} value={email} onChange={e => setEmail(e.target.value)} required className="w-full input"/>
                    <div className="flex justify-end pt-2 space-x-2">
                        <button type="button" onClick={onClose} className="btn-secondary">{t('cancel')}</button>
                        <button type="submit" className="btn-primary">{t('save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// BudgetItemModal Component
const BudgetItemModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (item: Omit<BudgetItem, 'id'> | BudgetItem) => void; editingItem: BudgetItem | null; t: (key: string) => string; }> = ({ isOpen, onClose, onSave, editingItem, t }) => {
    const [category, setCategory] = useState('');
    const [allocated, setAllocated] = useState(0);
    const [spent, setSpent] = useState(0);

    useEffect(() => {
        if (editingItem) {
            setCategory(editingItem.category);
            setAllocated(editingItem.allocated);
            setSpent(editingItem.spent);
        } else {
            setCategory(''); setAllocated(0); setSpent(0);
        }
    }, [editingItem, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const itemData = { category, allocated: Number(allocated), spent: Number(spent) };
        onSave(editingItem ? { ...itemData, id: editingItem.id } : itemData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-dark-secondary">
                <h2 className="text-lg font-semibold">{editingItem ? t('editBudgetItem') : t('addBudgetItem')}</h2>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <input type="text" placeholder={t('category')} value={category} onChange={e => setCategory(e.target.value)} required className="w-full input"/>
                    <input type="number" placeholder={t('allocatedBudget')} value={allocated} onChange={e => setAllocated(Number(e.target.value))} required className="w-full input"/>
                    <input type="number" placeholder={t('spentBudget')} value={spent} onChange={e => setSpent(Number(e.target.value))} required className="w-full input"/>
                    <div className="flex justify-end pt-2 space-x-2">
                        <button type="button" onClick={onClose} className="btn-secondary">{t('cancel')}</button>
                        <button type="submit" className="btn-primary">{t('save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// RiskModal Component
const RiskModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (risk: Omit<Risk, 'id'> | Risk) => void; editingRisk: Risk | null; t: (key: string) => string; }> = ({ isOpen, onClose, onSave, editingRisk, t }) => {
    const [description, setDescription] = useState('');
    const [likelihood, setLikelihood] = useState<'Low' | 'Medium' | 'High'>('Medium');
    const [impact, setImpact] = useState<'Low' | 'Medium' | 'High'>('Medium');
    const [mitigation, setMitigation] = useState('');

    useEffect(() => {
        if (editingRisk) {
            setDescription(editingRisk.description);
            setLikelihood(editingRisk.likelihood);
            setImpact(editingRisk.impact);
            setMitigation(editingRisk.mitigation);
        } else {
            setDescription(''); setLikelihood('Medium'); setImpact('Medium'); setMitigation('');
        }
    }, [editingRisk, isOpen]);

    if (!isOpen) return null;
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const riskData = { description, likelihood, impact, mitigation };
        onSave(editingRisk ? { ...riskData, id: editingRisk.id } : riskData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-dark-secondary">
                <h2 className="text-lg font-semibold">{editingRisk ? t('editRisk') : t('addRisk')}</h2>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <textarea placeholder={t('description')} value={description} onChange={e => setDescription(e.target.value)} required className="w-full input"></textarea>
                    <select value={likelihood} onChange={e => setLikelihood(e.target.value as any)} className="w-full input"><option>Low</option><option>Medium</option><option>High</option></select>
                    <select value={impact} onChange={e => setImpact(e.target.value as any)} className="w-full input"><option>Low</option><option>Medium</option><option>High</option></select>
                    <textarea placeholder={t('mitigation')} value={mitigation} onChange={e => setMitigation(e.target.value)} required className="w-full input"></textarea>
                    <div className="flex justify-end pt-2 space-x-2">
                        <button type="button" onClick={onClose} className="btn-secondary">{t('cancel')}</button>
                        <button type="submit" className="btn-primary">{t('save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// DesignModal Component
const DesignModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (design: Pick<Design, 'id'|'name'>) => void; editingDesign: Design | null; t: (key: string) => string; }> = ({ isOpen, onClose, onSave, editingDesign, t }) => {
    const [name, setName] = useState('');

    useEffect(() => {
        if (editingDesign) setName(editingDesign.name);
        else setName('');
    }, [editingDesign, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingDesign) {
            onSave({ id: editingDesign.id, name });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-dark-secondary">
                <h2 className="text-lg font-semibold">{t('editDesign')}</h2>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <input type="text" placeholder={t('designName')} value={name} onChange={e => setName(e.target.value)} required className="w-full input"/>
                    <div className="flex justify-end pt-2 space-x-2">
                        <button type="button" onClick={onClose} className="btn-secondary">{t('cancel')}</button>
                        <button type="submit" className="btn-primary">{t('save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// DashboardLayout Component
const DashboardLayout: React.FC<{ children: React.ReactNode; user: User; projects: Project[]; selectedProjectId: string | null; onSelectProject: (id: string) => void; onNewProject: () => void; onEditProject: (project: Project) => void; onDeleteProject: (id: string) => void; onSignOut: () => void; theme: 'light' | 'dark'; toggleTheme: () => void; locale: Locale; toggleLocale: () => void; t: (key: string) => string; }> = (props) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    return (
        <div className="flex h-screen overflow-hidden bg-light dark:bg-dark">
          <Sidebar {...props} isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex flex-col flex-1 w-0 overflow-hidden">
            <Header {...props} onMenuClick={() => setSidebarOpen(true)} />
            {props.children}
          </div>
        </div>
    );
};

// 9. PAGE COMPONENTS

// Dashboard Page
const DashboardPage: React.FC<{ project: Project | null; tasks: Task[]; team: TeamMember[]; budget: BudgetItem[]; risks: Risk[]; t: (key: string) => string; locale: Locale; }> = ({ project, tasks, team, budget, risks, t, locale }) => {
    if (!project) return <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark"><EmptyState title={t('noProjectSelected')} message={t('noProjectMessage')} /></main>;
    const tasksByStatus = tasks.reduce((acc, task) => { acc[task.status] = (acc[task.status] || 0) + 1; return acc; }, {} as Record<string, number>);
    const budgetOverview = { allocated: budget.reduce((sum, item) => sum + item.allocated, 0), spent: budget.reduce((sum, item) => sum + item.spent, 0) };
    const cardData = [
        { title: t('totalTasks'), value: tasks.length.toString(), icon: <CheckSquare size={24} />, color: '#3B82F6' },
        { title: t('teamMembers'), value: team.length.toString(), icon: <Users size={24} />, color: '#10B981' },
        { title: t('openRisks'), value: risks.length.toString(), icon: <AlertTriangle size={24} />, color: '#F59E0B' },
        { title: t('budgetSpent'), value: formatCurrencyEGP(budgetOverview.spent, locale), icon: <DollarSign size={24} />, color: '#EF4444' },
    ];
    const taskStatusData = { labels: Object.keys(tasksByStatus), datasets: [{ data: Object.values(tasksByStatus), backgroundColor: ['#9CA3AF', '#3B82F6', '#10B981', '#F59E0B'] }] };
    const budgetData = { labels: [t('spent'), t('remaining')], datasets: [{ data: [budgetOverview.spent, budgetOverview.allocated - budgetOverview.spent], backgroundColor: ['#EF4444', '#10B981'] }] };
    return (
        <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboardTitle').replace('{projectName}', project.name)}</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{project.description}</p>
          <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-4">
            {cardData.map(card => <Card key={card.title} {...card} />)}
          </div>
          <div className="grid grid-cols-1 gap-6 mt-8 lg:grid-cols-2">
            <div className="p-4 bg-white rounded-lg shadow-md dark:bg-dark-secondary"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('taskStatus')}</h2><Bar data={taskStatusData} /></div>
            <div className="p-4 bg-white rounded-lg shadow-md dark:bg-dark-secondary"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('budgetOverview')}</h2><Pie data={budgetData} /></div>
          </div>
        </main>
    );
};

// Tasks Page
const TasksPage: React.FC<{ project: Project | null; tasks: Task[]; onNew: () => void; onEdit: (task: Task) => void; onDelete: (id: string) => void; t: (key: string) => string; locale: Locale; }> = ({ project, tasks, onNew, onEdit, onDelete, t, locale }) => {
    if (!project) return <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark"><EmptyState title={t('noProjectSelected')} message={t('noProjectMessage')} /></main>;
    return (
        <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('tasksTitle').replace('{projectName}', project.name)}</h1>
                <button onClick={onNew} className="btn-primary flex items-center dark:bg-primary dark:hover:bg-primary-dark"><Plus size={16} className="mr-2"/>{t('addTask')}</button>
            </div>
            {tasks.length === 0 ? <EmptyState title={t('noTasks')} message={t('noTasksMessage')} action={<button onClick={onNew} className="btn-primary">{t('addTask')}</button>} /> : (
                <div className="mt-6 space-y-4">
                {tasks.map(task => (
                    <div key={task.id} className="p-4 bg-white rounded-lg shadow dark:bg-dark-secondary">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">{task.name}</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">{t('dueDate')}: {formatDate(task.dueDate, locale)}</p>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0 ml-4">
                            <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${getStatusColor(task.status)}`}>{task.status}</span>
                            <div className="flex mt-4 space-x-2">
                                <button onClick={() => onEdit(task)} className="p-1 text-gray-500 hover:text-blue-600"><Edit size={16}/></button>
                                <button onClick={() => onDelete(task.id)} className="p-1 text-gray-500 hover:text-red-600"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    </div>
                    </div>
                ))}
                </div>
            )}
        </main>
    );
};

// Team Page
const TeamPage: React.FC<{ project: Project | null; team: TeamMember[]; onNew: () => void; onEdit: (member: TeamMember) => void; onDelete: (id: string) => void; t: (key: string) => string; }> = ({ project, team, onNew, onEdit, onDelete, t }) => {
    if (!project) return <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark"><EmptyState title={t('noProjectSelected')} message={t('noProjectMessage')} /></main>;
    return (
        <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('teamTitle').replace('{projectName}', project.name)}</h1>
                <button onClick={onNew} className="btn-primary flex items-center dark:bg-primary dark:hover:bg-primary-dark"><Plus size={16} className="mr-2"/>{t('addTeamMember')}</button>
            </div>
            {team.length === 0 ? <EmptyState title={t('noTeam')} message={t('noTeamMessage')} action={<button onClick={onNew} className="btn-primary">{t('addTeamMember')}</button>} /> : (
                <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow dark:bg-dark-secondary">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr><th scope="col" className="px-6 py-3">{t('memberName')}</th><th scope="col" className="px-6 py-3">{t('role')}</th><th scope="col" className="px-6 py-3">{t('email')}</th><th scope="col" className="px-6 py-3"></th></tr>
                    </thead>
                    <tbody>
                    {team.map(member => (<tr key={member.id} className="bg-white border-b dark:bg-dark-secondary dark:border-gray-700">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{member.name}</th>
                        <td className="px-6 py-4">{member.role}</td><td className="px-6 py-4">{member.email}</td>
                        <td className="flex justify-end px-6 py-4 space-x-2"><button onClick={() => onEdit(member)} className="p-1 text-gray-500 hover:text-blue-600"><Edit size={16}/></button><button onClick={() => onDelete(member.id)} className="p-1 text-gray-500 hover:text-red-600"><Trash2 size={16}/></button></td>
                    </tr>))}
                    </tbody>
                </table>
                </div>
            )}
        </main>
    );
};

// Budget Page
const BudgetPage: React.FC<{ project: Project | null; budget: BudgetItem[]; onNew: () => void; onEdit: (item: BudgetItem) => void; onDelete: (id: string) => void; t: (key: string) => string; locale: Locale; }> = ({ project, budget, onNew, onEdit, onDelete, t, locale }) => {
    if (!project) return <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark"><EmptyState title={t('noProjectSelected')} message={t('noProjectMessage')} /></main>;
    const totalAllocated = budget.reduce((sum, item) => sum + item.allocated, 0);
    const totalSpent = budget.reduce((sum, item) => sum + item.spent, 0);
    return (
        <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('budgetTitle').replace('{projectName}', project.name)}</h1>
                <button onClick={onNew} className="btn-primary flex items-center dark:bg-primary dark:hover:bg-primary-dark"><Plus size={16} className="mr-2"/>{t('addBudgetItem')}</button>
            </div>
            {budget.length === 0 ? <EmptyState title={t('noBudget')} message={t('noBudgetMessage')} action={<button onClick={onNew} className="btn-primary">{t('addBudgetItem')}</button>} /> : (
                <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow dark:bg-dark-secondary">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr><th scope="col" className="px-6 py-3">{t('category')}</th><th scope="col" className="px-6 py-3">{t('allocated')}</th><th scope="col" className="px-6 py-3">{t('spent')}</th><th scope="col" className="px-6 py-3">{t('remaining')}</th><th scope="col" className="px-6 py-3"></th></tr>
                    </thead>
                    <tbody>
                    {budget.map(item => (<tr key={item.id} className="bg-white border-b dark:bg-dark-secondary dark:border-gray-700">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.category}</th>
                        <td className="px-6 py-4">{formatCurrencyEGP(item.allocated, locale)}</td><td className="px-6 py-4">{formatCurrencyEGP(item.spent, locale)}</td><td className="px-6 py-4">{formatCurrencyEGP(item.allocated - item.spent, locale)}</td>
                        <td className="flex justify-end px-6 py-4 space-x-2"><button onClick={() => onEdit(item)} className="p-1 text-gray-500 hover:text-blue-600"><Edit size={16}/></button><button onClick={() => onDelete(item.id)} className="p-1 text-gray-500 hover:text-red-600"><Trash2 size={16}/></button></td>
                    </tr>))}
                    </tbody>
                    <tfoot className="font-semibold text-gray-900 dark:text-white">
                    <tr className="border-t-2 dark:border-gray-700"><th scope="row" className="px-6 py-3 text-base">{t('total')}</th><td className="px-6 py-3">{formatCurrencyEGP(totalAllocated, locale)}</td><td className="px-6 py-3">{formatCurrencyEGP(totalSpent, locale)}</td><td className="px-6 py-3">{formatCurrencyEGP(totalAllocated - totalSpent, locale)}</td><td></td></tr>
                    </tfoot>
                </table>
                </div>
            )}
        </main>
    );
};

// Risks Page
const RisksPage: React.FC<{ project: Project | null; risks: Risk[]; onNew: () => void; onEdit: (risk: Risk) => void; onDelete: (id: string) => void; t: (key: string) => string; }> = ({ project, risks, onNew, onEdit, onDelete, t }) => {
    if (!project) return <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark"><EmptyState title={t('noProjectSelected')} message={t('noProjectMessage')} /></main>;
    return (
        <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('risksTitle').replace('{projectName}', project.name)}</h1>
                <button onClick={onNew} className="btn-primary flex items-center dark:bg-primary dark:hover:bg-primary-dark"><Plus size={16} className="mr-2"/>{t('addRisk')}</button>
            </div>
            {risks.length === 0 ? <EmptyState title={t('noRisks')} message={t('noRisksMessage')} action={<button onClick={onNew} className="btn-primary">{t('addRisk')}</button>} /> : (
                <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow dark:bg-dark-secondary">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr><th scope="col" className="px-6 py-3">{t('description')}</th><th scope="col" className="px-6 py-3">{t('impact')}</th><th scope="col" className="px-6 py-3">{t('likelihood')}</th><th scope="col" className="px-6 py-3">{t('mitigation')}</th><th scope="col" className="px-6 py-3"></th></tr>
                    </thead>
                    <tbody>
                    {risks.map(risk => (<tr key={risk.id} className="bg-white border-b dark:bg-dark-secondary dark:border-gray-700">
                        <td className="px-6 py-4">{risk.description}</td><td className="px-6 py-4">{risk.impact}</td><td className="px-6 py-4">{risk.likelihood}</td><td className="px-6 py-4">{risk.mitigation}</td>
                        <td className="flex justify-end px-6 py-4 space-x-2"><button onClick={() => onEdit(risk)} className="p-1 text-gray-500 hover:text-blue-600"><Edit size={16}/></button><button onClick={() => onDelete(risk.id)} className="p-1 text-gray-500 hover:text-red-600"><Trash2 size={16}/></button></td>
                    </tr>))}
                    </tbody>
                </table>
                </div>
            )}
        </main>
    );
};

// Designs Page
const DesignsPage: React.FC<{ project: Project | null; designs: Design[]; onDelete: (design: Design) => void; onUpload: (file: File) => void; onEdit: (design: Design) => void; t: (key: string) => string; locale: Locale; }> = ({ project, designs, onDelete, onUpload, onEdit, t, locale }) => {
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
                setError(t('pngOnlyError'));
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
            setError(t('uploadError'));
            console.error(err);
        } finally {
            setUploading(false);
        }
    };
    
    if (!project) return <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark"><EmptyState title={t('noProjectSelected')} message={t('noProjectMessage')} /></main>;

    return (
        <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('designsTitle').replace('{projectName}', project.name)}</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t('designsMessage')}</p>
          <div className="p-4 my-6 bg-white rounded-lg shadow-md dark:bg-dark-secondary">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('uploadDesign')}</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="design-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('pngFile')}</label>
                <div className="flex items-center mt-1 space-x-2">
                    <input ref={fileInputRef} type="file" id="design-upload" accept="image/png" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-primary-dark hover:file:bg-indigo-200 dark:file:bg-gray-700 dark:file:text-gray-300 dark:hover:file:bg-gray-600"/>
                    <button onClick={handleUpload} disabled={!selectedFile || uploading} className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-primary hover:bg-primary-dark disabled:bg-primary-light disabled:cursor-not-allowed">
                        {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/>{t('uploading')}</> : <><UploadCloud className="w-4 h-4 mr-2"/> {t('upload')}</>}
                    </button>
                </div>
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
          </div>
          
          {designs.length === 0 ? <EmptyState title={t('noDesigns')} message={t('noDesignsMessage')} /> : (
            <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence>
              {designs.map(design => (
                <motion.div key={design.id} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="relative overflow-hidden bg-white rounded-lg shadow-md group dark:bg-dark-secondary">
                  <img src={design.imageUrl} alt={design.name} className="object-cover w-full h-48" />
                  <div className="p-4">
                    <p className="font-semibold text-gray-900 truncate dark:text-white" title={design.name}>{design.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('uploaded')}: {design.uploadedAt?.toDate().toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}</p>
                  </div>
                  <div className="absolute top-2 right-2 flex space-x-1 p-1.5 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(design)} className="text-white hover:text-blue-300"><Edit size={16}/></button>
                    <button onClick={() => onDelete(design)} className="text-white hover:text-red-300"><Trash2 size={16}/></button>
                  </div>
                </motion.div>
              ))}
              </AnimatePresence>
            </div>
          )}
        </main>
    );
};

// Profile Page
const ProfilePage: React.FC<{ user: User; projects: Project[]; t: (key: string) => string; locale: Locale; }> = ({ user, projects, t, locale }) => {
    const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            if (!user) return;
            setLoading(true);
            const allTasks: Task[] = [];
            for (const project of projects) {
                const q = query(collection(db, "artifacts", appId, "public", "data", "projects", project.id, "tasks"), where("assigneeId", "==", user.uid));
                const querySnapshot = await getDocs(q);
                querySnapshot.forEach(doc => {
                    allTasks.push({ id: doc.id, ...doc.data(), projectId: project.id, projectName: project.name } as Task);
                });
            }
            setAssignedTasks(allTasks);
            setLoading(false);
        };
        fetchTasks();
    }, [user, projects]);

    return (
        <main className="flex-1 p-6 overflow-y-auto bg-light dark:bg-dark">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('profileTitle')}</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
            <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
                <div className="p-4 bg-white rounded-lg shadow-md dark:bg-dark-secondary">
                    <h2 className="text-lg font-semibold">{t('myTasks')}</h2>
                    {loading ? <SkeletonLoader /> : assignedTasks.length === 0 ? <p className="mt-2 text-sm text-gray-500">{t('noAssignedTasks')}</p> : (
                        <ul className="mt-2 space-y-2">
                            {assignedTasks.map(task => (
                                <li key={task.id} className="p-2 border rounded dark:border-gray-700">
                                    <p className="font-semibold">{task.name}</p>
                                    <p className="text-xs text-gray-500">{task.projectName}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="p-4 bg-white rounded-lg shadow-md dark:bg-dark-secondary">
                    <h2 className="text-lg font-semibold">{t('myProjects')}</h2>
                    <ul className="mt-2 space-y-2">
                        {projects.map(p => <li key={p.id}>{p.name}</li>)}
                    </ul>
                    <h2 className="mt-6 text-lg font-semibold">{t('achievements')}</h2>
                    <p className="mt-2 text-sm">{t('completedProjects')}</p>
                </div>
            </div>
        </main>
    );
};

// 10. MAIN APP COMPONENT

const App: React.FC = () => {
    // Auth & Global State
    const [user, setUser] = useState<User | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [locale, setLocale] = useState<Locale>('en');

    // Data for selected project
    const [tasks, setTasks] = useState<Task[]>([]);
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [budget, setBudget] = useState<BudgetItem[]>([]);
    const [risks, setRisks] = useState<Risk[]>([]);
    const [designs, setDesigns] = useState<Design[]>([]);
    
    // Modal States
    const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isTeamMemberModalOpen, setIsTeamMemberModalOpen] = useState(false);
    const [isBudgetItemModalOpen, setIsBudgetItemModalOpen] = useState(false);
    const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
    const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    
    // Editing States
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const [editingBudgetItem, setEditingBudgetItem] = useState<BudgetItem | null>(null);
    const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
    const [editingDesign, setEditingDesign] = useState<Design | null>(null);
    
    // Deletion State
    const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string | Design } | null>(null);
    
    // i18n function
    const t = (key: string) => translations[locale][key] || key;

    // Effects
    useEffect(() => {
        onAuthStateChanged(auth, (user) => { setUser(user); setLoadingAuth(false); });
        document.documentElement.classList.toggle('dark', theme === 'dark');
        document.documentElement.lang = locale;
        document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    }, [theme, locale]);

    useEffect(() => {
        if (!user) { setProjects([]); return; }
        const q = query(collection(db, "artifacts", appId, "public", "data", "projects"), where("ownerId", "==", user.uid));
        return onSnapshot(q, (snapshot) => {
            const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
            setProjects(projectsData);
            if (!selectedProjectId && projectsData.length > 0) {
                setSelectedProjectId(projectsData[0].id);
            } else if (projectsData.length === 0) {
                setSelectedProjectId(null);
            } else if (selectedProjectId && !projectsData.some(p => p.id === selectedProjectId)) {
                // If the selected project was deleted, select the first one or null
                setSelectedProjectId(projectsData.length > 0 ? projectsData[0].id : null);
            }
        });
    }, [user, selectedProjectId]);
    
    useEffect(() => {
        if (!selectedProjectId) { setTasks([]); setTeam([]); setBudget([]); setRisks([]); setDesigns([]); return; }
        const subCollections = ["tasks", "team", "budget", "risks", "designs"];
        const setters:any = { tasks: setTasks, team: setTeam, budget: setBudget, risks: setRisks, designs: setDesigns };

        const unsubs = subCollections.map(col => 
            onSnapshot(collection(db, "artifacts", appId, "public", "data", "projects", selectedProjectId, col), snapshot => {
                const data = snapshot.docs.map(d => ({id: d.id, ...d.data()}));
                setters[col](data);
            })
        );
        return () => unsubs.forEach(unsub => unsub());
    }, [selectedProjectId]);

    // Handlers
    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    const toggleLocale = () => setLocale(prev => prev === 'en' ? 'ar' : 'en');
    const handleSignOut = () => signOut(auth);
    
    const handleSave = async (type: string, data: any) => {
        if (!user || !selectedProjectId) return;
        const { id, ...payload } = data;
        const collectionPath = ["artifacts", appId, "public", "data", "projects", selectedProjectId, type];
        try {
            if (id) {
                await updateDoc(doc(db, ...collectionPath, id), payload);
            } else {
                await addDoc(collection(db, ...collectionPath), payload);
            }
        } catch (error) {
            console.error("Error saving item:", error);
        }
    };
    
    const handleSaveProject = async (projectData: any) => {
        if (!user) return;
        const { id, ...payload } = projectData;
        const projectsPath = ["artifacts", appId, "public", "data", "projects"];
        if (id) {
            await updateDoc(doc(db, ...projectsPath, id), payload);
        } else {
            const newDocRef = await addDoc(collection(db, ...projectsPath), { ...payload, ownerId: user.uid });
            setSelectedProjectId(newDocRef.id);
        }
    };
    
    const handleEditProject = (project: Project) => {
      setEditingProject(project);
      setIsNewProjectModalOpen(true);
    };

    const handleDelete = (type: string, id: string | Design) => { setItemToDelete({ type, id }); setIsConfirmModalOpen(true); };
    
    const confirmDelete = async () => {
        if (!itemToDelete) return;

        const { type, id } = itemToDelete;

        if (type === 'project' && typeof id === 'string') {
            const subCollections = ['tasks', 'team', 'budget', 'risks', 'designs'];
            const batch = writeBatch(db);

            for (const subCollection of subCollections) {
                const subCollectionRef = collection(db, "artifacts", appId, "public", "data", "projects", id, subCollection);
                const snapshot = await getDocs(subCollectionRef);
                snapshot.docs.forEach(doc => batch.delete(doc.ref));
            }
            batch.delete(doc(db, "artifacts", appId, "public", "data", "projects", id));
            await batch.commit();

        } else if (selectedProjectId && typeof id === 'string') {
            const collectionPath = ["artifacts", appId, "public", "data", "projects", selectedProjectId, type];
            await deleteDoc(doc(db, ...collectionPath, id));
        } else if (type === 'designs' && typeof id === 'object' && selectedProjectId) {
            const design = id as Design;
            await deleteObject(ref(storage, design.storagePath));
            await deleteDoc(doc(db, "artifacts", appId, "public", "data", "projects", selectedProjectId, "designs", design.id));
        }
        
        setItemToDelete(null);
        setIsConfirmModalOpen(false);
    };

    const handleUploadDesign = async (file: File) => {
        if (!user || !selectedProjectId) return;
        const storagePath = `designs/${selectedProjectId}/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        await addDoc(collection(db, "artifacts", appId, "public", "data", "projects", selectedProjectId, "designs"), {
            name: file.name, imageUrl: downloadURL, storagePath: storagePath, uploadedAt: serverTimestamp()
        });
    };

    const handleSaveDesignName = async (design: Pick<Design, 'id'|'name'>) => {
        if (selectedProjectId) await updateDoc(doc(db, "artifacts", appId, "public", "data", "projects", selectedProjectId, "designs", design.id), { name: design.name });
    };

    const selectedProject = projects.find(p => p.id === selectedProjectId) || null;

    if (loadingAuth) return <div className="flex items-center justify-center h-screen bg-light dark:bg-dark"><SkeletonLoader /></div>;
    if (!user) return <LoginPage t={t} />;
  
    return (
        <BrowserRouter>
          <DashboardLayout user={user} projects={projects} selectedProjectId={selectedProjectId} onSelectProject={setSelectedProjectId} onNewProject={() => { setEditingProject(null); setIsNewProjectModalOpen(true); }} onEditProject={handleEditProject} onDeleteProject={(id) => handleDelete('project', id)} onSignOut={handleSignOut} theme={theme} toggleTheme={toggleTheme} locale={locale} toggleLocale={toggleLocale} t={t}>
            <Routes>
              <Route path="/" element={<DashboardPage project={selectedProject} tasks={tasks} team={team} budget={budget} risks={risks} t={t} locale={locale} />} />
              <Route path="/tasks" element={<TasksPage project={selectedProject} tasks={tasks} onNew={() => { setEditingTask(null); setIsTaskModalOpen(true); }} onEdit={(task) => { setEditingTask(task); setIsTaskModalOpen(true); }} onDelete={(id) => handleDelete('tasks', id)} t={t} locale={locale} />} />
              <Route path="/team" element={<TeamPage project={selectedProject} team={team} onNew={() => { setEditingMember(null); setIsTeamMemberModalOpen(true); }} onEdit={(member) => { setEditingMember(member); setIsTeamMemberModalOpen(true); }} onDelete={(id) => handleDelete('team', id)} t={t} />} />
              <Route path="/budget" element={<BudgetPage project={selectedProject} budget={budget} onNew={() => { setEditingBudgetItem(null); setIsBudgetItemModalOpen(true); }} onEdit={(item) => { setEditingBudgetItem(item); setIsBudgetItemModalOpen(true); }} onDelete={(id) => handleDelete('budget', id)} t={t} locale={locale} />} />
              <Route path="/risks" element={<RisksPage project={selectedProject} risks={risks} onNew={() => { setEditingRisk(null); setIsRiskModalOpen(true); }} onEdit={(risk) => { setEditingRisk(risk); setIsRiskModalOpen(true); }} onDelete={(id) => handleDelete('risks', id)} t={t} />} />
              <Route path="/designs" element={<DesignsPage project={selectedProject} designs={designs} onDelete={(design) => handleDelete('designs', design)} onUpload={handleUploadDesign} onEdit={(design) => { setEditingDesign(design); setIsDesignModalOpen(true); }} t={t} locale={locale} />} />
              <Route path="/profile" element={<ProfilePage user={user} projects={projects} t={t} locale={locale} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </DashboardLayout>
          
          {/* Modals */}
          <NewProjectModal isOpen={isNewProjectModalOpen} onClose={() => setIsNewProjectModalOpen(false)} onSave={handleSaveProject} editingProject={editingProject} t={t} />
          <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} onSave={(data) => handleSave('tasks', data)} editingTask={editingTask} team={team} t={t} />
          <TeamMemberModal isOpen={isTeamMemberModalOpen} onClose={() => setIsTeamMemberModalOpen(false)} onSave={(data) => handleSave('team', data)} editingMember={editingMember} t={t} />
          <BudgetItemModal isOpen={isBudgetItemModalOpen} onClose={() => setIsBudgetItemModalOpen(false)} onSave={(data) => handleSave('budget', data)} editingItem={editingBudgetItem} t={t} />
          <RiskModal isOpen={isRiskModalOpen} onClose={() => setIsRiskModalOpen(false)} onSave={(data) => handleSave('risks', data)} editingRisk={editingRisk} t={t} />
          <DesignModal isOpen={isDesignModalOpen} onClose={() => setIsDesignModalOpen(false)} onSave={handleSaveDesignName} editingDesign={editingDesign} t={t} />
          <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={confirmDelete} title={itemToDelete?.type === 'project' ? t('deleteProjectTitle') : t('deleteItemTitle')} message={itemToDelete?.type === 'project' ? t('deleteProjectMessage') : t('deleteItemMessage')} t={t} />
        </BrowserRouter>
    );
};

// LoginPage Component
const LoginPage: React.FC<{t: (key: string) => string}> = ({ t }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); setError('');
        try { await signInWithEmailAndPassword(auth, email, password); } catch (err: any) { setError(err.message); }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-light dark:bg-dark">
            <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-dark-secondary">
                <h1 className="text-2xl font-bold text-center text-primary">{t('loginTitle')}</h1>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="text-sm font-bold text-gray-600 dark:text-gray-300">{t('email')}</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 mt-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>
                    <div>
                        <label htmlFor="password"className="text-sm font-bold text-gray-600 dark:text-gray-300">{t('password')}</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 mt-1 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" required />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button type="submit" className="w-full py-2 text-white rounded bg-primary hover:bg-primary-dark">{t('logIn')}</button>
                </form>
            </div>
        </div>
    );
};

export default App;
// A set of generic styles for modals to use to avoid repetition
const modalInputStyle = "block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white";
const modalBtnPrimary = "px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-primary-dark";
const modalBtnSecondary = "px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600";
const modalLabelStyle = "block text-sm font-medium text-gray-700 dark:text-gray-300";

// Adding some global styles via a style tag for convenience, as requested not to change files.
// This is not standard practice for React but adheres to the single-file constraint.
const globalStyles = `
  .input { ${modalInputStyle.replace(/"/g, "'")} }
  .btn-primary { ${modalBtnPrimary.replace(/"/g, "'")} }
  .btn-secondary { ${modalBtnSecondary.replace(/"/g, "'")} }
  .label { ${modalLabelStyle.replace(/"/g, "'")} }
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = globalStyles;
document.head.appendChild(styleSheet);