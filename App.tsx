
// Yoyo Project Management - Single File Application
// This file contains the entire refactored React application, including all components, pages, types, and logic.

// 1. IMPORTS
import React, { useState, useEffect, useRef, ReactNode, createContext, useContext, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, Link } from 'react-router-dom';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { 
    getFirestore, collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, query, where, writeBatch, serverTimestamp, getDocs, orderBy
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { 
    LayoutDashboard, Users, CheckSquare, Calendar, DollarSign, AlertTriangle, FileText, Image, Plus, Settings, X, 
    Search, Bell, LogOut, Menu, Sun, Moon, UploadCloud, Trash2, Edit, Save, PackagePlus, User as UserIcon, AlertCircle, CheckCircle, Info, Link2, ChevronDown
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
  storageBucket: "yoyo-projects-management.firebasestorage.app", // Corrected storage bucket URL
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
    "save": "Save", "cancel": "Cancel", "delete": "Delete", "confirm": "Confirm", "edit": "Edit", "add": "Add", "urgent": "Urgent", "high": "High", "medium": "Medium", "low": "Low", "priority": "Priority", "parentTask": "Parent Task", "parent": "Parent",
    // Sidebar
    "dashboard": "Dashboard", "tasks": "Tasks", "team": "Team", "budget": "Budget", "risks": "Risks", "designs": "Designs", "projects": "Projects", "settings": "Settings", "reports": "Reports",
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
    "parentTaskNotDoneError": "Cannot complete this task. Please finish parent task '{parentTaskName}' first.",
    // Pages
    "noProjectSelected": "No Project Selected", "noProjectMessage": "Please select a project to begin.",
    "dashboardTitle": "Dashboard: {projectName}",
    "totalTasks": "Total Tasks", "teamMembers": "Team Members", "openRisks": "Open Risks", "budgetSpent": "Budget Spent", "taskStatus": "Task Status", "budgetOverview": "Budget Overview",
    "tasksTitle": "Tasks for {projectName}", "noTasks": "No Tasks", "noTasksMessage": "Get started by creating a new task.",
    "teamTitle": "Team for {projectName}", "noTeam": "No Team Members", "noTeamMessage": "Add team members to your project.",
    "budgetTitle": "Budget for {projectName}", "noBudget": "No Budget Items", "noBudgetMessage": "Add budget items to track project expenses.", "allocated": "Allocated", "spent": "Spent", "remaining": "Remaining", "total": "Total",
    "risksTitle": "Risks for {projectName}", "noRisks": "No Risks Identified", "noRisksMessage": "Add potential risks to your project.",
    "designsTitle": "Designs for {projectName}", "designsMessage": "Upload and manage design assets for your project.", "uploadDesign": "Upload New Design", "pngFile": "PNG File", "upload": "Upload", "uploading": "Uploading...", "pngOnlyError": "Only PNG files are allowed.", "uploadError": "File upload failed. Please try again.", "uploadSuccess": "Upload successful!", "noDesigns": "No Designs Yet", "noDesignsMessage": "Upload your first design using the form above.", "uploaded": "Uploaded",
    "profileTitle": "User Profile", "myTasks": "My Assigned Tasks", "myProjects": "My Projects", "achievements": "Achievements", "noAssignedTasks": "You have no tasks assigned to you.", "achievementCompletedProjects": "Completed {count} projects.",
    "settingsTitle": "Settings & Activity Log", "activityLog": "Activity Log", "noActivity": "No activity recorded yet.",
    "reportsTitle": "Reports for {projectName}", "projectSummary": "Project Summary", "exportToCsv": "Export to CSV", "exportToPdf": "Export to PDF",
    // Task Page enhancements
    "filterByAssignee": "Filter by assignee", "filterByStatus": "Filter by status", "sortBy": "Sort By", "priorityDesc": "Priority (High to Low)", "priorityAsc": "Priority (Low to High)", "dueDateSort": "Due Date",
    // Task Statuses
    "toDo": "To Do", "inProgress": "In Progress", "done": "Done", "archived": "Archived"
  },
  ar: {
    // General
    "save": "حفظ", "cancel": "إلغاء", "delete": "حذف", "confirm": "تأكيد", "edit": "تعديل", "add": "إضافة", "urgent": "عاجل", "high": "مرتفع", "medium": "متوسط", "low": "منخفض", "priority": "الأولوية", "parentTask": "المهمة الرئيسية", "parent": "رئيسي",
    // Sidebar
    "dashboard": "لوحة التحكم", "tasks": "المهام", "team": "الفريق", "budget": "الميزانية", "risks": "المخاطر", "designs": "التصاميم", "projects": "المشاريع", "settings": "الإعدادات", "reports": "التقارير",
    // Header
    "signOut": "تسجيل الخروج", "profile": "الملف الشخصي",
    // Login
    "loginTitle": "تسجيل الدخول إلى ProjectHub", "email": "البريد الإلكتروني", "password": "كلمة المرور", "logIn": "تسجيل الدخول",
    // Modals
    "newProject": "مشروع جديد", "editProject": "تعديل المشروع", "projectName": "اسم المشروع", "description": "الوصف", "startDate": "تاريخ البدء", "endDate": "تاريخ الانتهاء", "createProject": "إنشاء مشروع", "updateProject": "تحديث المشروع",
    "deleteProjectTitle": "حذف المشروع", "deleteProjectMessage": "هل أنت متأكد أنك تريد حذف هذا المشروع؟ سيؤدي هذا إلى حذف جميع المهام وأعضاء الفريق وبنود الميزانية والمخاطر والتصاميم المرتبطة به بشكل دائم. لا يمكن التراجع عن هذا الإجراء.",
    "deleteItemTitle": "تأكيد الحذف", "deleteItemMessage": "هل أنت متأكد؟ لا يمكن التراجع عن هذا.",
    "addTask": "إضافة مهمة", "editTask": "تعديل المهمة", "taskName": "اسم المهمة", "status": "الحالة", "assignee": "المسؤول", "dueDate": "تاريخ الاستحقاق",
    "addTeamMember": "إضافة عضو للفريق", "editTeamMember": "تعديل عضو الفريق", "memberName": "اسم العضو", "role": "الدور",
    "addBudgetItem": "إضافة بند ميزانية", "editBudgetItem": "تعديل بند الميزانية", "category": "الفئة", "allocatedBudget": "الميزانية المخصصة", "spentBudget": "المبلغ المصروف",
    "addRisk": "إضافة مخاطرة", "editRisk": "تعديل المخاطرة", "likelihood": "الاحتمالية", "impact": "التأثير", "mitigation": "استراتيجية التخفيف",
    "editDesign": "تعديل التصميم", "designName": "اسم التصميم",
    "parentTaskNotDoneError": "لا يمكن إكمال هذه المهمة. يرجى إنهاء المهمة الرئيسية '{parentTaskName}' أولاً.",
    // Pages
    "noProjectSelected": "لم يتم تحديد مشروع", "noProjectMessage": "يرجى تحديد مشروع للبدء.",
    "dashboardTitle": "لوحة التحكم: {projectName}",
    "totalTasks": "إجمالي المهام", "teamMembers": "أعضاء الفريق", "openRisks": "المخاطر القائمة", "budgetSpent": "الميزانية المصروفة", "taskStatus": "حالة المهام", "budgetOverview": "نظرة عامة على الميزانية",
    "tasksTitle": "مهام مشروع {projectName}", "noTasks": "لا توجد مهام", "noTasksMessage": "ابدأ بإنشاء مهمة جديدة.",
    "teamTitle": "فريق مشروع {projectName}", "noTeam": "لا يوجد أعضاء في الفريق", "noTeamMessage": "أضف أعضاء الفريق إلى مشروعك.",
    "budgetTitle": "ميزانية مشروع {projectName}", "noBudget": "لا توجد بنود في الميزانية", "noBudgetMessage": "أضف بنود الميزانية لتتبع نفقات المشروع.", "allocated": "المخصص", "spent": "المصروف", "remaining": "المتبقي", "total": "الإجمالي",
    "risksTitle": "مخاطر مشروع {projectName}", "noRisks": "لم يتم تحديد مخاطر", "noRisksMessage": "أضف المخاطر المحتملة لمشروعك.",
    "designsTitle": "تصاميم مشروع {projectName}", "designsMessage": "قم بتحميل وإدارة أصول التصميم لمشروعك.", "uploadDesign": "تحميل تصميم جديد", "pngFile": "ملف PNG", "upload": "تحميل", "uploading": "جاري التحميل...", "pngOnlyError": "يُسمح بملفات PNG فقط.", "uploadError": "فشل تحميل الملف. يرجى المحاولة مرة أخرى.", "uploadSuccess": "تم التحميل بنجاح!", "noDesigns": "لا توجد تصاميم بعد", "noDesignsMessage": "قم بتحميل تصميمك الأول باستخدام النموذج أعلاه.", "uploaded": "تم الرفع",
    "profileTitle": "الملف الشخصي للمستخدم", "myTasks": "المهام المسندة إلي", "myProjects": "مشاريعي", "achievements": "الإنجازات", "noAssignedTasks": "ليس لديك مهام مسندة إليك.", "achievementCompletedProjects": "أكملت {count} مشاريع.",
    "settingsTitle": "الإعدادات وسجل النشاط", "activityLog": "سجل النشاط", "noActivity": "لم يتم تسجيل أي نشاط بعد.",
    "reportsTitle": "تقارير مشروع {projectName}", "projectSummary": "ملخص المشروع", "exportToCsv": "تصدير إلى CSV", "exportToPdf": "تصدير إلى PDF",
    // Task Page enhancements
    "filterByAssignee": "تصفية حسب المسؤول", "filterByStatus": "تصفية حسب الحالة", "sortBy": "فرز حسب", "priorityDesc": "الأولوية (من الأعلى إلى الأقل)", "priorityAsc": "الأولوية (من الأقل إلى الأعلى)", "dueDateSort": "تاريخ الاستحقاق",
    // Task Statuses
    "toDo": "قيد التنفيذ", "inProgress": "جاري التنفيذ", "done": "مكتمل", "archived": "مؤرشف"
  }
};

