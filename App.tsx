// Yoyo Project Management - Single File Application
// This file contains the entire refactored React application, including all components, pages, types, and logic.

// 1. IMPORTS
import React, { useState, useEffect, useRef, ReactNode, createContext, useContext, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, Link, useLocation, Outlet } from 'react-router-dom';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { 
    getFirestore, collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, query, where, writeBatch, serverTimestamp, getDocs, orderBy, arrayUnion, arrayRemove
} from 'firebase/firestore';
import { 
    LayoutDashboard, Users, CheckSquare, Calendar, DollarSign, AlertTriangle, FileText, Image, Plus, Settings, X, 
    Search, Bell, LogOut, Menu, Sun, Moon, UploadCloud, Trash2, Edit, Save, PackagePlus, User as UserIcon, AlertCircle, CheckCircle, Info, Link2, ChevronDown
} from 'lucide-react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { motion, AnimatePresence } from 'framer-motion';

// 2. CHART.JS REGISTRATION
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

// 3. FIREBASE & GOOGLE DRIVE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCr6zvT7MqzlLGylTUvWlWfJudgi_nFCos",
  authDomain: "yoyo-projects-management.firebaseapp.com",
  projectId: "yoyo-projects-management",
  storageBucket: "yoyo-projects-management.firebasestorage.app", // Corrected storage bucket URL
  messagingSenderId: "314270688402",
  appId: "1:314270688402:web:4dbe40616d4732d444724b",
  measurementId: "G-9YHY63624V"
};

// Google Drive Configuration
const GOOGLE_CLIENT_ID = "314270688402-k6b4qg9u6b356h9ur6j5kqj4i4h3h8t7.apps.googleusercontent.com";
const DRIVE_FOLDER_ID = "1-UX_rC4avImjZyiYErWrlUFcirUqrCLB";

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const appId = firebaseConfig.projectId; // Use projectId as the identifier for the collection path