type Locale = 'en' | 'ar';

// 5. TYPE DEFINITIONS
export type Status = 'To Do' | 'In Progress' | 'Done' | 'Archived';
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Task {
  id: string;
  name: string;
  description: string;
  status: Status;
  dueDate: string;
  assigneeId?: string;
  projectId?: string; // For profile page
  projectName?: string; // for profile page
  priority: Priority;
  parentId?: string | null;
}

export interface TeamMember {
  id:string; name:string; role:string; email:string; avatar:string;
}
export interface BudgetItem {
    id:string; category:string; allocated:number; spent:number;
}
export interface Risk {
    id:string; description:string; likelihood:'Low'|'Medium'|'High'; impact:'Low'|'Medium'|'High'; mitigation:string;
}
export interface Project {
  id:string; ownerId:string; name:string; description:string; startDate:string; endDate:string; status?: string; // Added status for achievements
}
export interface Design {
  id:string; name:string; imageUrl:string; storagePath:string; uploadedAt:any; // Firestore Timestamp
}
export interface ActivityLog {
  id:string; userEmail:string; action:string; timestamp:any; // Firestore Timestamp
}
type ToastType = 'success' | 'error' | 'info';
interface ToastMessage { id: number; message: string; type: ToastType; }

// 6. TOAST NOTIFICATION SYSTEM
const ToastContext = createContext<{ addToast: (message: string, type: ToastType) => void; }>({ addToast: () => {} });
export const useToast = () => useContext(ToastContext);

const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const toastId = useRef(0);

    const addToast = (message: string, type: ToastType) => {
        const id = toastId.current++;
        setToasts(currentToasts => [...currentToasts, { id, message, type }]);
        setTimeout(() => {
            setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
        }, 5000);
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-4 right-4 z-[100] w-full max-w-xs space-y-3">
                <AnimatePresence>
                    {toasts.map(toast => <Toast key={toast.id} {...toast} />)}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

const Toast: React.FC<ToastMessage> = ({ message, type }) => {
    const icons = {
        success: <CheckCircle className="text-emerald-500" />,
        error: <AlertCircle className="text-red-500" />,
        info: <Info className="text-blue-500" />,
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="flex items-start w-full p-4 space-x-3 bg-white rounded-xl shadow-lg dark:bg-dark-secondary"
        >
            <div className="flex-shrink-0">{icons[type]}</div>
            <p className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-100">{message}</p>
        </motion.div>
    );
};


// 7. HELPER FUNCTIONS
export const formatDate = (dateString: string, locale: Locale): string => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', options);
};
export const formatDateTime = (timestamp: any, locale: Locale): string => {
  if (!timestamp?.toDate) return '';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return timestamp.toDate().toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US', options);
};
export const getStatusColor = (status: string): string => {
  switch(status){case 'To Do':return 'bg-gray-400'; case 'In Progress':return 'bg-blue-500'; case 'Done':return 'bg-emerald-500'; case 'Archived':return 'bg-yellow-500'; default:return 'bg-gray-400';}
};
export const getPriorityStyles = (priority: Priority): { color: string, text: string } => {
    switch (priority) {
        case 'Urgent': return { color: 'bg-red-500', text: 'text-red-800 dark:text-red-200' };
        case 'High': return { color: 'bg-yellow-500', text: 'text-yellow-800 dark:text-yellow-200' };
        case 'Medium': return { color: 'bg-blue-500', text: 'text-blue-800 dark:text-blue-200' };
        case 'Low': return { color: 'bg-gray-400', text: 'text-gray-800 dark:text-gray-200' };
        default: return { color: 'bg-gray-400', text: 'text-gray-800 dark:text-gray-200' };
    }
};
export const formatCurrencyEGP = (amount: number, locale: Locale): string => new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {style:'currency', currency:'EGP', minimumFractionDigits:0}).format(amount).replace('EGP', 'E£');

// 8. UI & LAYOUT COMPONENTS

const BouncingLoader: React.FC = () => (
    <div className="flex items-center justify-center w-full h-full p-4 space-x-2">
        {[...Array(3)].map((_, i) => (
            <motion.div
                key={i}
                className={`w-3 h-3 rounded-full ${i % 2 === 0 ? 'bg-primary' : 'bg-emerald-500'}`}
                animate={{ y: ["0%", "-100%", "0%"] }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
            />
        ))}
    </div>
);
const EmptyState: React.FC<{ title: string; message: string; action?: React.ReactNode; }> = ({ title, message, action }) => (
    <div className="py-16 text-center"><h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>{action && <div className="mt-6">{action}</div>}</div>
);
const Card: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <motion.div className="p-5 bg-white rounded-xl shadow-md dark:bg-dark-secondary" whileHover={{ scale: 1.05, y: -5, transition: { duration: 0.2 } }} >
        <div className="flex items-center">
            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 text-white rounded-lg" style={{ background: `linear-gradient(to right, ${color}, ${color === '#3B82F6' ? '#10B981' : '#F59E0B'})` }}>{icon}</div>
            <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
            </div>
        </div>
    </motion.div>
);
const ThemeToggle: React.FC<{ theme: 'light' | 'dark'; toggleTheme: () => void; }> = ({ theme, toggleTheme }) => (
    <motion.button onClick={toggleTheme} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400" aria-label="Toggle theme" whileHover={{ scale: 1.1, rotate: 15 }} whileTap={{ scale: 0.9 }}>
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </motion.button>
);
const LanguageSwitcher: React.FC<{ locale: Locale; toggleLocale: () => void; }> = ({ locale, toggleLocale }) => (
    <motion.button onClick={toggleLocale} className="p-2 text-sm font-medium text-gray-500 rounded-full w-9 h-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400" aria-label="Toggle Language" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      {locale === 'en' ? 'AR' : 'EN'}
    </motion.button>
);
const Header: React.FC<{ user: User | null; onSignOut: () => void; onMenuClick: () => void; theme: 'light' | 'dark'; toggleTheme: () => void; locale: Locale; toggleLocale: () => void; t: (key: string) => string; }> = ({ user, onSignOut, onMenuClick, theme, toggleTheme, locale, toggleLocale, t }) => {
    return (
        <header className="flex items-center justify-between flex-shrink-0 h-16 px-4 bg-white/80 backdrop-blur-sm border-b dark:bg-dark-secondary/80 dark:border-gray-700">
          <div className="flex items-center">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onMenuClick} className="p-2 mr-2 text-gray-500 rounded-md lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700"> <Menu size={24} /> </motion.button>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <LanguageSwitcher locale={locale} toggleLocale={toggleLocale} />
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <Link to="/profile" title={t('profile')} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400"> <UserIcon size={20} /> </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center font-bold text-white bg-gradient-to-br from-primary to-emerald-500 rounded-full"> {user?.email?.charAt(0).toUpperCase()} </div>
              <span className="hidden text-sm font-medium text-gray-700 md:block dark:text-gray-300">{user?.email}</span>
            </div>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onSignOut} title={t('signOut')} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400"> <LogOut size={20} /> </motion.button>
          </div>
        </header>
    );
};
const Sidebar: React.FC<{ projects: Project[]; selectedProjectId: string | null; onSelectProject: (id: string) => void; onNewProject: () => void; onEditProject: (project: Project) => void; onDeleteProject: (id: string) => void; isOpen: boolean; onClose: () => void; t: (key: string) => string; }> = ({ projects, selectedProjectId, onSelectProject, onNewProject, onEditProject, onDeleteProject, isOpen, onClose, t }) => {
    const navLinks = [
        { name: t('dashboard'), icon: <LayoutDashboard size={20} />, path: '/' }, { name: t('tasks'), icon: <CheckSquare size={20} />, path: '/tasks' }, { name: t('team'), icon: <Users size={20} />, path: '/team' }, { name: t('budget'), icon: <DollarSign size={20} />, path: '/budget' }, { name: t('risks'), icon: <AlertTriangle size={20} />, path: '/risks' }, { name: t('designs'), icon: <Image size={20} />, path: '/designs' }, { name: t('reports'), icon: <FileText size={20} />, path: '/reports' }, { name: t('settings'), icon: <Settings size={20} />, path: '/settings' },
    ];
    return (
        <>
          <div className={`fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
          <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-white border-r transform transition-transform lg:relative lg:translate-x-0 dark:bg-dark-secondary dark:border-gray-700 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center justify-between h-16 px-4 border-b flex-shrink-0 dark:border-gray-700"> <h1 className="text-xl font-bold text-primary">ProjectHub</h1> <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="p-2 text-gray-500 rounded-md lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700"> <X size={24} /> </motion.button> </div>
            <div className="flex flex-col flex-grow p-4 overflow-y-auto">
              <nav className="flex-1 space-y-2"> {navLinks.map((link) => ( <motion.div key={link.name} whileHover={{ x: 2 }}> <NavLink to={link.path} end onClick={onClose} className={({ isActive }) => `flex items-center px-4 py-2 text-sm font-medium rounded-lg ${isActive ? 'bg-gradient-to-r from-primary to-emerald-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}> {link.icon} <span className="ml-3">{link.name}</span> </NavLink> </motion.div> ))} </nav>
              <div className="mt-8">
                <div className="flex items-center justify-between px-4"> <h2 className="text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">{t('projects')}</h2> <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={onNewProject} className="p-1 text-gray-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"> <Plus size={16} /> </motion.button> </div>
                <div className="mt-2 space-y-1"> {projects.map(project => ( <motion.div key={project.id} whileHover={{ x: 2 }} className="relative group"> <button onClick={() => { onSelectProject(project.id); onClose(); }} className={`w-full text-left flex items-center px-4 py-2 text-sm font-medium rounded-lg ${selectedProjectId === project.id ? 'bg-primary-light text-primary-dark font-semibold' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}> <span className="flex-1 truncate">{project.name}</span> </button> <div className="absolute right-0 top-0 h-full flex items-center pr-2 opacity-0 group-hover:opacity-100 transition-opacity"> <button onClick={(e) => {e.stopPropagation(); onEditProject(project);}} className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"><Edit size={14} /></button> <button onClick={(e) => {e.stopPropagation(); onDeleteProject(project.id);}} className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"><Trash2 size={14} /></button> </div> </motion.div> ))} </div>
              </div>
            </div>
          </aside>
        </>
    );
};
const ConfirmationModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; t: (key: string) => string; }> = ({ isOpen, onClose, onConfirm, title, message, t }) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-md p-6 bg-white rounded-xl shadow-xl dark:bg-dark-secondary">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>
                <div className="flex justify-end mt-6 space-x-4">
                  <motion.button onClick={onClose} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">{t('cancel')}</motion.button>
                  <motion.button onClick={onConfirm} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">{t('confirm')}</motion.button>
                </div>
              </motion.div>
            </div>
        )}
    </AnimatePresence>
);

// 9. CRUD MODAL COMPONENTS
const inputStyle = "block w-full px-3 py-2 mt-1 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white";
const btnPrimaryStyle = "px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-primary to-emerald-500 hover:from-primary-dark hover:to-emerald-dark transition-all shadow-sm";
const btnSecondaryStyle = "px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600";
const labelStyle = "block text-sm font-medium text-gray-700 dark:text-gray-300";

const NewProjectModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (project: Omit<Project, 'id' | 'ownerId'> | (Omit<Project, 'id' | 'ownerId'> & {id: string})) => void; editingProject: Project | null; t: (key: string) => string; }> = ({ isOpen, onClose, onSave, editingProject, t }) => {
    const [name, setName] = useState(''); const [description, setDescription] = useState(''); const [startDate, setStartDate] = useState(''); const [endDate, setEndDate] = useState('');
    useEffect(() => {
      if (editingProject) { setName(editingProject.name); setDescription(editingProject.description); setStartDate(new Date(editingProject.startDate).toISOString().split('T')[0]); setEndDate(new Date(editingProject.endDate).toISOString().split('T')[0]); }
      else { setName(''); setDescription(''); setStartDate(''); setEndDate(''); }
    }, [editingProject, isOpen]);
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); const projectData = { name, description, startDate, endDate }; onSave(editingProject ? { ...projectData, id: editingProject.id } : projectData); onClose(); };
    return (
      <AnimatePresence>
        {isOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-lg p-6 bg-white rounded-xl shadow-xl dark:bg-dark-secondary">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editingProject ? t('editProject') : t('newProject')}</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div><label htmlFor="name" className={labelStyle}>{t('projectName')}</label><input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className={inputStyle} /></div>
            <div><label htmlFor="description" className={labelStyle}>{t('description')}</label><textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} required className={inputStyle}></textarea></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div><label htmlFor="startDate" className={labelStyle}>{t('startDate')}</label><input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required className={inputStyle} /></div>
              <div><label htmlFor="endDate" className={labelStyle}>{t('endDate')}</label><input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} required className={inputStyle} /></div>
            </div>
            <div className="flex justify-end pt-4 space-x-4">
              <motion.button type="button" onClick={onClose} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={btnSecondaryStyle}>{t('cancel')}</motion.button>
              <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={btnPrimaryStyle}>{editingProject ? t('updateProject') : t('createProject')}</motion.button>
            </div>
          </form>
        </motion.div></div>)}
      </AnimatePresence>
    );
};
const TaskModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (task: Omit<Task, 'id'> | Task) => void; editingTask: Task | null; team: TeamMember[]; tasks: Task[]; t: (key: string) => string; }> = ({ isOpen, onClose, onSave, editingTask, team, tasks, t }) => {
    const [name, setName] = useState(''); const [description, setDescription] = useState(''); const [status, setStatus] = useState<Status>('To Do'); const [dueDate, setDueDate] = useState(''); const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined); const [priority, setPriority] = useState<Priority>('Medium'); const [parentId, setParentId] = useState<string | undefined>(undefined);
    useEffect(() => {
        if (editingTask) { setName(editingTask.name); setDescription(editingTask.description); setStatus(editingTask.status); setDueDate(new Date(editingTask.dueDate).toISOString().split('T')[0]); setAssigneeId(editingTask.assigneeId); setPriority(editingTask.priority); setParentId(editingTask.parentId ?? undefined); }
        else { setName(''); setDescription(''); setStatus('To Do'); setDueDate(''); setAssigneeId(undefined); setPriority('Medium'); setParentId(undefined); }
    }, [editingTask, isOpen]);
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); const taskData = { name, description, status, dueDate, assigneeId, priority, parentId }; onSave(editingTask ? { ...taskData, id: editingTask.id } : taskData); onClose(); };
    return (
      <AnimatePresence> {isOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-lg p-6 bg-white rounded-xl shadow-xl dark:bg-dark-secondary">
          <h2 className="text-lg font-semibold">{editingTask ? t('editTask') : t('addTask')}</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <input type="text" placeholder={t('taskName')} value={name} onChange={e => setName(e.target.value)} required className={inputStyle}/>
            <textarea placeholder={t('description')} value={description} onChange={e => setDescription(e.target.value)} required className={inputStyle}></textarea>
            <div className="grid grid-cols-2 gap-4">
                <select value={status} onChange={e => setStatus(e.target.value as Status)} className={inputStyle}> <option value="To Do">{t('toDo')}</option><option value="In Progress">{t('inProgress')}</option><option value="Done">{t('done')}</option><option value="Archived">{t('archived')}</option> </select>
                <select value={assigneeId || ''} onChange={e => setAssigneeId(e.target.value)} className={inputStyle}> <option value="">{t('assignee')}</option> {team.map(member => <option key={member.id} value={member.id}>{member.name}</option>)} </select>
                <select value={priority} onChange={e => setPriority(e.target.value as Priority)} className={inputStyle}> <option value="Low">{t('low')}</option><option value="Medium">{t('medium')}</option><option value="High">{t('high')}</option><option value="Urgent">{t('urgent')}</option> </select>
                <select value={parentId || ''} onChange={e => setParentId(e.target.value)} className={inputStyle}> <option value="">{t('parentTask')}</option> {tasks.filter(t => t.id !== editingTask?.id).map(task => <option key={task.id} value={task.id}>{task.name}</option>)} </select>
            </div>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required className={inputStyle}/>
            <div className="flex justify-end pt-2 space-x-2"> <button type="button" onClick={onClose} className={btnSecondaryStyle}>{t('cancel')}</button> <button type="submit" className={btnPrimaryStyle}>{t('save')}</button> </div>
          </form>
        </motion.div></div>)} </AnimatePresence>
    );
};
// Other modals (TeamMember, Budget, Risk, Design) would be similarly wrapped in <AnimatePresence> and styled with new classes
const TeamMemberModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (member: Omit<TeamMember, 'id'> | TeamMember) => void; editingMember: TeamMember | null; t: (key: string) => string; }> = ({ isOpen, onClose, onSave, editingMember, t }) => {
    const [name, setName] = useState(''); const [role, setRole] = useState(''); const [email, setEmail] = useState(''); const [avatar] = useState(''); // Avatar logic can be extended
    useEffect(() => { if (editingMember) { setName(editingMember.name); setRole(editingMember.role); setEmail(editingMember.email); } else { setName(''); setRole(''); setEmail(''); } }, [editingMember, isOpen]);
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); const memberData = { name, role, email, avatar }; onSave(editingMember ? { ...memberData, id: editingMember.id } : memberData); onClose(); };
    return (<AnimatePresence>{isOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"> <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-dark-secondary"> <h2 className="text-lg font-semibold">{editingMember ? t('editTeamMember') : t('addTeamMember')}</h2> <form onSubmit={handleSubmit} className="mt-4 space-y-4"> <input type="text" placeholder={t('memberName')} value={name} onChange={e => setName(e.target.value)} required className={inputStyle}/> <input type="text" placeholder={t('role')} value={role} onChange={e => setRole(e.target.value)} required className={inputStyle}/> <input type="email" placeholder={t('email')} value={email} onChange={e => setEmail(e.target.value)} required className={inputStyle}/> <div className="flex justify-end pt-2 space-x-2"> <button type="button" onClick={onClose} className={btnSecondaryStyle}>{t('cancel')}</button> <button type="submit" className={btnPrimaryStyle}>{t('save')}</button> </div> </form> </motion.div> </div>)}</AnimatePresence>);
};
const BudgetItemModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (item: Omit<BudgetItem, 'id'> | BudgetItem) => void; editingItem: BudgetItem | null; t: (key: string) => string; }> = ({ isOpen, onClose, onSave, editingItem, t }) => {
    const [category, setCategory] = useState(''); const [allocated, setAllocated] = useState(0); const [spent, setSpent] = useState(0);
    useEffect(() => { if (editingItem) { setCategory(editingItem.category); setAllocated(editingItem.allocated); setSpent(editingItem.spent); } else { setCategory(''); setAllocated(0); setSpent(0); } }, [editingItem, isOpen]);
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); const itemData = { category, allocated: Number(allocated), spent: Number(spent) }; onSave(editingItem ? { ...itemData, id: editingItem.id } : itemData); onClose(); };
    return (<AnimatePresence>{isOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"> <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-dark-secondary"> <h2 className="text-lg font-semibold">{editingItem ? t('editBudgetItem') : t('addBudgetItem')}</h2> <form onSubmit={handleSubmit} className="mt-4 space-y-4"> <input type="text" placeholder={t('category')} value={category} onChange={e => setCategory(e.target.value)} required className={inputStyle}/> <input type="number" placeholder={t('allocatedBudget')} value={allocated} onChange={e => setAllocated(Number(e.target.value))} required className={inputStyle}/> <input type="number" placeholder={t('spentBudget')} value={spent} onChange={e => setSpent(Number(e.target.value))} required className={inputStyle}/> <div className="flex justify-end pt-2 space-x-2"> <button type="button" onClick={onClose} className={btnSecondaryStyle}>{t('cancel')}</button> <button type="submit" className={btnPrimaryStyle}>{t('save')}</button> </div> </form> </motion.div> </div>)}</AnimatePresence>);
};
const RiskModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (risk: Omit<Risk, 'id'> | Risk) => void; editingRisk: Risk | null; t: (key: string) => string; }> = ({ isOpen, onClose, onSave, editingRisk, t }) => {
    const [description, setDescription] = useState(''); const [likelihood, setLikelihood] = useState<'Low' | 'Medium' | 'High'>('Medium'); const [impact, setImpact] = useState<'Low' | 'Medium' | 'High'>('Medium'); const [mitigation, setMitigation] = useState('');
    useEffect(() => { if (editingRisk) { setDescription(editingRisk.description); setLikelihood(editingRisk.likelihood); setImpact(editingRisk.impact); setMitigation(editingRisk.mitigation); } else { setDescription(''); setLikelihood('Medium'); setImpact('Medium'); setMitigation(''); } }, [editingRisk, isOpen]);
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); const riskData = { description, likelihood, impact, mitigation }; onSave(editingRisk ? { ...riskData, id: editingRisk.id } : riskData); onClose(); };
    // Fix: Corrected typo in AnimatePresence closing tag from </AnPresence> to </AnimatePresence>.
    return (<AnimatePresence>{isOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"> <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-dark-secondary"> <h2 className="text-lg font-semibold">{editingRisk ? t('editRisk') : t('addRisk')}</h2> <form onSubmit={handleSubmit} className="mt-4 space-y-4"> <textarea placeholder={t('description')} value={description} onChange={e => setDescription(e.target.value)} required className={inputStyle}></textarea> <select value={likelihood} onChange={e => setLikelihood(e.target.value as any)} className={inputStyle}><option value="Low">{t('low')}</option><option value="Medium">{t('medium')}</option><option value="High">{t('high')}</option></select> <select value={impact} onChange={e => setImpact(e.target.value as any)} className={inputStyle}><option value="Low">{t('low')}</option><option value="Medium">{t('medium')}</option><option value="High">{t('high')}</option></select> <textarea placeholder={t('mitigation')} value={mitigation} onChange={e => setMitigation(e.target.value)} required className={inputStyle}></textarea> <div className="flex justify-end pt-2 space-x-2"> <button type="button" onClick={onClose} className={btnSecondaryStyle}>{t('cancel')}</button> <button type="submit" className={btnPrimaryStyle}>{t('save')}</button> </div> </form> </motion.div> </div>)}</AnimatePresence>);
};
const DesignModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (design: Pick<Design, 'id'|'name'>) => void; editingDesign: Design | null; t: (key: string) => string; }> = ({ isOpen, onClose, onSave, editingDesign, t }) => {
    const [name, setName] = useState('');
    useEffect(() => { if (editingDesign) setName(editingDesign.name); else setName(''); }, [editingDesign, isOpen]);
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (editingDesign) { onSave({ id: editingDesign.id, name }); } onClose(); };
    return (<AnimatePresence>{isOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"> <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl dark:bg-dark-secondary"> <h2 className="text-lg font-semibold">{t('editDesign')}</h2> <form onSubmit={handleSubmit} className="mt-4 space-y-4"> <input type="text" placeholder={t('designName')} value={name} onChange={e => setName(e.target.value)} required className={inputStyle}/> <div className="flex justify-end pt-2 space-x-2"> <button type="button" onClick={onClose} className={btnSecondaryStyle}>{t('cancel')}</button> <button type="submit" className={btnPrimaryStyle}>{t('save')}</button> </div> </form> </motion.div> </div>)}</AnimatePresence>);
};
const DashboardLayout: React.FC<{ children: React.ReactNode; user: User; projects: Project[]; selectedProjectId: string | null; onSelectProject: (id: string) => void; onNewProject: () => void; onEditProject: (project: Project) => void; onDeleteProject: (id: string) => void; onSignOut: () => void; theme: 'light' | 'dark'; toggleTheme: () => void; locale: Locale; toggleLocale: () => void; t: (key: string) => string; }> = (props) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    return (
        <div className="flex h-screen overflow-hidden bg-main">
          <Sidebar {...props} isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex flex-col flex-1 w-0 overflow-hidden">
            <Header {...props} onMenuClick={() => setSidebarOpen(true)} />
            {props.children}
          </div>
        </div>
    );
};

// 10. PAGE COMPONENTS
const DashboardPage: React.FC<{ project: Project | null; tasks: Task[]; team: TeamMember[]; budget: BudgetItem[]; risks: Risk[]; t: (key: string) => string; locale: Locale; }> = ({ project, tasks, team, budget, risks, t, locale }) => {
    if (!project) return <main className="flex-1 p-6 overflow-y-auto"><EmptyState title={t('noProjectSelected')} message={t('noProjectMessage')} /></main>;
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
        <main className="flex-1 p-6 overflow-y-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboardTitle').replace('{projectName}', project.name)}</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{project.description}</p>
          <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-4"> {cardData.map(card => <Card key={card.title} {...card} />)} </div>
          <div className="grid grid-cols-1 gap-6 mt-8 lg:grid-cols-2">
            <div className="p-4 bg-white rounded-xl shadow-md dark:bg-dark-secondary"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('taskStatus')}</h2><Bar data={taskStatusData} /></div>
            <div className="p-4 bg-white rounded-xl shadow-md dark:bg-dark-secondary"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('budgetOverview')}</h2><Pie data={budgetData} /></div>
          </div>
        </main>
    );
};
const TasksPage: React.FC<{ project: Project | null; tasks: Task[]; team: TeamMember[]; onNew: () => void; onEdit: (task: Task) => void; onDelete: (id: string) => void; t: (key: string) => string; locale: Locale; }> = ({ project, tasks, team, onNew, onEdit, onDelete, t, locale }) => {
    // State for filters and sorting
    const [assigneeFilter, setAssigneeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState('priorityDesc');

    const filteredAndSortedTasks = useMemo(() => {
        let filtered = tasks;
        if (assigneeFilter) {
            filtered = filtered.filter(task => task.assigneeId === assigneeFilter);
        }
        if (statusFilter) {
            filtered = filtered.filter(task => task.status === statusFilter);
        }

        const priorityOrder: Record<Priority, number> = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'priorityDesc': return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'priorityAsc': return priorityOrder[a.priority] - priorityOrder[b.priority];
                case 'dueDate': return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                default: return 0;
            }
        });
    }, [tasks, assigneeFilter, statusFilter, sortBy]);
    
    const taskTree = useMemo(() => {
        // Fix: Use `any[]` for children to handle recursive type, and cast `children: []` to `any[]` to allow pushing items.
        const tree: (Task & { children: any[] })[] = [];
        const taskMap = new Map(filteredAndSortedTasks.map(task => [task.id, { ...task, children: [] as any[] }]));
        taskMap.forEach(task => {
            if (task.parentId && taskMap.has(task.parentId)) {
                taskMap.get(task.parentId)?.children.push(task);
            } else {
                tree.push(task);
            }
        });
        return tree;
    }, [filteredAndSortedTasks]);

    // Fix: Changed `children: Task[]` to `children: any[]` to correctly type the recursive task structure.
    const renderTask = (task: Task & { children: any[] }, level = 0) => (
        <motion.div key={task.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ marginLeft: `${level * 2}rem` }}>
            <div className="p-4 bg-white rounded-lg shadow dark:bg-dark-secondary">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{task.name}</h3>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                        <div className="flex items-center mt-2 space-x-4">
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getPriorityStyles(task.priority).color} ${getPriorityStyles(task.priority).text}`}>{t(task.priority.toLowerCase())}</span>
                            <p className="text-xs text-gray-500 dark:text-gray-500">{t('dueDate')}: {formatDate(task.dueDate, locale)}</p>
                            {task.parentId && <span className="flex items-center text-xs text-gray-500"><Link2 size={12} className="mr-1"/> {t('parent')}</span>}
                        </div>
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
            {task.children.length > 0 && <div className="mt-2 space-y-2 border-l-2 border-primary-light pl-2">{task.children.map(child => renderTask(child, level + 1))}</div>}
        </motion.div>
    );

    if (!project) return <main className="flex-1 p-6 overflow-y-auto"><EmptyState title={t('noProjectSelected')} message={t('noProjectMessage')} /></main>;
    return (
        <main className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('tasksTitle').replace('{projectName}', project.name)}</h1>
                <button onClick={onNew} className={`${btnPrimaryStyle} flex items-center`}><Plus size={16} className="mr-2"/>{t('addTask')}</button>
            </div>
            {/* Filter and Sort Controls */}
            <div className="grid grid-cols-1 gap-4 my-4 sm:grid-cols-3">
                <select value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)} className={inputStyle}> <option value="">{t('filterByAssignee')}</option> {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)} </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={inputStyle}> <option value="">{t('filterByStatus')}</option> <option value="To Do">{t('toDo')}</option><option value="In Progress">{t('inProgress')}</option><option value="Done">{t('done')}</option><option value="Archived">{t('archived')}</option> </select>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={inputStyle}> <option value="priorityDesc">{t('priorityDesc')}</option><option value="priorityAsc">{t('priorityAsc')}</option><option value="dueDate">{t('dueDateSort')}</option> </select>
            </div>
            {tasks.length === 0 ? <EmptyState title={t('noTasks')} message={t('noTasksMessage')} action={<button onClick={onNew} className={btnPrimaryStyle}>{t('addTask')}</button>} /> : (
                <div className="mt-6 space-y-4">
                  <AnimatePresence>
                    {taskTree.map(task => renderTask(task))}
                  </AnimatePresence>
                </div>
            )}
        </main>
    );
};
const TeamPage: React.FC<{ project: Project | null; team: TeamMember[]; onNew: () => void; onEdit: (member: TeamMember) => void; onDelete: (id: string) => void; t: (key: string) => string; }> = ({ project, team, onNew, onEdit, onDelete, t }) => {
    if (!project) return <main className="flex-1 p-6 overflow-y-auto"><EmptyState title={t('noProjectSelected')} message={t('noProjectMessage')} /></main>;
    return (
        <main className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between"> <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('teamTitle').replace('{projectName}', project.name)}</h1> <button onClick={onNew} className={`${btnPrimaryStyle} flex items-center`}><Plus size={16} className="mr-2"/>{t('addTeamMember')}</button> </div>
            {team.length === 0 ? <EmptyState title={t('noTeam')} message={t('noTeamMessage')} action={<button onClick={onNew} className={btnPrimaryStyle}>{t('addTeamMember')}</button>} /> : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 overflow-x-auto bg-white rounded-lg shadow dark:bg-dark-secondary">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"><tr><th scope="col" className="px-6 py-3">{t('memberName')}</th><th scope="col" className="px-6 py-3">{t('role')}</th><th scope="col" className="px-6 py-3">{t('email')}</th><th scope="col" className="px-6 py-3"></th></tr></thead>
                    <motion.tbody>{team.map((member, i) => (<motion.tr initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={member.id} className="bg-white border-b dark:bg-dark-secondary dark:border-gray-700"><th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{member.name}</th><td className="px-6 py-4">{member.role}</td><td className="px-6 py-4">{member.email}</td><td className="flex justify-end px-6 py-4 space-x-2"><button onClick={() => onEdit(member)} className="p-1 text-gray-500 hover:text-blue-600"><Edit size={16}/></button><button onClick={() => onDelete(member.id)} className="p-1 text-gray-500 hover:text-red-600"><Trash2 size={16}/></button></td></motion.tr>))}</motion.tbody>
                </table>
                </motion.div>
            )}
        </main>
    );
};