// 4. INTERNATIONALIZATION (i18n)
const translations = {
  en: {
    // General
    "save": "Save", "cancel": "Cancel", "delete": "Delete", "confirm": "Confirm", "edit": "Edit", "add": "Add", "urgent": "Urgent", "high": "High", "medium": "Medium", "low": "Low", "priority": "Priority", "parentTask": "Parent Task", "parent": "Parent",
    // Sidebar
    "dashboard": "Dashboard", "tasks": "Tasks", "calendar": "Calendar", "team": "Team", "budget": "Budget", "risks": "Risks", "designs": "Designs", "projects": "Projects", "settings": "Settings", "reports": "Reports",
    // Header
    "signOut": "Sign Out", "profile": "Profile",
    // Login
    "loginTitle": "ProjectHub Login", "email": "Email", "password": "Password", "logIn": "Log In",
    // Modals
    "newProject": "New Project", "editProject": "Edit Project", "projectName": "Project Name", "description": "Description", "startDate": "Start Date", "endDate": "End Date", "createProject": "Create Project", "updateProject": "Update Project",
    "deleteProjectTitle": "Delete Project", "deleteProjectMessage": "Are you sure you want to delete this project? This will permanently delete all associated tasks, team members, budget items, risks, and designs. This action cannot be undone.",
    "deleteItemTitle": "Confirm Deletion", "deleteItemMessage": "Are you sure? This cannot be undone.",
    "addTask": "Add Task", "editTask": "Edit Task", "taskName": "Task Name", "status": "Status", "assignee": "Assignee", "dueDate": "Due Date", "progress": "Progress", "reminderDate": "Reminder Date",
    "addTeamMember": "Add Team Member", "editTeamMember": "Edit Team Member", "memberName": "Member Name", "role": "Role",
    "addBudgetItem": "Add Budget Item", "editBudgetItem": "Edit Budget Item", "category": "Category", "allocatedBudget": "Allocated Budget", "spentBudget": "Amount Spent",
    "addRisk": "Add Risk", "editRisk": "Edit Risk", "likelihood": "Likelihood", "impact": "Impact", "mitigation": "Mitigation Strategy",
    "editDesign": "Edit Design", "designName": "Design Name",
    "parentTaskNotDoneError": "Cannot complete this task. Please finish parent task '{parentTaskName}' first.",
    "reminderToast": "Reminder for task: \"{taskName}\"",
    // Pages
    "noProjectSelected": "No Project Selected", "noProjectMessage": "Please select a project to begin.",
    "dashboardTitle": "Dashboard: {projectName}",
    "totalTasks": "Total Tasks", "teamMembers": "Team Members", "openRisks": "Open Risks", "budgetSpent": "Budget Spent", "taskStatus": "Task Status", "budgetOverview": "Budget Overview", "avgProjectProgress": "Avg. Project Progress",
    "tasksTitle": "Tasks for {projectName}", "noTasks": "No Tasks", "noTasksMessage": "Get started by creating a new task.",
    "calendarTitle": "Calendar for {projectName}",
    "teamTitle": "Team for {projectName}", "noTeam": "No Team Members", "noTeamMessage": "Add team members to your project.",
    "budgetTitle": "Budget for {projectName}", "noBudget": "No Budget Items", "noBudgetMessage": "Add budget items to track project expenses.", "allocated": "Allocated", "spent": "Spent", "remaining": "Remaining", "total": "Total",
    "risksTitle": "Risks for {projectName}", "noRisks": "No Risks Identified", "noRisksMessage": "Add potential risks to your project.",
    "designsTitle": "Designs for {projectName}", "designsMessage": "Upload and manage design assets for your project.", "uploadDesign": "Upload New Design", "pngFile": "PNG File", "upload": "Upload", "uploading": "Uploading...", "pngOnlyError": "Only PNG files are allowed.", "uploadError": "File upload failed. Please try again.", "uploadSuccess": "Upload successful!", "noDesigns": "No Designs Yet", "noDesignsMessage": "Upload your first design using the form above.", "uploaded": "Uploaded", "connectToGoogleDrive": "Connect to Google Drive", "googleDriveConnectMessage": "Please connect to Google Drive to manage design files.",
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
    "dashboard": "لوحة التحكم", "tasks": "المهام", "calendar": "التقويم", "team": "الفريق", "budget": "الميزانية", "risks": "المخاطر", "designs": "التصاميم", "projects": "المشاريع", "settings": "الإعدادات", "reports": "التقارير",
    // Header
    "signOut": "تسجيل الخروج", "profile": "الملف الشخصي",
    // Login
    "loginTitle": "تسجيل الدخول إلى ProjectHub", "email": "البريد الإلكتروني", "password": "كلمة المرور", "logIn": "تسجيل الدخول",
    // Modals
    "newProject": "مشروع جديد", "editProject": "تعديل المشروع", "projectName": "اسم المشروع", "description": "الوصف", "startDate": "تاريخ البدء", "endDate": "تاريخ الانتهاء", "createProject": "إنشاء مشروع", "updateProject": "تحديث المشروع",
    "deleteProjectTitle": "حذف المشروع", "deleteProjectMessage": "هل أنت متأكد أنك تريد حذف هذا المشروع؟ سيؤدي هذا إلى حذف جميع المهام وأعضاء الفريق وبنود الميزانية والمخاطر والتصاميم المرتبطة به بشكل دائم. لا يمكن التراجع عن هذا الإجراء.",
    "deleteItemTitle": "تأكيد الحذف", "deleteItemMessage": "هل أنت متأكد؟ لا يمكن التراجع عن هذا.",
    "addTask": "إضافة مهمة", "editTask": "تعديل المهمة", "taskName": "اسم المهمة", "status": "الحالة", "assignee": "المسؤول", "dueDate": "تاريخ الاستحقاق", "progress": "التقدم", "reminderDate": "تاريخ التذكير",
    "addTeamMember": "إضافة عضو للفريق", "editTeamMember": "تعديل عضو الفريق", "memberName": "اسم العضو", "role": "الدور",
    "addBudgetItem": "إضافة بند ميزانية", "editBudgetItem": "تعديل بند الميزانية", "category": "الفئة", "allocatedBudget": "الميزانية المخصصة", "spentBudget": "المبلغ المصروف",
    "addRisk": "إضافة مخاطرة", "editRisk": "تعديل المخاطرة", "likelihood": "الاحتمالية", "impact": "التأثير", "mitigation": "استراتيجية التخفيف",
    "editDesign": "تعديل التصميم", "designName": "اسم التصميم",
    "parentTaskNotDoneError": "لا يمكن إكمال هذه المهمة. يرجى إنهاء المهمة الرئيسية '{parentTaskName}' أولاً.",
    "reminderToast": "تذكير للمهمة: \"{taskName}\"",
    // Pages
    "noProjectSelected": "لم يتم تحديد مشروع", "noProjectMessage": "يرجى تحديد مشروع للبدء.",
    "dashboardTitle": "لوحة التحكم: {projectName}",
    "totalTasks": "إجمالي المهام", "teamMembers": "أعضاء الفريق", "openRisks": "المخاطر القائمة", "budgetSpent": "الميزانية المصروفة", "taskStatus": "حالة المهام", "budgetOverview": "نظرة عامة على الميزانية", "avgProjectProgress": "متوسط تقدم المشروع",
    "tasksTitle": "مهام مشروع {projectName}", "noTasks": "لا توجد مهام", "noTasksMessage": "ابدأ بإنشاء مهمة جديدة.",
    "calendarTitle": "تقويم: {projectName}",
    "teamTitle": "فريق مشروع {projectName}", "noTeam": "لا يوجد أعضاء في الفريق", "noTeamMessage": "أضف أعضاء الفريق إلى مشروعك.",
    "budgetTitle": "ميزانية مشروع {projectName}", "noBudget": "لا توجد بنود في الميزانية", "noBudgetMessage": "أضف بنود الميزانية لتتبع نفقات المشروع.", "allocated": "المخصص", "spent": "المصروف", "remaining": "المتبقي", "total": "الإجمالي",
    "risksTitle": "مخاطر مشروع {projectName}", "noRisks": "لم يتم تحديد مخاطر", "noRisksMessage": "أضف المخاطر المحتملة لمشروعك.",
    "designsTitle": "تصاميم مشروع {projectName}", "designsMessage": "قم بتحميل وإدارة أصول التصميم لمشروعك.", "uploadDesign": "تحميل تصميم جديد", "pngFile": "ملف PNG", "upload": "تحميل", "uploading": "جاري التحميل...", "pngOnlyError": "يُسمح بملفات PNG فقط.", "uploadError": "فشل تحميل الملف. يرجى المحاولة مرة أخرى.", "uploadSuccess": "تم التحميل بنجاح!", "noDesigns": "لا توجد تصاميم بعد", "noDesignsMessage": "قم بتحميل تصميمك الأول باستخدام النموذج أعلاه.", "uploaded": "تم الرفع", "connectToGoogleDrive": "الاتصال بـ Google Drive", "googleDriveConnectMessage": "يرجى الاتصال بـ Google Drive لإدارة ملفات التصميم.",
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
  progress?: number;
  reminderDate?: string;
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
  id:string; ownerId:string; name:string; description:string; startDate:string; endDate:string; status?: string; members: string[];
}
export interface Design {
  id:string; // Google Drive file ID
  name:string;
  webViewLink: string; // Link to view in Drive UI
  createdTime: string;
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
  if (!dateString) return '';
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
        { name: t('dashboard'), icon: <LayoutDashboard size={20} />, path: '/' }, { name: t('tasks'), icon: <CheckSquare size={20} />, path: '/tasks' }, { name: t('calendar'), icon: <Calendar size={20} />, path: '/calendar' }, { name: t('team'), icon: <Users size={20} />, path: '/team' }, { name: t('budget'), icon: <DollarSign size={20} />, path: '/budget' }, { name: t('risks'), icon: <AlertTriangle size={20} />, path: '/risks' }, { name: t('designs'), icon: <Image size={20} />, path: '/designs' }, { name: t('reports'), icon: <FileText size={20} />, path: '/reports' }, { name: t('settings'), icon: <Settings size={20} />, path: '/settings' },
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
                            <motion.button whileTap={{scale:0.9}} onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"> <Trash2 size={14} /> </motion.button>
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

// 9. PLACEHOLDER PAGE COMPONENTS
const PlaceholderPage: React.FC<{ title: string; }> = ({ title }) => (
    <div className="p-6 md:p-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h1>
        <div className="mt-8">
            <EmptyState title={`${title} Page`} message="Content for this page is under construction." />
        </div>
    </div>
);

const ProjectScope: React.FC<{t: (key: string) => string}> = ({ t }) => {
    const location = useLocation();
    const isProfilePage = location.pathname === '/profile';

    if (isProfilePage) {
        return <Outlet />;
    }

    const { currentProject } = useProjectContext();

    if (!currentProject) {
        return (
            <div className="flex items-center justify-center h-full">
                <EmptyState title={t('noProjectSelected')} message={t('noProjectMessage')} />
            </div>
        );
    }
    return <Outlet />;
};


// 10. AUTHENTICATION PAGE
// FIX: Changed onLogin return type from Promise<void> to Promise<any> to match the return type of signInWithEmailAndPassword.
const LoginPage: React.FC<{ onLogin: (email: string, pass: string) => Promise<any>; t: (key: string) => string; }> = ({ onLogin, t }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await onLogin(email, password);
        } catch (err: any) {
            setError(err.message || 'Failed to sign in. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-dark-primary">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg dark:bg-dark-secondary"
            >
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-primary">ProjectHub</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">{t('loginTitle')}</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email-address" className="sr-only">{t('email')}</label>
                            <input id="email-address" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder={t('email')} />
                        </div>
                        <div>
                            <label htmlFor="password">{t('password')}</label>
                            <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder={t('password')} />
                        </div>
                    </div>
                    {error && <p className="text-sm text-center text-red-500">{error}</p>}
                    <div>
                        <button type="submit" disabled={isLoading} className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md group bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark disabled:opacity-50">
                            {isLoading ? <BouncingLoader /> : t('logIn')}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};


// 11. CONTEXT FOR PROJECT DATA
interface ProjectContextType {
    currentProject: Project | null;
    projects: Project[];
}
const ProjectContext = createContext<ProjectContextType>({ currentProject: null, projects: [] });
export const useProjectContext = () => useContext(ProjectContext);


// 12. DESIGNS PAGE (WITH GOOGLE DRIVE INTEGRATION)
const DesignsPage: React.FC<{ t: (key: string) => string; locale: Locale }> = ({ t, locale }) => {
    const { currentProject } = useProjectContext();
    const { addToast } = useToast();
    const [token, setToken] = useState<any>(null);
    const [designs, setDesigns] = useState<Design[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const useGoogleLogin = (window as any).ReactOAuthGoogle.useGoogleLogin;

    const login = useGoogleLogin({
        onSuccess: (tokenResponse: any) => setToken(tokenResponse),
        scope: 'https://www.googleapis.com/auth/drive.file',
    });

    const fetchDesigns = async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const response = await fetch(`https://www.googleapis.com/drive/v3/files?q='${DRIVE_FOLDER_ID}' in parents and trashed = false&fields=files(id,name,webViewLink,createdTime)`, {
                headers: { Authorization: `Bearer ${token.access_token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch files');
            const data = await response.json();
            setDesigns(data.files || []);
        } catch (error) {
            console.error(error);
            addToast(t('uploadError'), 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if(token) fetchDesigns();
        else setIsLoading(false)
    }, [token]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== 'image/png') {
            addToast(t('pngOnlyError'), 'error');
            return;
        }

        setIsUploading(true);
        try {
            const metadata = { name: file.name, parents: [DRIVE_FOLDER_ID] };
            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', file);

            const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token.access_token}` },
                body: form,
            });

            if (!res.ok) throw new Error('Upload failed');
            addToast(t('uploadSuccess'), 'success');
            fetchDesigns();
        } catch (error) {
            console.error(error);
            addToast(t('uploadError'), 'error');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDelete = async (fileId: string) => {
        if (!window.confirm(t('deleteItemMessage'))) return;
        try {
            const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token.access_token}` }
            });
            if (!res.ok) throw new Error('Delete failed');
            addToast('File deleted successfully', 'success');
            setDesigns(designs.filter(d => d.id !== fileId));
        } catch (error) {
            console.error(error);
            addToast('Failed to delete file', 'error');
        }
    };
    
    if (!token) {
        return (
            <div className="p-6 md:p-8">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('designsTitle').replace('{projectName}', currentProject?.name || '')}</h1>
                <div className="mt-8">
                    <EmptyState
                        title={t('connectToGoogleDrive')}
                        message={t('googleDriveConnectMessage')}
                        action={<button onClick={() => login()} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark">{t('connectToGoogleDrive')}</button>}
                    />
                </div>
            </div>
        );
    }
    
    return (
        <div className="p-6 md:p-8">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('designsTitle').replace('{projectName}', currentProject?.name || '')}</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">{t('designsMessage')}</p>

            <div className="mt-6 p-6 bg-white rounded-lg shadow-md dark:bg-dark-secondary">
                <h2 className="text-lg font-semibold">{t('uploadDesign')}</h2>
                <div className="mt-4">
                    <label htmlFor="file-upload" className="sr-only">{t('pngFile')}</label>
                    <input ref={fileInputRef} id="file-upload" type="file" accept="image/png" onChange={handleFileUpload} disabled={isUploading} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary dark:file:bg-primary/20 dark:file:text-light hover:file:bg-primary/20" />
                </div>
                {isUploading && <div className="flex items-center mt-4 space-x-2 text-sm text-gray-500"><BouncingLoader /><p>{t('uploading')}</p></div>}
            </div>

            <div className="mt-8">
                {isLoading ? <BouncingLoader /> : designs.length === 0 ? (
                    <EmptyState title={t('noDesigns')} message={t('noDesignsMessage')} />
                ) : (
                    <div className="overflow-x-auto bg-white rounded-lg shadow dark:bg-dark-secondary">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">{t('designName')}</th>
                                    <th scope="col" className="px-6 py-3">{t('uploaded')}</th>
                                    <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {designs.map((design) => (
                                    <motion.tr key={design.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{design.name}</th>
                                        <td className="px-6 py-4">{formatDate(design.createdTime, locale)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <a href={design.webViewLink} target="_blank" rel="noopener noreferrer" className="mr-4 font-medium text-primary dark:text-primary-light hover:underline"><Link2 size={16} className="inline"/></a>
                                            <button onClick={() => handleDelete(design.id)} className="font-medium text-red-600 dark:text-red-500 hover:underline"><Trash2 size={16} className="inline"/></button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};


// 13. MAIN APP COMPONENT
const App = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light');
    const [locale, setLocale] = useState<Locale>(() => (localStorage.getItem('locale') as Locale) || 'en');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => localStorage.getItem('selectedProjectId'));
    
    const currentProject = useMemo(() => projects.find(p => p.id === selectedProjectId) || null, [projects, selectedProjectId]);

    const t = (key: string) => (translations[locale] as any)[key] || key;

    const GoogleOAuthProvider = (window as any).ReactOAuthGoogle?.GoogleOAuthProvider;

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        document.documentElement.lang = locale;
        document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
        localStorage.setItem('locale', locale);
    }, [locale]);
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            if (!user) {
                setSelectedProjectId(null);
                setProjects([]);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
            const q = query(collection(db, "projects"), where("members", "array-contains", user.uid));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const projectsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
                setProjects(projectsData);
                if (projectsData.length > 0 && !projectsData.some(p => p.id === selectedProjectId)) {
                    const newProjectId = projectsData[0].id;
                    setSelectedProjectId(newProjectId);
                    localStorage.setItem('selectedProjectId', newProjectId);
                } else if (projectsData.length === 0) {
                    setSelectedProjectId(null);
                    localStorage.removeItem('selectedProjectId');
                }
            });
            return () => unsubscribe();
        }
    }, [user, selectedProjectId]);

    const handleLogin = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
    const handleSignOut = () => signOut(auth);
    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    const toggleLocale = () => setLocale(prev => prev === 'en' ? 'ar' : 'en');
    const handleSelectProject = (id: string) => {
        setSelectedProjectId(id);
        localStorage.setItem('selectedProjectId', id);
    };

    if (loading) {
        return <div className="flex items-center justify-center w-full h-screen bg-gray-50 dark:bg-dark-primary"><BouncingLoader /></div>;
    }

    if (!user) {
        return <LoginPage onLogin={handleLogin} t={t} />;
    }

    if (!GoogleOAuthProvider) {
        return <div className="flex items-center justify-center w-full h-screen bg-gray-50 dark:bg-dark-primary"><BouncingLoader /></div>;
    }
    
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <ToastProvider>
                <ProjectContext.Provider value={{ currentProject, projects }}>
                    <BrowserRouter>
                        <div className={`flex h-screen bg-gray-100 dark:bg-dark-primary text-gray-900 dark:text-gray-100`}>
                            <Sidebar 
                                projects={projects}
                                selectedProjectId={selectedProjectId}
                                onSelectProject={handleSelectProject}
                                onNewProject={() => alert('New Project clicked')}
                                onEditProject={(p) => alert(`Edit ${p.name}`)}
                                onDeleteProject={(id) => alert(`Delete ${id}`)}
                                isOpen={isSidebarOpen}
                                onClose={() => setSidebarOpen(false)}
                                t={t}
                            />
                            <div className="flex flex-col flex-1 overflow-hidden">
                                <Header 
                                    user={user}
                                    onSignOut={handleSignOut}
                                    onMenuClick={() => setSidebarOpen(true)}
                                    theme={theme}
                                    toggleTheme={toggleTheme}
                                    locale={locale}
                                    toggleLocale={toggleLocale}
                                    t={t}
                                />
                                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-dark-primary">
                                    <Routes>
                                        <Route element={<ProjectScope t={t} />}>
                                            <Route path="/" element={<PlaceholderPage title={t('dashboard')} />} />
                                            <Route path="/tasks" element={<PlaceholderPage title={t('tasks')} />} />
                                            <Route path="/calendar" element={<PlaceholderPage title={t('calendar')} />} />
                                            <Route path="/team" element={<PlaceholderPage title={t('team')} />} />
                                            <Route path="/budget" element={<PlaceholderPage title={t('budget')} />} />
                                            <Route path="/risks" element={<PlaceholderPage title={t('risks')} />} />
                                            <Route path="/designs" element={<DesignsPage t={t} locale={locale} />} />
                                            <Route path="/reports" element={<PlaceholderPage title={t('reports')} />} />
                                            <Route path="/settings" element={<PlaceholderPage title={t('settings')} />} />
                                        </Route>
                                        <Route path="/profile" element={<PlaceholderPage title={t('profile')} />} />
                                        <Route path="*" element={<Navigate to="/" />} />
                                    </Routes>
                                </main>
                            </div>
                        </div>
                    </BrowserRouter>
                </ProjectContext.Provider>
            </ToastProvider>
        </GoogleOAuthProvider>
    );
};

export default App;