const BudgetPage: React.FC<{ project: Project | null; budget: BudgetItem[]; onNew: () => void; onEdit: (item: BudgetItem) => void; onDelete: (id: string) => void; t: (key: string) => string; locale: Locale; }> = ({ project, budget, onNew, onEdit, onDelete, t, locale }) => {
    if (!project) return <main className="flex-1 p-6 overflow-y-auto"><EmptyState title={t('noProjectSelected')} message={t('noProjectMessage')} /></main>;
    const totalAllocated = budget.reduce((sum, item) => sum + item.allocated, 0);
    const totalSpent = budget.reduce((sum, item) => sum + item.spent, 0);
    return (
        <main className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between"> <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('budgetTitle').replace('{projectName}', project.name)}</h1> <button onClick={onNew} className={`${btnPrimaryStyle} flex items-center`}><Plus size={16} className="mr-2"/>{t('addBudgetItem')}</button> </div>
            {budget.length === 0 ? <EmptyState title={t('noBudget')} message={t('noBudgetMessage')} action={<button onClick={onNew} className={btnPrimaryStyle}>{t('addBudgetItem')}</button>} /> : (
                <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-3">
                    <div className="p-4 bg-white rounded-lg shadow dark:bg-dark-secondary"><p className="text-sm text-gray-500">{t('total')} {t('allocated')}</p><p className="text-2xl font-semibold">{formatCurrencyEGP(totalAllocated, locale)}</p></div>
                    <div className="p-4 bg-white rounded-lg shadow dark:bg-dark-secondary"><p className="text-sm text-gray-500">{t('total')} {t('spent')}</p><p className="text-2xl font-semibold text-red-500">{formatCurrencyEGP(totalSpent, locale)}</p></div>
                    <div className="p-4 bg-white rounded-lg shadow dark:bg-dark-secondary"><p className="text-sm text-gray-500">{t('remaining')}</p><p className="text-2xl font-semibold text-emerald-500">{formatCurrencyEGP(totalAllocated - totalSpent, locale)}</p></div>
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 overflow-x-auto bg-white rounded-lg shadow dark:bg-dark-secondary">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"><tr><th scope="col" className="px-6 py-3">{t('category')}</th><th scope="col" className="px-6 py-3">{t('allocatedBudget')}</th><th scope="col" className="px-6 py-3">{t('spentBudget')}</th><th scope="col" className="px-6 py-3">{t('remaining')}</th><th scope="col" className="px-6 py-3"></th></tr></thead>
                    <motion.tbody>{budget.map((item, i) => (<motion.tr initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={item.id} className="bg-white border-b dark:bg-dark-secondary dark:border-gray-700"><th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.category}</th><td className="px-6 py-4">{formatCurrencyEGP(item.allocated, locale)}</td><td className="px-6 py-4">{formatCurrencyEGP(item.spent, locale)}</td><td className="px-6 py-4">{formatCurrencyEGP(item.allocated - item.spent, locale)}</td><td className="flex justify-end px-6 py-4 space-x-2"><button onClick={() => onEdit(item)} className="p-1 text-gray-500 hover:text-blue-600"><Edit size={16}/></button><button onClick={() => onDelete(item.id)} className="p-1 text-gray-500 hover:text-red-600"><Trash2 size={16}/></button></td></motion.tr>))}</motion.tbody>
                </table>
                </motion.div>
                </>
            )}
        </main>
    );
};

const RisksPage: React.FC<{ project: Project | null; risks: Risk[]; onNew: () => void; onEdit: (risk: Risk) => void; onDelete: (id: string) => void; t: (key: string) => string; }> = ({ project, risks, onNew, onEdit, onDelete, t }) => {
    if (!project) return <main className="flex-1 p-6 overflow-y-auto"><EmptyState title={t('noProjectSelected')} message={t('noProjectMessage')} /></main>;
    return (
        <main className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between"> <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('risksTitle').replace('{projectName}', project.name)}</h1> <button onClick={onNew} className={`${btnPrimaryStyle} flex items-center`}><Plus size={16} className="mr-2"/>{t('addRisk')}</button> </div>
            {risks.length === 0 ? <EmptyState title={t('noRisks')} message={t('noRisksMessage')} action={<button onClick={onNew} className={btnPrimaryStyle}>{t('addRisk')}</button>} /> : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 overflow-x-auto bg-white rounded-lg shadow dark:bg-dark-secondary">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"><tr><th scope="col" className="px-6 py-3">{t('description')}</th><th scope="col" className="px-6 py-3">{t('likelihood')}</th><th scope="col" className="px-6 py-3">{t('impact')}</th><th scope="col" className="px-6 py-3">{t('mitigation')}</th><th scope="col" className="px-6 py-3"></th></tr></thead>
                    <motion.tbody>{risks.map((risk, i) => (<motion.tr initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={risk.id} className="bg-white border-b dark:bg-dark-secondary dark:border-gray-700"><th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{risk.description}</th><td className="px-6 py-4">{risk.likelihood}</td><td className="px-6 py-4">{risk.impact}</td><td className="px-6 py-4">{risk.mitigation}</td><td className="flex justify-end px-6 py-4 space-x-2"><button onClick={() => onEdit(risk)} className="p-1 text-gray-500 hover:text-blue-600"><Edit size={16}/></button><button onClick={() => onDelete(risk.id)} className="p-1 text-gray-500 hover:text-red-600"><Trash2 size={16}/></button></td></motion.tr>))}</motion.tbody>
                </table>
                </motion.div>
            )}
        </main>
    );
};

const DesignsPage: React.FC<{ project: Project | null; designs: Design[]; onEdit: (design: Design) => void; onDelete: (design: Design) => void; onUpload: (file: File) => void; t: (key: string) => string; locale: Locale; }> = ({ project, designs, onEdit, onDelete, onUpload, t, locale }) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const { addToast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            if (e.target.files[0].type === 'image/png') {
                setFile(e.target.files[0]);
            } else {
                addToast(t('pngOnlyError'), 'error');
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        try {
            await onUpload(file);
            addToast(t('uploadSuccess'), 'success');
            setFile(null);
        } catch (error) {
            addToast(t('uploadError'), 'error');
        } finally {
            setUploading(false);
        }
    };
    
    if (!project) return <main className="flex-1 p-6 overflow-y-auto"><EmptyState title={t('noProjectSelected')} message={t('noProjectMessage')} /></main>;
    return (
        <main className="flex-1 p-6 overflow-y-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('designsTitle').replace('{projectName}', project.name)}</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t('designsMessage')}</p>
            <div className="p-4 mt-6 bg-white rounded-lg shadow dark:bg-dark-secondary">
                <h2 className="text-lg font-semibold">{t('uploadDesign')}</h2>
                <div className="flex items-center mt-4 space-x-4">
                    <label className="flex items-center px-4 py-2 space-x-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
                        <UploadCloud size={16} />
                        <span>{file ? file.name : t('pngFile')}</span>
                        <input type="file" className="hidden" onChange={handleFileChange} accept="image/png" />
                    </label>
                    <button onClick={handleUpload} disabled={!file || uploading} className={`${btnPrimaryStyle} disabled:opacity-50`}>
                        {uploading ? t('uploading') : t('upload')}
                    </button>
                </div>
            </div>

            {designs.length === 0 ? <div className="mt-8"><EmptyState title={t('noDesigns')} message={t('noDesignsMessage')} /></div> : (
                <div className="grid grid-cols-1 gap-6 mt-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    <AnimatePresence>
                    {designs.map((design, i) => (
                        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ delay: i * 0.05 }} key={design.id} className="relative overflow-hidden bg-white rounded-lg shadow group dark:bg-dark-secondary">
                            <img src={design.imageUrl} alt={design.name} className="object-cover w-full h-48" />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                                <p className="font-semibold text-white truncate">{design.name}</p>
                                <p className="text-xs text-gray-300">{t('uploaded')}: {formatDateTime(design.uploadedAt, locale)}</p>
                            </div>
                            <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onEdit(design)} className="p-2 text-white bg-blue-500 rounded-full hover:bg-blue-600"><Edit size={16}/></button>
                                <button onClick={() => onDelete(design)} className="p-2 text-white bg-red-500 rounded-full hover:bg-red-600"><Trash2 size={16}/></button>
                            </div>
                        </motion.div>
                    ))}
                    </AnimatePresence>
                </div>
            )}
        </main>
    );
};

declare const jsPDF: any;
declare const html2canvas: any;

const ReportsPage: React.FC<{ project: Project | null; tasks: Task[], team: TeamMember[], budget: BudgetItem[], risks: Risk[], t: (key: string) => string; locale: Locale; }> = ({ project, tasks, team, budget, risks, t, locale }) => {
    const reportRef = useRef<HTMLDivElement>(null);
    if (!project) return <main className="flex-1 p-6 overflow-y-auto"><EmptyState title={t('noProjectSelected')} message={t('noProjectMessage')} /></main>;

    const teamMap = new Map(team.map(member => [member.id, member.name]));

    const handleExportCsv = () => {
        if (!project) return;
        const escapeCsvCell = (cell: any): string => {
            const cellStr = String(cell ?? '');
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
        };
        let csvContent = `Project Report: ${escapeCsvCell(project.name)}\n\n`;
        csvContent += "Tasks\nName,Description,Status,Due Date,Priority,Assignee\n";
        tasks.forEach(task => { const assigneeName = task.assigneeId ? teamMap.get(task.assigneeId) : 'Unassigned'; csvContent += [escapeCsvCell(task.name), escapeCsvCell(task.description), escapeCsvCell(task.status), escapeCsvCell(task.dueDate), escapeCsvCell(task.priority), escapeCsvCell(assigneeName)].join(',') + '\n'; });
        csvContent += '\nTeam\nName,Role,Email\n';
        team.forEach(member => { csvContent += [escapeCsvCell(member.name), escapeCsvCell(member.role), escapeCsvCell(member.email)].join(',') + '\n'; });
        csvContent += '\nBudget\nCategory,Allocated,Spent,Remaining\n';
        budget.forEach(item => { csvContent += [escapeCsvCell(item.category), escapeCsvCell(item.allocated), escapeCsvCell(item.spent), escapeCsvCell(item.allocated - item.spent)].join(',') + '\n'; });
        csvContent += '\nRisks\nDescription,Likelihood,Impact,Mitigation Strategy\n';
        risks.forEach(risk => { csvContent += [escapeCsvCell(risk.description), escapeCsvCell(risk.likelihood), escapeCsvCell(risk.impact), escapeCsvCell(risk.mitigation)].join(',') + '\n'; });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${project.name}-report.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPdf = () => {
        if (!reportRef.current || !project) return;
        const isDarkMode = document.documentElement.classList.contains('dark');
        if(isDarkMode) reportRef.current.classList.add('dark');
        html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: isDarkMode ? '#1f2937' : '#ffffff' }).then(canvas => {
            if(isDarkMode) reportRef.current?.classList.remove('dark');
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF.jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const ratio = canvasWidth / canvasHeight;
            const imgHeight = pdfWidth / ratio;
            let heightLeft = imgHeight;
            let position = 0;
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdf.internal.pageSize.getHeight();
            }
            pdf.save(`${project.name}-report.pdf`);
        }).catch(err => {
            console.error("Error generating PDF", err);
            if(isDarkMode) reportRef.current?.classList.remove('dark');
        });
    };

    const ReportSection: React.FC<{title: string; children: ReactNode}> = ({title, children}) => (
        <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
            <div className="mt-4 overflow-x-auto bg-white rounded-lg shadow dark:bg-dark-secondary">
                {children}
            </div>
        </div>
    );
    const tableHeaderStyle = "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400";
    const tableCellStyle = "px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200";
    const tableRowStyle = "border-b border-gray-200 dark:border-gray-700";

    return (
        <main className="flex-1 p-6 overflow-y-auto">
            <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('reportsTitle').replace('{projectName}', project.name)}</h1>
                <div className="flex mt-4 space-x-2 sm:mt-0">
                    <button onClick={handleExportCsv} className={btnSecondaryStyle}>{t('exportToCsv')}</button>
                    <button onClick={handleExportPdf} className={btnPrimaryStyle}>{t('exportToPdf')}</button>
                </div>
            </div>
            <div ref={reportRef} className="p-4 mt-6 bg-white rounded-lg shadow dark:bg-dark-secondary">
                <h2 className="text-lg font-semibold">{t('projectSummary')}</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{project.description}</p>
                <ReportSection title={t('tasks')}>
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead><tr><th className={tableHeaderStyle}>{t('taskName')}</th><th className={tableHeaderStyle}>{t('status')}</th><th className={tableHeaderStyle}>{t('dueDate')}</th><th className={tableHeaderStyle}>{t('assignee')}</th></tr></thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-dark-secondary dark:divide-gray-700">{tasks.map(task => <tr key={task.id} className={tableRowStyle}><td className={tableCellStyle}>{task.name}</td><td className={tableCellStyle}>{task.status}</td><td className={tableCellStyle}>{formatDate(task.dueDate, locale)}</td><td className={tableCellStyle}>{teamMap.get(task.assigneeId || '') || 'N/A'}</td></tr>)}</tbody>
                    </table>
                </ReportSection>
                <ReportSection title={t('team')}>
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead><tr><th className={tableHeaderStyle}>{t('memberName')}</th><th className={tableHeaderStyle}>{t('role')}</th><th className={tableHeaderStyle}>{t('email')}</th></tr></thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-dark-secondary dark:divide-gray-700">{team.map(member => <tr key={member.id} className={tableRowStyle}><td className={tableCellStyle}>{member.name}</td><td className={tableCellStyle}>{member.role}</td><td className={tableCellStyle}>{member.email}</td></tr>)}</tbody>
                    </table>
                </ReportSection>
                 <ReportSection title={t('budget')}>
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead><tr><th className={tableHeaderStyle}>{t('category')}</th><th className={tableHeaderStyle}>{t('allocated')}</th><th className={tableHeaderStyle}>{t('spent')}</th><th className={tableHeaderStyle}>{t('remaining')}</th></tr></thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-dark-secondary dark:divide-gray-700">{budget.map(item => <tr key={item.id} className={tableRowStyle}><td className={tableCellStyle}>{item.category}</td><td className={tableCellStyle}>{formatCurrencyEGP(item.allocated, locale)}</td><td className={tableCellStyle}>{formatCurrencyEGP(item.spent, locale)}</td><td className={tableCellStyle}>{formatCurrencyEGP(item.allocated - item.spent, locale)}</td></tr>)}</tbody>
                    </table>
                </ReportSection>
                <ReportSection title={t('risks')}>
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead><tr><th className={tableHeaderStyle}>{t('description')}</th><th className={tableHeaderStyle}>{t('likelihood')}</th><th className={tableHeaderStyle}>{t('impact')}</th></tr></thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-dark-secondary dark:divide-gray-700">{risks.map(risk => <tr key={risk.id} className={tableRowStyle}><td className={tableCellStyle}>{risk.description}</td><td className={tableCellStyle}>{risk.likelihood}</td><td className={tableCellStyle}>{risk.impact}</td></tr>)}</tbody>
                    </table>
                </ReportSection>
            </div>
        </main>
    );
};

const SettingsPage: React.FC<{ project: Project | null; activityLogs: ActivityLog[]; t: (key: string) => string; locale: Locale; }> = ({ project, activityLogs, t, locale }) => {
    if (!project) return <main className="flex-1 p-6 overflow-y-auto"><EmptyState title={t('noProjectSelected')} message={t('noProjectMessage')} /></main>;
    return (
        <main className="flex-1 p-6 overflow-y-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('settingsTitle')}</h1>
            <div className="p-4 mt-6 bg-white rounded-lg shadow dark:bg-dark-secondary">
                <h2 className="text-lg font-semibold">{t('activityLog')}</h2>
                {activityLogs.length === 0 ? <p className="mt-2 text-gray-500">{t('noActivity')}</p> : (
                    <ul className="mt-4 space-y-2">
                        {activityLogs.map(log => (
                            <li key={log.id} className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-semibold text-gray-800 dark:text-gray-200">{log.userEmail}</span> {log.action} <span className="text-xs text-gray-500">({formatDateTime(log.timestamp, locale)})</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </main>
    );
};

const ProfilePage: React.FC<{ user: User; t: (key: string) => string; }> = ({ user, t }) => {
    const [myTasks, setMyTasks] = useState<Task[]>([]);
    const [myProjects, setMyProjects] = useState<Project[]>([]);
    const [completedProjectsCount, setCompletedProjectsCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) return;
            setLoading(true);
            
            // Fetch all user-owned projects
            const projectsQuery = query(collection(db, "artifacts", appId, "public", "data", "projects"), where("ownerId", "==", user.uid));
            const projectsSnapshot = await getDocs(projectsQuery);
            const projectsData = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
            setMyProjects(projectsData);
            
            // Fetch completed projects count
            const completedProjectsQuery = query(collection(db, "artifacts", appId, "public", "data", "projects"), where("ownerId", "==", user.uid), where("status", "==", "Completed"));
            const completedProjectsSnapshot = await getDocs(completedProjectsQuery);
            setCompletedProjectsCount(completedProjectsSnapshot.size);

            // Fetch tasks assigned to the user across all their projects
            const allTasks: Task[] = [];
            for (const project of projectsData) {
                const teamQuery = collection(db, "artifacts", appId, "public", "data", "projects", project.id, "team");
                const teamSnapshot = await getDocs(teamQuery);
                const teamMembers = teamSnapshot.docs.map(d => ({id: d.id, ...d.data()})) as TeamMember[];
                const currentUserAsMember = teamMembers.find(m => m.email === user.email);

                if (currentUserAsMember) {
                    const tasksQuery = query(collection(db, "artifacts", appId, "public", "data", "projects", project.id, "tasks"), where("assigneeId", "==", currentUserAsMember.id));
                    const tasksSnapshot = await getDocs(tasksQuery);
                    tasksSnapshot.docs.forEach(doc => {
                        allTasks.push({ id: doc.id, ...doc.data(), projectId: project.id, projectName: project.name } as Task);
                    });
                }
            }
            setMyTasks(allTasks);
            setLoading(false);
        };

        fetchUserData();
    }, [user]);

    if (loading) return <main className="flex-1 p-6 overflow-y-auto"><div className="flex items-center justify-center flex-1"><BouncingLoader /></div></main>;
    
    return (
        <main className="flex-1 p-6 overflow-y-auto">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('profileTitle')}</h1>
            <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-3">
                <div className="p-4 bg-white rounded-lg shadow lg:col-span-2 dark:bg-dark-secondary">
                    <h2 className="text-lg font-semibold">{t('myTasks')}</h2>
                    {myTasks.length === 0 ? <p className="mt-2 text-gray-500">{t('noAssignedTasks')}</p> : (
                        <ul className="mt-2 space-y-2">
                            {myTasks.map(task => (
                                <li key={task.id} className="p-2 border rounded-md dark:border-gray-700">
                                    <p className="font-medium">{task.name} <span className="text-sm text-gray-500">- {task.projectName}</span></p>
                                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(task.status)} text-white`}>{task.status}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="p-4 bg-white rounded-lg shadow dark:bg-dark-secondary">
                    <h2 className="text-lg font-semibold">{t('myProjects')}</h2>
                    <ul className="mt-2 space-y-2">
                        {myProjects.map(p => <li key={p.id}>{p.name}</li>)}
                    </ul>
                    <h2 className="mt-6 text-lg font-semibold">{t('achievements')}</h2>
                    <p className="mt-2 text-gray-500">{t('achievementCompletedProjects').replace('{count}', completedProjectsCount.toString())}</p>
                </div>
            </div>
        </main>
    );
};

// 11. MAIN APP COMPONENT
const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null); const [loadingAuth, setLoadingAuth] = useState(true); const [projects, setProjects] = useState<Project[]>([]); const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null); const [theme, setTheme] = useState<'light' | 'dark'>('light'); const [locale, setLocale] = useState<Locale>('en');
    const [tasks, setTasks] = useState<Task[]>([]); const [team, setTeam] = useState<TeamMember[]>([]); const [budget, setBudget] = useState<BudgetItem[]>([]); const [risks, setRisks] = useState<Risk[]>([]); const [designs, setDesigns] = useState<Design[]>([]); const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false); const [isTaskModalOpen, setIsTaskModalOpen] = useState(false); const [isTeamMemberModalOpen, setIsTeamMemberModalOpen] = useState(false); const [isBudgetItemModalOpen, setIsBudgetItemModalOpen] = useState(false); const [isRiskModalOpen, setIsRiskModalOpen] = useState(false); const [isDesignModalOpen, setIsDesignModalOpen] = useState(false); const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null); const [editingTask, setEditingTask] = useState<Task | null>(null); const [editingMember, setEditingMember] = useState<TeamMember | null>(null); const [editingBudgetItem, setEditingBudgetItem] = useState<BudgetItem | null>(null); const [editingRisk, setEditingRisk] = useState<Risk | null>(null); const [editingDesign, setEditingDesign] = useState<Design | null>(null);
    const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string | Design; name?: string; } | null>(null);
    
    const { addToast } = useToast();
    const t = (key: string) => (translations[locale] as any)[key] || key;

    const logActivity = async (action: string) => { if (!user || !selectedProjectId) return; try { await addDoc(collection(db, "artifacts", appId, "public", "data", "projects", selectedProjectId, "activity_logs"), { userEmail: user.email, action, timestamp: serverTimestamp() }); } catch (error) { console.error("Failed to log activity:", error); } };
    
    useEffect(() => { onAuthStateChanged(auth, (user) => { setUser(user); setLoadingAuth(false); }); document.documentElement.classList.toggle('dark', theme === 'dark'); document.documentElement.lang = locale; document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'; }, [theme, locale]);
    
    // BUG FIX: Refactored project fetching to be more robust and avoid race conditions.
    useEffect(() => {
      if (!user) {
        setProjects([]);
        setSelectedProjectId(null);
        return;
      }
      const q = query(collection(db, "artifacts", appId, "public", "data", "projects"), where("ownerId", "==", user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
        setProjects(projectsData);
        setSelectedProjectId(currentId => {
            const projectExists = projectsData.some(p => p.id === currentId);
            if (currentId && projectExists) {
                return currentId; // Keep the current selection if it still exists
            }
            if (projectsData.length > 0) {
                return projectsData[0].id; // Otherwise, select the first project
            }
            return null; // Or clear selection if no projects exist
        });
      });
      return () => unsubscribe();
    }, [user]);

    useEffect(() => { if (!selectedProjectId) { setTasks([]); setTeam([]); setBudget([]); setRisks([]); setDesigns([]); setActivityLogs([]); return; } const subCollections = ["tasks", "team", "budget", "risks", "designs", "activity_logs"]; const setters:any = { tasks: setTasks, team: setTeam, budget: setBudget, risks: setRisks, designs: setDesigns, activity_logs: setActivityLogs }; const unsubs = subCollections.map(col => { const colQuery = col === 'activity_logs' ? query(collection(db, "artifacts", appId, "public", "data", "projects", selectedProjectId, col), orderBy("timestamp", "desc")) : collection(db, "artifacts", appId, "public", "data", "projects", selectedProjectId, col); return onSnapshot(colQuery, snapshot => { const data = snapshot.docs.map(d => ({id: d.id, ...d.data()})); setters[col](data); }); }); return () => unsubs.forEach(unsub => unsub()); }, [selectedProjectId]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light'); const toggleLocale = () => setLocale(prev => prev === 'en' ? 'ar' : 'en'); const handleSignOut = () => signOut(auth);
    
    const handleSave = async (type: string, data: any) => {
        if (!user || !selectedProjectId) return;
        const { id, ...payload } = data;

        // Dependency check for tasks
        if (type === 'tasks' && payload.status === 'Done' && payload.parentId) {
            const parentTask = tasks.find(t => t.id === payload.parentId);
            if (parentTask && parentTask.status !== 'Done') {
                addToast(t('parentTaskNotDoneError').replace('{parentTaskName}', parentTask.name), 'error');
                return;
            }
        }
        
        // FIX: Firestore does not accept `undefined` values. When no parent task is
        // selected, parentId can be `undefined` or an empty string from the form.
        // We convert this to `null` before saving to prevent a Firestore error.
        if (type === 'tasks' && (payload.parentId === undefined || payload.parentId === '')) {
            payload.parentId = null;
        }

        const collectionPath = ["artifacts", appId, "public", "data", "projects", selectedProjectId, type];
        try {
            if (id) { 
                await updateDoc(doc(db, ...collectionPath, id), payload); 
                logActivity(`Updated ${type.slice(0,-1)}: "${payload.name || payload.category || payload.description}"`); 
                // If a parent task is marked as done, update its subtasks
                if (type === 'tasks' && payload.status === 'Done') {
                    const batch = writeBatch(db);
                    const subtasksQuery = query(collection(db, ...collectionPath), where("parentId", "==", id));
                    const subtasksSnapshot = await getDocs(subtasksQuery);
                    subtasksSnapshot.forEach(doc => {
                        batch.update(doc.ref, { status: "Done" });
                    });
                    await batch.commit();
                }
            }
            else { 
                await addDoc(collection(db, ...collectionPath), { ...payload, priority: payload.priority || 'Medium' }); 
                logActivity(`Created new ${type.slice(0,-1)}: "${payload.name || payload.category || payload.description}"`); 
            }
        } catch (error) { console.error("Error saving item:", error); }
    };
    
    const handleSaveProject = async (projectData: any) => { if (!user) return; const { id, ...payload } = projectData; const projectsPath = ["artifacts", appId, "public", "data", "projects"]; if (id) { await updateDoc(doc(db, ...projectsPath, id), payload); logActivity(`Updated project: "${payload.name}"`); } else { const newDocRef = await addDoc(collection(db, ...projectsPath), { ...payload, ownerId: user.uid, status: 'Ongoing' }); setSelectedProjectId(newDocRef.id); } };
    const handleEditProject = (project: Project) => { setEditingProject(project); setIsNewProjectModalOpen(true); };
    const handleDelete = (type: string, id: string | Design, name?: string) => { setItemToDelete({ type, id, name }); setIsConfirmModalOpen(true); };
    
    const confirmDelete = async () => { /* ... existing delete logic ... */ if (!itemToDelete || !user) return; const { type, id, name } = itemToDelete; if (type === 'project' && typeof id === 'string') { const subCollections = ['tasks', 'team', 'budget', 'risks', 'designs', 'activity_logs']; const batch = writeBatch(db); for (const subCollection of subCollections) { const subCollectionRef = collection(db, "artifacts", appId, "public", "data", "projects", id, subCollection); const snapshot = await getDocs(subCollectionRef); snapshot.docs.forEach(doc => batch.delete(doc.ref)); } batch.delete(doc(db, "artifacts", appId, "public", "data", "projects", id)); await batch.commit(); } else if (selectedProjectId && typeof id === 'string') { const collectionPath = ["artifacts", appId, "public", "data", "projects", selectedProjectId, type]; await deleteDoc(doc(db, ...collectionPath, id)); logActivity(`Deleted ${type.slice(0,-1)}: "${name || id}"`); } else if (type === 'designs' && typeof id === 'object' && selectedProjectId) { const design = id as Design; await deleteObject(ref(storage, design.storagePath)); await deleteDoc(doc(db, "artifacts", appId, "public", "data", "projects", selectedProjectId, "designs", design.id)); logActivity(`Deleted design: "${design.name}"`); } setItemToDelete(null); setIsConfirmModalOpen(false);};
    const handleUploadDesign = async (file: File) => { if (!user || !selectedProjectId) return; const storagePath = `designs/${selectedProjectId}/${Date.now()}_${file.name}`; const storageRef = ref(storage, storagePath); await uploadBytes(storageRef, file); const downloadURL = await getDownloadURL(storageRef); await addDoc(collection(db, "artifacts", appId, "public", "data", "projects", selectedProjectId, "designs"), { name: file.name, imageUrl: downloadURL, storagePath: storagePath, uploadedAt: serverTimestamp() }); logActivity(`Uploaded new design: "${file.name}"`); };
    const handleSaveDesignName = async (design: Pick<Design, 'id'|'name'>) => { if (selectedProjectId) { await updateDoc(doc(db, "artifacts", appId, "public", "data", "projects", selectedProjectId, "designs", design.id), { name: design.name }); logActivity(`Renamed design to: "${design.name}"`); } };

    const selectedProject = projects.find(p => p.id === selectedProjectId) || null;

    if (loadingAuth) return <div className="flex items-center justify-center h-screen bg-main"><BouncingLoader /></div>;
    if (!user) return <LoginPage t={t} />;
  
    return (
        <BrowserRouter>
          <DashboardLayout user={user} projects={projects} selectedProjectId={selectedProjectId} onSelectProject={setSelectedProjectId} onNewProject={() => { setEditingProject(null); setIsNewProjectModalOpen(true); }} onEditProject={handleEditProject} onDeleteProject={(id) => handleDelete('project', id, projects.find(p=>p.id===id)?.name)} onSignOut={handleSignOut} theme={theme} toggleTheme={toggleTheme} locale={locale} toggleLocale={toggleLocale} t={t}>
            <Routes>
              <Route path="/" element={<DashboardPage project={selectedProject} tasks={tasks} team={team} budget={budget} risks={risks} t={t} locale={locale} />} />
              <Route path="/tasks" element={<TasksPage project={selectedProject} tasks={tasks} team={team} onNew={() => { setEditingTask(null); setIsTaskModalOpen(true); }} onEdit={(task) => { setEditingTask(task); setIsTaskModalOpen(true); }} onDelete={(id) => handleDelete('tasks', id, tasks.find(item=>item.id===id)?.name)} t={t} locale={locale} />} />
              <Route path="/team" element={<TeamPage project={selectedProject} team={team} onNew={() => { setEditingMember(null); setIsTeamMemberModalOpen(true); }} onEdit={(member) => { setEditingMember(member); setIsTeamMemberModalOpen(true); }} onDelete={(id) => handleDelete('team', id, team.find(item=>item.id===id)?.name)} t={t} />} />
              <Route path="/budget" element={<BudgetPage project={selectedProject} budget={budget} onNew={() => { setEditingBudgetItem(null); setIsBudgetItemModalOpen(true); }} onEdit={(item) => { setEditingBudgetItem(item); setIsBudgetItemModalOpen(true); }} onDelete={(id) => handleDelete('budget', id, budget.find(item=>item.id===id)?.category)} t={t} locale={locale} />} />
              <Route path="/risks" element={<RisksPage project={selectedProject} risks={risks} onNew={() => { setEditingRisk(null); setIsRiskModalOpen(true); }} onEdit={(risk) => { setEditingRisk(risk); setIsRiskModalOpen(true); }} onDelete={(id) => handleDelete('risks', id, risks.find(item=>item.id===id)?.description)} t={t} />} />
              <Route path="/designs" element={<DesignsPage project={selectedProject} designs={designs} onEdit={(design) => { setEditingDesign(design); setIsDesignModalOpen(true); }} onDelete={(design) => handleDelete('designs', design, design.name)} onUpload={handleUploadDesign} t={t} locale={locale} />} />
              <Route path="/reports" element={<ReportsPage project={selectedProject} tasks={tasks} team={team} budget={budget} risks={risks} t={t} locale={locale} />} />
              <Route path="/settings" element={<SettingsPage project={selectedProject} activityLogs={activityLogs} t={t} locale={locale} />} />
              <Route path="/profile" element={<ProfilePage user={user} t={t} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </DashboardLayout>
          
          <NewProjectModal isOpen={isNewProjectModalOpen} onClose={() => setIsNewProjectModalOpen(false)} onSave={handleSaveProject} editingProject={editingProject} t={t} />
          <TaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} onSave={(data) => handleSave('tasks', data)} editingTask={editingTask} team={team} tasks={tasks} t={t} />
          <TeamMemberModal isOpen={isTeamMemberModalOpen} onClose={() => setIsTeamMemberModalOpen(false)} onSave={(data) => handleSave('team', data)} editingMember={editingMember} t={t} />
          <BudgetItemModal isOpen={isBudgetItemModalOpen} onClose={() => setIsBudgetItemModalOpen(false)} onSave={(data) => handleSave('budget', data)} editingItem={editingBudgetItem} t={t} />
          <RiskModal isOpen={isRiskModalOpen} onClose={() => setIsRiskModalOpen(false)} onSave={(data) => handleSave('risks', data)} editingRisk={editingRisk} t={t} />
          <DesignModal isOpen={isDesignModalOpen} onClose={() => setIsDesignModalOpen(false)} onSave={handleSaveDesignName} editingDesign={editingDesign} t={t} />
          <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={confirmDelete} title={itemToDelete?.type === 'project' ? t('deleteProjectTitle') : t('deleteItemTitle')} message={itemToDelete?.type === 'project' ? t('deleteProjectMessage') : t('deleteItemMessage')} t={t} />
        </BrowserRouter>
    );
};

const AppWrapper: React.FC = () => (
    <ToastProvider>
        <App />
    </ToastProvider>
);

const LoginPage: React.FC<{t: (key: string) => string}> = ({ t }) => {
    const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('');
    const handleLogin = async (e: React.FormEvent) => { e.preventDefault(); setError(''); try { await signInWithEmailAndPassword(auth, email, password); } catch (err: any) { setError(err.message); } };
    return (
        <div className="flex items-center justify-center min-h-screen bg-main">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg dark:bg-dark-secondary">
                <h1 className="text-2xl font-bold text-center text-primary">{t('loginTitle')}</h1>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div> <label htmlFor="email" className={labelStyle}>{t('email')}</label> <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputStyle} required /> </div>
                    <div> <label htmlFor="password"className={labelStyle}>{t('password')}</label> <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputStyle} required /> </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button type="submit" className={`w-full ${btnPrimaryStyle}`}>{t('logIn')}</button>
                </form>
            </motion.div>
        </div>
    );
};

export default AppWrapper;