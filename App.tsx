
import React, { useState, useEffect, createContext, useContext, ReactNode, useMemo } from 'react';
import { LayoutDashboard, Users, ListChecks, GanttChartSquare, ChevronsUpDown, PlusCircle, Wallet, ShieldAlert, X, Rocket, Trash2, Search, Bell, Languages, Menu, LogOut, DollarSign, Calendar, CheckCircle, ListTodo, Pencil, UserPlus, Mail, Briefcase, Filter, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';

// --- TYPE DEFINITIONS (from types.ts) ---
export enum TaskStatus {
  InProgress = 'In Progress',
  Completed = 'Completed',
  Postponed = 'Postponed',
  NotStarted = 'Not Started'
}

export enum UserRole {
  Designer = 'Designer',
  Production = 'Production',
  Marketing = 'Marketing',
  ProjectManager = 'Project Manager',
  Developer = 'Developer'
}

export enum RiskSeverity {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export interface TeamMember {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
  email: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  assignedTo: string; // TeamMember ID
  status: TaskStatus;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface BudgetItem {
  id: string;
  name: string;
  expectedCost: number;
  actualCost: number;
}

export interface Risk {
  id: string;
  description: string;
  severity: RiskSeverity;
  solution: string;
}

export interface Project {
  id: string;
  name: string;
  goal: string;
  duration: {
    start: string; // YYYY-MM-DD
    end: string; // YYYY-MM-DD
  };
  budget: number;
  team: TeamMember[];
  tasks: Task[];
  budgetItems: BudgetItem[];
  risks: Risk[];
}

export type Page = 'Dashboard' | 'Team' | 'Tasks' | 'Timeline' | 'Budget' | 'Risks';

// --- HELPER FUNCTIONS (from utils/helpers.ts) ---
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getDaysDifference = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const difference = end.getTime() - start.getTime();
    return Math.ceil(difference / (1000 * 3600 * 24));
};

const formatCurrency = (amount: number, currency: string = 'EGP'): string => {
    return new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

// --- LOCALIZATION CONTEXT (from context/LocalizationContext.tsx & hooks/useLocalization.ts) ---
const en = {
  "dashboard": "Dashboard", "team": "Team", "tasks": "Tasks", "timeline": "Timeline", "budget": "Budget", "risks": "Risks", "appNameEnglish": "Yoyo Projects Management", "appNameArabic": "يويو لإدارة المشاريع", "selectProject": "Select Project", "newProject": "New Project", "upgradeToPro": "Upgrade to Pro", "getMoreFeatures": "Get more features and enhance your productivity.", "upgradeNow": "Upgrade Now", "search": "Search...", "projectLength": "Project Length", "days": "Days", "teamSize": "Team Size", "completedTasks": "Completed Tasks", "projectGoal": "Project Goal", "editProject": "Edit Project", "projectProgress": "Project Progress", "start": "Start", "end": "End", "daysLeft": "days left", "overdue": "Overdue", "taskStatus": "Task Status", "recentTasks": "Recent Tasks", "unassigned": "Unassigned", "noTasksAdded": "No tasks have been added to this project yet.", "noProjectSelected": "No Project Selected", "selectOrCreateProject": "Please select a project from the sidebar or create a new one.", "teamMembers": "Team Members", "addMember": "Add Member", "tasksAssigned": "tasks assigned", "noTeamMembers": "No Team Members", "addMembersToProject": "Add members to your project to get started.", "taskList": "Task List", "filter": "Filter", "addTask": "Add Task", "taskName": "Task Name", "assignedTo": "Assigned To", "status": "Status", "startDate": "Start Date", "endDate": "End Date", "actions": "Actions", "editTask": "Edit Task", "deleteTask": "Delete Task", "noTasksFound": "No tasks found for this project.", "deleteTaskConfirmation": "Are you sure you want to delete this task?", "projectTimeline": "Project Timeline", "noProjectDuration": "Project duration is not set. Please edit the project to add a start and end date.", "noTasksForTimeline": "No tasks in this project yet. Add tasks to see the timeline.", "createNewProject": "Create New Project", "projectName": "Project Name", "budgetPlaceholder": "e.g., 50000", "cancel": "Cancel", "createProject": "Create Project", "saveChanges": "Save Changes", "fillAllFieldsError": "Please fill all fields.", "dateValidationError": "Start date cannot be after end date.", "addNewTask": "Add New Task", "description": "Description", "budgetManagement": "Budget Management", "addBudgetItem": "Add Budget Item", "totalBudget": "Total Budget", "totalSpent": "Total Spent", "remaining": "Remaining", "overBudget": "Over Budget", "noBudgetItems": "No budget items have been added to this project yet.", "budgetItemName": "Item Name", "expectedCost": "Expected Cost", "actualCost": "Actual Cost", "variance": "Variance", "editItem": "Edit Item", "deleteItem": "Delete Item", "deleteBudgetItemConfirmation": "Are you sure you want to delete this budget item?", "addNewBudgetItem": "Add New Budget Item", "editBudgetItem": "Edit Budget Item", "riskManagement": "Risk Management", "addRisk": "Add Risk", "riskDescription": "Risk Description", "severity": "Severity", "mitigationSolution": "Mitigation Solution", "noRisks": "No risks have been identified for this project.", "deleteRiskConfirmation": "Are you sure you want to delete this risk?", "addNewRisk": "Add New Risk", "editRisk": "Edit Risk", "day": "Day", "week": "Week", "month": "Month", "deleteProject": "Delete Project", "deleteProjectConfirmation": "Are you sure you want to delete this project? This action cannot be undone."
};
const ar = {
  "dashboard": "لوحة التحكم", "team": "الفريق", "tasks": "المهام", "timeline": "الجدول الزمني", "budget": "الميزانية", "risks": "المخاطر", "appNameEnglish": "Yoyo Projects Management", "appNameArabic": "يويو لإدارة المشاريع", "selectProject": "اختر مشروعًا", "newProject": "مشروع جديد", "upgradeToPro": "الترقية إلى Pro", "getMoreFeatures": "احصل على المزيد من الميزات وعزز إنتاجيتك.", "upgradeNow": "الترقية الآن", "search": "بحث...", "projectLength": "مدة المشروع", "days": "أيام", "teamSize": "حجم الفريق", "completedTasks": "المهام المكتملة", "projectGoal": "هدف المشروع", "editProject": "تعديل المشروع", "projectProgress": "تقدم المشروع", "start": "البداية", "end": "النهاية", "daysLeft": "أيام متبقية", "overdue": "متأخر", "taskStatus": "حالة المهام", "recentTasks": "المهام الأخيرة", "unassigned": "غير معين", "noTasksAdded": "لم تتم إضافة أي مهام إلى هذا المشروع بعد.", "noProjectSelected": "لم يتم تحديد أي مشروع", "selectOrCreateProject": "يرجى تحديد مشروع من الشريط الجانبي أو إنشاء مشروع جديد.", "teamMembers": "أعضاء الفريق", "addMember": "إضافة عضو", "tasksAssigned": "مهام مسندة", "noTeamMembers": "لا يوجد أعضاء في الفريق", "addMembersToProject": "أضف أعضاء إلى مشروعك للبدء.", "taskList": "قائمة المهام", "filter": "تصفية", "addTask": "إضافة مهمة", "taskName": "اسم المهمة", "assignedTo": "مسندة إلى", "status": "الحالة", "startDate": "تاريخ البدء", "endDate": "تاريخ الانتهاء", "actions": "الإجراءات", "editTask": "تعديل المهمة", "deleteTask": "حذف المهمة", "noTasksFound": "لم يتم العثور على مهام لهذا المشروع.", "deleteTaskConfirmation": "هل أنت متأكد أنك تريد حذف هذه المهمة؟", "projectTimeline": "الجدول الزمني للمشروع", "noProjectDuration": "لم يتم تعيين مدة المشروع. يرجى تعديل المشروع لإضافة تاريخ بدء وانتهاء.", "noTasksForTimeline": "لا توجد مهام في هذا المشروع بعد. أضف مهامًا لرؤية الجدول الزمني.", "createNewProject": "إنشاء مشروع جديد", "projectName": "اسم المشروع", "budgetPlaceholder": "مثال: 50000", "cancel": "إلغاء", "createProject": "إنشاء المشروع", "saveChanges": "حفظ التغييرات", "fillAllFieldsError": "يرجى ملء جميع الحقول.", "dateValidationError": "لا يمكن أن يكون تاريخ البدء بعد تاريخ الانتهاء.", "addNewTask": "إضافة مهمة جديدة", "description": "الوصف", "budgetManagement": "إدارة الميزانية", "addBudgetItem": "إضافة بند ميزانية", "totalBudget": "إجمالي الميزانية", "totalSpent": "إجمالي المصروفات", "remaining": "المتبقي", "overBudget": "تجاوز الميزانية", "noBudgetItems": "لم تتم إضافة أي بنود ميزانية لهذا المشروع بعد.", "budgetItemName": "اسم البند", "expectedCost": "التكلفة المتوقعة", "actualCost": "التكلفة الفعلية", "variance": "الفرق", "editItem": "تعديل البند", "deleteItem": "حذف البند", "deleteBudgetItemConfirmation": "هل أنت متأكد أنك تريد حذف بند الميزانية هذا؟", "addNewBudgetItem": "إضافة بند ميزانية جديد", "editBudgetItem": "تعديل بند الميزانية", "riskManagement": "إدارة المخاطر", "addRisk": "إضافة مخاطرة", "riskDescription": "وصف المخاطرة", "severity": "الخطورة", "mitigationSolution": "الحل المقترح", "noRisks": "لم يتم تحديد أي مخاطر لهذا المشروع.", "deleteRiskConfirmation": "هل أنت متأكد أنك تريد حذف هذه المخاطرة؟", "addNewRisk": "إضافة مخاطرة جديدة", "editRisk": "تعديل المخاطرة", "day": "يوم", "week": "أسبوع", "month": "شهر", "deleteProject": "حذف المشروع", "deleteProjectConfirmation": "هل أنت متأكد أنك تريد حذف هذا المشروع؟ هذا الإجراء لا يمكن التراجع عنه."
};
type Language = 'en' | 'ar';
type Translations = typeof en;
interface LocalizationContextType { language: Language; setLanguage: (language: Language) => void; t: (key: keyof Translations, fallback?: string) => string; dir: 'ltr' | 'rtl';}
const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);
const translations: Record<Language, Translations> = { en, ar };
const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const t = (key: keyof Translations, fallback?: string): string => translations[language][key] || fallback || String(key);
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);
  return (<LocalizationContext.Provider value={{ language, setLanguage, t, dir }}>{children}</LocalizationContext.Provider>);
};
const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (context === undefined) { throw new Error('useLocalization must be used within a LocalizationProvider');}
  return context;
};

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = (window as any).__firebase_config;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const getCollectionPath = (path: string) => `artifacts/${(window as any).APP_ID}/public/data/${path}`;
const projectsCollectionRef = () => collection(db, getCollectionPath('projects'));
const projectDocRef = (projectId: string) => doc(db, getCollectionPath(`projects/${projectId}`));
const subCollectionRef = (projectId: string, subCollection: string) => collection(db, getCollectionPath(`projects/${projectId}/${subCollection}`));

// --- REUSABLE UI COMPONENTS ---

const Card: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color?: string; children?: React.ReactNode; }> = ({ title, value, icon, color = 'bg-primary', children }) => (
  <div className="bg-white dark:bg-dark-secondary p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">{title}</p>
        <p className="text-3xl font-bold text-dark dark:text-light mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color} text-white`}>{icon}</div>
    </div>
    {children}
  </div>
);

const Alert: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void; }> = ({ message, type, onClose }) => {
    const baseClasses = "fixed top-5 right-5 z-[100] p-4 rounded-lg shadow-lg flex items-center animate-fade-in-down";
    const typeClasses = {
        success: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
        error: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
    };
    return (
        <div className={`${baseClasses} ${typeClasses[type]}`}>
            <span className="flex-grow">{message}</span>
            <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-black/10"><X size={18} /></button>
        </div>
    );
};

const ConfirmationModal: React.FC<{ isOpen: boolean; message: string; onConfirm: () => void; onCancel: () => void; }> = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-xl p-6 w-full max-w-sm transform transition-all animate-fade-in-up">
                <h3 className="text-lg font-semibold text-dark dark:text-light mb-4">Confirmation</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold transition">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold transition">Confirm</button>
                </div>
            </div>
        </div>
    );
};

// --- MODAL COMPONENTS ---

const NewProjectModal: React.FC<{ onClose: () => void; onSubmit: (data: any) => void; projectToEdit?: Project | null; showAlert: (message: string, type?: 'success' | 'error') => void; }> = ({ onClose, onSubmit, projectToEdit, showAlert }) => {
  const { t } = useLocalization();
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState(0);
  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setGoal(projectToEdit.goal);
      setStartDate(projectToEdit.duration.start);
      setEndDate(projectToEdit.duration.end);
      setBudget(projectToEdit.budget);
    }
  }, [projectToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !goal || !startDate || !endDate || budget <= 0) {
      showAlert(t('fillAllFieldsError')); return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      showAlert(t('dateValidationError')); return;
    }
    onSubmit({ id: projectToEdit?.id, name, goal, startDate, endDate, budget });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-xl p-6 w-full max-w-lg transform transition-all animate-fade-in-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-dark dark:text-light">{projectToEdit ? t('editProject') : t('createNewProject')}</h2>
          <button onClick={onClose} aria-label="Close modal" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('projectName')}</label><input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          <div><label htmlFor="goal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('projectGoal')}</label><textarea id="goal" value={goal} onChange={(e) => setGoal(e.target.value)} required rows={3} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"></textarea></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('startDate')}</label><input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('endDate')}</label><input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          </div>
          <div><label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('budget')} (EGP)</label><input type="number" id="budget" value={budget === 0 ? '' : budget} onChange={(e) => setBudget(Number(e.target.value))} required min="1" placeholder={t('budgetPlaceholder')} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold transition">{t('cancel')}</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark font-semibold transition">{projectToEdit ? t('saveChanges') : t('createProject')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TaskModal: React.FC<{ onClose: () => void; onSubmit: (data: any) => void; taskToEdit: Task | null; teamMembers: TeamMember[]; showAlert: (message: string, type?: 'success' | 'error') => void; }> = ({ onClose, onSubmit, taskToEdit, teamMembers, showAlert }) => {
    const { t } = useLocalization();
    // FIX: Explicitly type the formData state to allow for an optional `id`, resolving the error when setting form data for an existing task.
    const [formData, setFormData] = useState<Omit<Task, 'id'> & { id?: string }>({ name: '', description: '', assignedTo: '', status: TaskStatus.NotStarted, startDate: '', endDate: '' });
    useEffect(() => {
        if (taskToEdit) {
            setFormData(taskToEdit);
        } else if (teamMembers.length > 0) {
            // Set default assignee only if one isn't already set to avoid overriding user selection.
            setFormData(prev => {
                if (prev.assignedTo) {
                    return prev;
                }
                return { ...prev, assignedTo: teamMembers[0].id };
            });
        }
    }, [taskToEdit, teamMembers]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.startDate || !formData.endDate) {
            showAlert(t('fillAllFieldsError')); return;
        }
        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            showAlert(t('dateValidationError')); return;
        }
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-xl p-6 w-full max-w-lg transform transition-all animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-dark dark:text-light">{taskToEdit ? t('editTask') : t('addNewTask')}</h2>
                    <button onClick={onClose} aria-label="Close modal" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('taskName')}</label><input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                    <div><label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('description')}</label><textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"></textarea></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('assignedTo')}</label><select id="assignedTo" name="assignedTo" value={formData.assignedTo} onChange={handleChange} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary">{teamMembers.length > 0 ? teamMembers.map(member => (<option key={member.id} value={member.id}>{member.name}</option>)) : <option disabled>{t('noTeamMembers')}</option>}</select></div>
                        <div><label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('status')}</label><select id="status" name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary">{Object.values(TaskStatus).map(status => (<option key={status} value={status}>{status}</option>))}</select></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('startDate')}</label><input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} required className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                        <div><label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('endDate')}</label><input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} required className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold transition">{t('cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark font-semibold transition">{taskToEdit ? t('saveChanges') : t('addTask')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TeamMemberModal: React.FC<{ onClose: () => void; onSubmit: (data: any) => void; memberToEdit: TeamMember | null; showAlert: (message: string, type?: 'success' | 'error') => void; }> = ({ onClose, onSubmit, memberToEdit, showAlert }) => {
    const { t } = useLocalization();
    const [formData, setFormData] = useState({ name: '', role: UserRole.Developer, email: '', avatarUrl: '' });
    useEffect(() => {
        if (memberToEdit) {
            setFormData({ name: memberToEdit.name, role: memberToEdit.role, email: memberToEdit.email, avatarUrl: memberToEdit.avatarUrl });
        }
    }, [memberToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email) {
            showAlert('Please fill all required fields.'); return;
        }
        const finalData = { ...formData, avatarUrl: formData.avatarUrl || `https://i.pravatar.cc/150?u=${formData.email}` };
        onSubmit({ id: memberToEdit?.id, ...finalData });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-xl p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-dark dark:text-light">{memberToEdit ? 'Edit Team Member' : 'Add Team Member'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div><label htmlFor="name" className="block text-sm font-medium mb-1">Name</label><input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                    <div><label htmlFor="email" className="block text-sm font-medium mb-1">Email</label><input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                    <div><label htmlFor="role" className="block text-sm font-medium mb-1">Role</label><select id="role" name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">{Object.values(UserRole).map(role => (<option key={role} value={role}>{role}</option>))}</select></div>
                    <div><label htmlFor="avatarUrl" className="block text-sm font-medium mb-1">Avatar URL (Optional)</label><input type="text" id="avatarUrl" name="avatarUrl" value={formData.avatarUrl} onChange={handleChange} placeholder="Defaults to a random avatar" className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold">{t('cancel')}</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark font-semibold">{memberToEdit ? t('saveChanges') : t('addMember')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const BudgetModal: React.FC<{ onClose: () => void; onSubmit: (data: any) => void; itemToEdit: BudgetItem | null; showAlert: (message: string, type?: 'success' | 'error') => void; }> = ({ onClose, onSubmit, itemToEdit, showAlert }) => {
  const { t } = useLocalization();
  const [name, setName] = useState('');
  const [expectedCost, setExpectedCost] = useState(0);
  const [actualCost, setActualCost] = useState(0);
  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setExpectedCost(itemToEdit.expectedCost);
      setActualCost(itemToEdit.actualCost);
    }
  }, [itemToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || expectedCost <= 0) {
        showAlert(t('fillAllFieldsError')); return;
    }
    onSubmit({ id: itemToEdit?.id, name, expectedCost, actualCost });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-dark dark:text-light">{itemToEdit ? t('editBudgetItem') : t('addNewBudgetItem')}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label htmlFor="name" className="block text-sm font-medium mb-1">{t('budgetItemName')}</label><input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label htmlFor="expectedCost" className="block text-sm font-medium mb-1">{t('expectedCost')} (EGP)</label><input type="number" id="expectedCost" value={expectedCost === 0 ? '' : expectedCost} onChange={(e) => setExpectedCost(Number(e.target.value))} required min="1" className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" /></div>
            <div><label htmlFor="actualCost" className="block text-sm font-medium mb-1">{t('actualCost')} (EGP)</label><input type="number" id="actualCost" value={actualCost === 0 ? '' : actualCost} onChange={(e) => setActualCost(Number(e.target.value))} min="0" className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" /></div>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold">{t('cancel')}</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark font-semibold">{itemToEdit ? t('saveChanges') : t('addBudgetItem')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RiskModal: React.FC<{ onClose: () => void; onSubmit: (data: any) => void; riskToEdit: Risk | null; showAlert: (message: string, type?: 'success' | 'error') => void; }> = ({ onClose, onSubmit, riskToEdit, showAlert }) => {
  const { t } = useLocalization();
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<RiskSeverity>(RiskSeverity.Medium);
  const [solution, setSolution] = useState('');
  useEffect(() => {
    if (riskToEdit) {
      setDescription(riskToEdit.description);
      setSeverity(riskToEdit.severity);
      setSolution(riskToEdit.solution);
    }
  }, [riskToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !solution) {
        showAlert(t('fillAllFieldsError')); return;
    }
    onSubmit({ id: riskToEdit?.id, description, severity, solution });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-dark-secondary rounded-xl shadow-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-dark dark:text-light">{riskToEdit ? t('editRisk') : t('addNewRisk')}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label htmlFor="description" className="block text-sm font-medium mb-1">{t('riskDescription')}</label><textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"></textarea></div>
          <div><label htmlFor="severity" className="block text-sm font-medium mb-1">{t('severity')}</label><select id="severity" value={severity} onChange={(e) => setSeverity(e.target.value as RiskSeverity)} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary">{Object.values(RiskSeverity).map(level => (<option key={level} value={level}>{level}</option>))}</select></div>
          <div><label htmlFor="solution" className="block text-sm font-medium mb-1">{t('mitigationSolution')}</label><textarea id="solution" value={solution} onChange={(e) => setSolution(e.target.value)} required rows={3} className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"></textarea></div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold">{t('cancel')}</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark font-semibold">{riskToEdit ? t('saveChanges') : t('addRisk')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- CORE LAYOUT COMPONENTS ---

const Sidebar: React.FC<{ activePage: Page; setActivePage: (page: Page) => void; projects: Project[]; selectedProjectId: string | null; onSelectProject: (id: string) => void; onNewProject: () => void; onDeleteProject: (id: string) => void; isSidebarOpen: boolean; onClose: () => void; }> = ({ activePage, setActivePage, projects, selectedProjectId, onSelectProject, onNewProject, onDeleteProject, isSidebarOpen, onClose }) => {
    const { t } = useLocalization();
    const navItems: { label: Page; icon: React.ReactNode }[] = [
        { label: 'Dashboard', icon: <LayoutDashboard size={22} /> }, { label: 'Team', icon: <Users size={22} /> }, { label: 'Tasks', icon: <ListChecks size={22} /> }, { label: 'Timeline', icon: <GanttChartSquare size={22} /> }, { label: 'Budget', icon: <Wallet size={22} /> }, { label: 'Risks', icon: <ShieldAlert size={22} /> },
    ];
    const [isProjectDropdownOpen, setProjectDropdownOpen] = useState(false);
    const selectedProject = projects.find(p => p.id === selectedProjectId);
    const handleSelectProject = (projectId: string) => { onSelectProject(projectId); setProjectDropdownOpen(false); };
    const handleDeleteClick = (e: React.MouseEvent, projectId: string) => { e.stopPropagation(); onDeleteProject(projectId); setProjectDropdownOpen(false); };
    const NavItem: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void; }> = ({ icon, label, isActive, onClick }) => (<li onClick={onClick} className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-primary text-white shadow-lg' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-secondary'}`}>{icon}<span className="ms-4 font-medium">{label}</span></li>);

    return (
        <>
            {isSidebarOpen && (<div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={onClose}></div>)}
            <aside className={`fixed md:relative inset-y-0 start-0 z-50 w-64 flex-shrink-0 bg-white dark:bg-dark-secondary p-4 border-e border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="flex items-center justify-center mb-6 relative">
                    <div className="flex flex-col items-center text-center">
                        <div className="bg-primary rounded-lg p-2 mb-2"><Rocket size={28} className="text-white" /></div>
                        <h1 className="text-lg font-bold text-dark dark:text-light leading-tight">{t('appNameEnglish')}</h1><p className="text-xs text-gray-500 dark:text-gray-400">{t('appNameArabic')}</p>
                    </div>
                    <button onClick={onClose} className="md:hidden absolute top-0 end-0 mt-1 me-1 p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"><X size={20} /></button>
                </div>
                <div className="mb-4 relative">
                    <button onClick={() => setProjectDropdownOpen(!isProjectDropdownOpen)} className="w-full flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-left">
                        <span className="font-semibold truncate text-dark dark:text-light">{selectedProject?.name || t('selectProject')}</span><ChevronsUpDown size={18} className="text-gray-500" />
                    </button>
                    {isProjectDropdownOpen && (
                        <div className="absolute mt-2 w-full bg-white dark:bg-dark-secondary rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                            <ul>
                                {projects.map(project => (
                                    <li key={project.id} onClick={() => handleSelectProject(project.id)} className="group px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer text-sm flex justify-between items-center">
                                        <span className="truncate">{project.name}</span>
                                        <button onClick={(e) => handleDeleteClick(e, project.id)} className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity p-1" title={t('deleteProject')}><Trash2 size={16} /></button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <button onClick={onNewProject} className="flex items-center justify-center w-full bg-primary text-white p-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors mb-4"><PlusCircle size={20} className="me-2" />{t('newProject')}</button>
                <nav className="flex-grow"><ul>{navItems.map((item) => (<NavItem key={item.label} icon={item.icon} label={t(item.label.toLowerCase() as any)} isActive={activePage === item.label} onClick={() => setActivePage(item.label)} />))}</ul></nav>
                <div className="mt-auto"><div className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg text-center"><p className="text-sm text-gray-600 dark:text-gray-300">{t('upgradeToPro')}</p><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('getMoreFeatures')}</p><button className="mt-4 w-full bg-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors">{t('upgradeNow')}</button></div></div>
            </aside>
        </>
    );
};

const Header: React.FC<{ title: Page; user: User; onMenuClick: () => void; }> = ({ title, user, onMenuClick }) => {
    const { language, setLanguage, t } = useLocalization();
    const toggleLanguage = () => setLanguage(language === 'en' ? 'ar' : 'en');
    const handleSignOut = async () => { try { await signOut(auth); } catch (error) { console.error("Error signing out: ", error); } };
    return (
        <header className="flex-shrink-0 flex items-center justify-between p-4 bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
                <button onClick={onMenuClick} className="md:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors me-2" aria-label="Open menu"><Menu size={24} /></button>
                <h2 className="text-xl sm:text-2xl font-bold text-dark dark:text-light">{t(title.toLowerCase() as any)}</h2>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="relative hidden sm:block"><Search className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder={t('search')} className="ps-10 pe-4 py-2 w-40 lg:w-64 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" /></div>
                <button onClick={toggleLanguage} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center" aria-label="Toggle language"><Languages size={20} /><span className="hidden sm:inline font-semibold text-sm ms-2">{language === 'en' ? 'AR' : 'EN'}</span></button>
                <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><Bell size={20} /></button>
                <div className="flex items-center"><img src={`https://i.pravatar.cc/150?u=${user.uid}`} alt="User Avatar" className="w-10 h-10 rounded-full object-cover" /><div className="ms-3 hidden md:block"><p className="font-semibold text-sm truncate max-w-[120px]" title={user.email || user.uid}>{user.email || 'User'}</p><p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">ID: {user.uid}</p></div></div>
                <button onClick={handleSignOut} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Sign Out"><LogOut size={20} /></button>
            </div>
        </header>
    );
};

// --- PAGE COMPONENTS ---

const Dashboard: React.FC<{ project: Project; onEditProject: () => void; }> = ({ project, onEditProject }) => {
    const { t } = useLocalization();
    const { goal, duration, budget, tasks, team } = project;
    const completedTasks = tasks.filter(t => t.status === TaskStatus.Completed).length;
    const totalTasks = tasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const projectLength = (duration.start && duration.end) ? getDaysDifference(duration.start, duration.end) : 0;
    const daysLeft = (duration.end) ? getDaysDifference(new Date().toISOString().split('T')[0], duration.end) : 0;
    const statusCounts = tasks.reduce((acc, task) => { acc[task.status] = (acc[task.status] || 0) + 1; return acc; }, {} as Record<TaskStatus, number>);
    const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    const COLORS = { [TaskStatus.Completed]: '#10b981', [TaskStatus.InProgress]: '#3b82f6', [TaskStatus.Postponed]: '#f97316', [TaskStatus.NotStarted]: '#6b7280' };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title={t('budget')} value={formatCurrency(budget)} icon={<DollarSign />} color="bg-green-500" />
                <Card title={t('projectLength')} value={`${projectLength} ${t('days')}`} icon={<Calendar />} color="bg-blue-500" />
                <Card title={t('teamSize')} value={team.length} icon={<Users />} color="bg-indigo-500" />
                <Card title={t('completedTasks')} value={`${completedTasks}/${totalTasks}`} icon={<CheckCircle />} color="bg-emerald-500" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-dark-secondary p-6 rounded-xl shadow-md">
                    <div className="flex justify-between items-center mb-1"><h3 className="text-lg font-semibold text-dark dark:text-light">{t('projectGoal')}</h3><button onClick={onEditProject} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title={t('editProject')}><Pencil size={18} /></button></div>
                    <p className="text-gray-600 dark:text-gray-400">{goal}</p>
                    <div className="mt-4"><div className="flex justify-between mb-1"><span className="text-base font-medium text-primary dark:text-white">{t('projectProgress')}</span><span className="text-sm font-medium text-primary dark:text-white">{progress}%</span></div><div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700"><div className="bg-primary h-4 rounded-full" style={{ width: `${progress}%` }}></div></div><div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400"><span>{t('start')}: {new Date(duration.start).toLocaleDateString()}</span><span>{daysLeft > 0 ? `${daysLeft} ${t('daysLeft')}` : t('overdue')}</span><span>{t('end')}: {new Date(duration.end).toLocaleDateString()}</span></div></div>
                </div>
                <div className="bg-white dark:bg-dark-secondary p-6 rounded-xl shadow-md">
                    <h3 className="text-lg font-semibold mb-2 text-dark dark:text-light">{t('taskStatus')}</h3>
                    <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value" nameKey="name">{pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[entry.name as TaskStatus]} />))}</Pie><Tooltip /><Legend iconSize={10} /></PieChart></ResponsiveContainer>
                </div>
            </div>
            <div className="bg-white dark:bg-dark-secondary p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold mb-4 text-dark dark:text-light">{t('recentTasks')}</h3>
                {tasks.length > 0 ? (<ul className="space-y-3">{tasks.slice(0, 5).map(task => (<li key={task.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"><div className="flex items-center"><ListTodo className="text-primary me-3" /><div><p className="font-medium text-dark dark:text-light">{task.name}</p><p className="text-xs text-gray-500">{team.find(m => m.id === task.assignedTo)?.name || t('unassigned')}</p></div></div><span className={`px-2 py-1 text-xs font-semibold rounded-full ${task.status === TaskStatus.Completed ? 'bg-green-100 text-green-800' : task.status === TaskStatus.InProgress ? 'bg-blue-100 text-blue-800' : task.status === TaskStatus.Postponed ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>{task.status}</span></li>))}</ul>) : (<p className="text-gray-500 dark:text-gray-400">{t('noTasksAdded')}</p>)}
            </div>
        </div>
    );
};

const Team: React.FC<{ project: Project; onUpdate: (action: 'add' | 'update' | 'delete', member: Partial<TeamMember>, memberId?: string) => void; showAlert: (message: string, type?: 'success' | 'error') => void; requestConfirmation: (message: string, onConfirm: () => void) => void; }> = ({ project, onUpdate, showAlert, requestConfirmation }) => {
    const { t } = useLocalization();
    const { team, tasks } = project;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const getTaskCountForMember = (memberId: string) => tasks.filter(task => task.assignedTo === memberId).length;
    const handleOpenModal = (member: TeamMember | null = null) => { setEditingMember(member); setIsModalOpen(true); };
    const handleCloseModal = () => { setEditingMember(null); setIsModalOpen(false); };
    const handleSubmitMember = (memberData: Omit<TeamMember, 'id'> & { id?: string }) => { onUpdate(memberData.id ? 'update' : 'add', memberData); handleCloseModal(); };
    const handleDeleteMember = (memberId: string) => { requestConfirmation("Are you sure you want to remove this team member?", () => onUpdate('delete', {}, memberId)); };

    return (
        <>
            <div>
                <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-dark dark:text-light">{t('teamMembers')}</h2><button onClick={() => handleOpenModal()} className="flex items-center bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors"><UserPlus size={18} className="me-2" />{t('addMember')}</button></div>
                {team.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {team.map(member => (
                            <div key={member.id} className="bg-white dark:bg-dark-secondary rounded-xl shadow-md p-6 text-center transform hover:-translate-y-1 transition-transform relative group">
                                <img src={member.avatarUrl} alt={member.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-primary/50" />
                                <div className="absolute top-4 end-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => handleOpenModal(member)} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"><Pencil size={14} /></button><button onClick={() => handleDeleteMember(member.id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"><Trash2 size={14} /></button></div>
                                <h3 className="text-lg font-bold text-dark dark:text-light">{member.name}</h3><p className="text-primary font-medium">{member.role}</p>
                                <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400"><div className="flex items-center justify-center"><Mail size={14} className="me-2" /><span>{member.email}</span></div><div className="flex items-center justify-center"><Briefcase size={14} className="me-2" /><span>{getTaskCountForMember(member.id)} {t('tasksAssigned')}</span></div></div>
                            </div>
                        ))}
                    </div>
                ) : (<div className="text-center bg-white dark:bg-dark-secondary p-10 rounded-xl shadow-md"><h3 className="text-xl font-semibold">{t('noTeamMembers')}</h3><p className="text-gray-500 dark:text-gray-400 mt-2">{t('addMembersToProject')}</p></div>)}
            </div>
            {isModalOpen && (<TeamMemberModal onClose={handleCloseModal} onSubmit={handleSubmitMember} memberToEdit={editingMember} showAlert={showAlert} />)}
        </>
    );
};

const Tasks: React.FC<{ project: Project; onUpdate: (action: 'add' | 'update' | 'delete', task: Partial<Task>, taskId?: string) => void; showAlert: (message: string, type?: 'success' | 'error') => void; requestConfirmation: (message: string, onConfirm: () => void) => void; }> = ({ project, onUpdate, showAlert, requestConfirmation }) => {
    const { t } = useLocalization();
    const { tasks, team } = project;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const getMemberById = (id: string) => team.find(m => m.id === id);
    const handleOpenModal = (task: Task | null = null) => { setEditingTask(task); setIsModalOpen(true); };
    const handleCloseModal = () => { setEditingTask(null); setIsModalOpen(false); };
    const handleSubmitTask = (taskData: Omit<Task, 'id'> & { id?: string }) => { onUpdate(taskData.id ? 'update' : 'add', taskData); handleCloseModal(); };
    const handleDeleteTask = (taskId: string) => { requestConfirmation(t('deleteTaskConfirmation'), () => onUpdate('delete', {}, taskId)); };
    const TaskStatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => (<span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${ { [TaskStatus.Completed]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', [TaskStatus.InProgress]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', [TaskStatus.Postponed]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', [TaskStatus.NotStarted]: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200', }[status] }`}>{status}</span>);

    return (
        <>
            <div className="bg-white dark:bg-dark-secondary p-4 sm:p-6 rounded-xl shadow-md">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4"><h2 className="text-2xl font-bold text-dark dark:text-light">{t('taskList')}</h2><div className="flex items-center space-x-2"><button className="flex-1 sm:flex-none flex items-center justify-center bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"><Filter size={16} className="me-2" />{t('filter')}</button><button onClick={() => handleOpenModal()} className="flex-1 sm:flex-none flex items-center justify-center bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors"><PlusCircle size={18} className="me-2" />{t('addTask')}</button></div></div>
                <div className="overflow-x-auto hidden md:block"><table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"><thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"><tr><th scope="col" className="px-6 py-3">{t('taskName')}</th><th scope="col" className="px-6 py-3">{t('assignedTo')}</th><th scope="col" className="px-6 py-3">{t('status')}</th><th scope="col" className="px-6 py-3">{t('startDate')}</th><th scope="col" className="px-6 py-3">{t('endDate')}</th><th scope="col" className="px-6 py-3">{t('actions')}</th></tr></thead><tbody>
                {tasks.length > 0 ? tasks.map(task => { const member = getMemberById(task.assignedTo); return (<tr key={task.id} className="bg-white dark:bg-dark-secondary border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"><td scope="row" className="px-6 py-4"><p className="font-medium text-gray-900 dark:text-white">{task.name}</p><p className="text-xs text-gray-500 truncate max-w-xs">{task.description}</p></td><td className="px-6 py-4"><div className="flex items-center">{member && <img src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full object-cover me-3" />}<span>{member ? member.name : t('unassigned')}</span></div></td><td className="px-6 py-4"><TaskStatusBadge status={task.status} /></td><td className="px-6 py-4">{formatDate(task.startDate)}</td><td className="px-6 py-4">{formatDate(task.endDate)}</td><td className="px-6 py-4"><div className="flex items-center space-x-3 rtl:space-x-reverse"><button onClick={() => handleOpenModal(task)} className="text-blue-500 hover:text-blue-700" title={t('editTask')}><Pencil size={18}/></button><button onClick={() => handleDeleteTask(task.id)} className="text-red-500 hover:text-red-700" title={t('deleteTask')}><Trash2 size={18}/></button></div></td></tr>);}) : (<tr><td colSpan={6} className="text-center py-10 text-gray-500 dark:text-gray-400">{t('noTasksFound')}</td></tr>)}</tbody></table></div>
                <div className="block md:hidden space-y-4">{tasks.length > 0 ? tasks.map(task => { const member = getMemberById(task.assignedTo); return (<div key={task.id} className="bg-gray-50 dark:bg-dark p-4 rounded-lg border border-gray-200 dark:border-gray-700"><div className="flex justify-between items-start mb-3"><div><p className="font-bold text-gray-900 dark:text-white">{task.name}</p><p className="text-xs text-gray-500 mt-1">{task.description}</p></div><TaskStatusBadge status={task.status} /></div><div className="grid grid-cols-2 gap-4 text-sm py-3 border-y border-gray-200 dark:border-gray-700"><div><p className="text-xs text-gray-500 dark:text-gray-400">{t('assignedTo')}</p><div className="flex items-center mt-1">{member && <img src={member.avatarUrl} alt={member.name} className="w-6 h-6 rounded-full object-cover me-2" />}<span className="font-medium text-gray-800 dark:text-gray-200">{member ? member.name : t('unassigned')}</span></div></div><div><p className="text-xs text-gray-500 dark:text-gray-400">{t('endDate')}</p><p className="font-medium text-gray-800 dark:text-gray-200 mt-1">{formatDate(task.endDate)}</p></div></div><div className="flex justify-end items-center mt-3 space-x-3 rtl:space-x-reverse"><button onClick={() => handleOpenModal(task)} className="text-blue-500 hover:text-blue-700" title={t('editTask')}><Pencil size={18}/></button><button onClick={() => handleDeleteTask(task.id)} className="text-red-500 hover:text-red-700" title={t('deleteTask')}><Trash2 size={18}/></button></div></div>)}) : (<div className="text-center py-10 text-gray-500 dark:text-gray-400">{t('noTasksFound')}</div>)}</div>
            </div>
            {isModalOpen && (<TaskModal taskToEdit={editingTask} teamMembers={team} onClose={handleCloseModal} onSubmit={handleSubmitTask} showAlert={showAlert} />)}
        </>
    );
};

const Timeline: React.FC<{ project: Project; }> = ({ project }) => {
    const { t } = useLocalization();
    const { tasks, team, duration } = project;
    const [zoomLevel, setZoomLevel] = useState<'Day' | 'Week' | 'Month'>('Week');
    const [hoveredTask, setHoveredTask] = useState<{ task: Task; element: HTMLElement } | null>(null);
    const zoomConfig = { Day: { columnWidth: 60, showDayNumbers: true }, Week: { columnWidth: 30, showDayNumbers: true }, Month: { columnWidth: 15, showDayNumbers: false } };
    const { columnWidth, showDayNumbers } = zoomConfig[zoomLevel];
    const { projectStartDate, projectEndDate, totalDays, months, todayOffset } = useMemo(() => {
        if (!duration.start || !duration.end) return { projectStartDate: null, projectEndDate: null, totalDays: 0, months: [], todayOffset: -1 };
        const start = new Date(duration.start), end = new Date(duration.end), days = getDaysDifference(duration.start, duration.end) + 1, calculatedMonths: any[] = [];
        let tempDate = new Date(start);
        while (tempDate <= end) {
            const monthName = tempDate.toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!calculatedMonths.some(m => m.name === monthName)) {
                const firstDay = new Date(tempDate.getFullYear(), tempDate.getMonth(), 1), lastDay = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0);
                const startCol = Math.max(getDaysDifference(duration.start, firstDay.toISOString().split('T')[0]), 0) + 1;
                const endCol = getDaysDifference(duration.start, new Date(Math.min(end.getTime(), lastDay.getTime())).toISOString().split('T')[0]) + 2;
                calculatedMonths.push({ name: monthName, startCol, endCol });
            }
            tempDate.setMonth(tempDate.getMonth() + 1); tempDate.setDate(1);
        }
        return { projectStartDate: start, projectEndDate: end, totalDays: days, months: calculatedMonths, todayOffset: getDaysDifference(duration.start, new Date().toISOString().split('T')[0]) };
    }, [duration.start, duration.end]);

    const { positionedTasks, laneCount } = useMemo(() => {
        if (!projectStartDate || !totalDays) return { positionedTasks: [], laneCount: 0 };
        const sortedTasks = [...tasks].sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        const lanes: Date[] = [], taskPositions: any[] = [];
        sortedTasks.forEach(task => {
            const taskStart = new Date(task.startDate), taskEnd = new Date(task.endDate);
            const clampedStart = new Date(Math.max(taskStart.getTime(), projectStartDate.getTime())), clampedEnd = new Date(Math.min(taskEnd.getTime(), projectEndDate!.getTime()));
            if (clampedEnd < clampedStart) { taskPositions.push({ ...task, lane: -1, style: { display: 'none' } }); return; }
            const startOffset = getDaysDifference(projectStartDate.toISOString().split('T')[0], clampedStart.toISOString().split('T')[0]);
            const taskDurationDays = getDaysDifference(clampedStart.toISOString().split('T')[0], clampedEnd.toISOString().split('T')[0]) + 1;
            let assignedLane = lanes.findIndex(laneEndDate => taskStart > laneEndDate);
            if (assignedLane === -1) { assignedLane = lanes.length; lanes.push(taskEnd); } else { lanes[assignedLane] = taskEnd; }
            taskPositions.push({ ...task, lane: assignedLane, style: { top: `${assignedLane * 48}px`, left: `${(startOffset / totalDays) * 100}%`, width: `${(taskDurationDays / totalDays) * 100}%` } });
        });
        return { positionedTasks, laneCount: lanes.length };
    }, [tasks, projectStartDate, totalDays]);

    const roleColors: Record<UserRole, string> = { [UserRole.ProjectManager]: 'bg-red-500', [UserRole.Developer]: 'bg-blue-500', [UserRole.Designer]: 'bg-purple-500', [UserRole.Marketing]: 'bg-amber-500', [UserRole.Production]: 'bg-teal-500' };
    const getRoleColor = (memberId: string, team: TeamMember[]) => { const member = team.find(m => m.id === memberId); return member ? roleColors[member.role] : 'bg-gray-500'; };
    if (!projectStartDate) return (<div className="bg-white dark:bg-dark-secondary p-6 rounded-xl shadow-md"><h2 className="text-2xl font-bold text-dark dark:text-light mb-6">{t('projectTimeline')}</h2><p className="text-gray-500">{t('noProjectDuration')}</p></div>);
    if (tasks.length === 0) return (<div className="bg-white dark:bg-dark-secondary p-6 rounded-xl shadow-md"><h2 className="text-2xl font-bold text-dark dark:text-light mb-6">{t('projectTimeline')}</h2><p className="text-gray-500">{t('noTasksForTimeline')}</p></div>);
    const assignee = hoveredTask ? team.find(m => m.id === hoveredTask.task.assignedTo) : null;
    const TaskStatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => (<span className={`px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${{ [TaskStatus.Completed]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', [TaskStatus.InProgress]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', [TaskStatus.Postponed]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', [TaskStatus.NotStarted]: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200' }[status]}`}>{status}</span>);

    return (
        <div className="bg-white dark:bg-dark-secondary p-6 rounded-xl shadow-md">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4"><h2 className="text-2xl font-bold text-dark dark:text-light">{t('projectTimeline')}</h2><div className="flex items-center space-x-2 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">{(['Day', 'Week', 'Month'] as ('Day' | 'Week' | 'Month')[]).map(level => (<button key={level} onClick={() => setZoomLevel(level)} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${ zoomLevel === level ? 'bg-primary text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' }`}>{t(level.toLowerCase() as any)}</button>))}</div></div>
            <div className="overflow-x-auto"><div className="relative" style={{ minWidth: `${totalDays * columnWidth}px` }}>
                <div className="grid" style={{ gridTemplateColumns: `repeat(${totalDays}, 1fr)` }}>{months.map(month => (<div key={month.name} className="text-center font-semibold text-sm py-2 border-b-2 border-primary dark:border-primary-dark" style={{ gridColumn: `${month.startCol} / ${month.endCol}` }}>{month.name}</div>))}</div>
                {showDayNumbers && (<div className="grid border-s border-gray-200 dark:border-gray-700 mt-2" style={{ gridTemplateColumns: `repeat(${totalDays}, minmax(${columnWidth}px, 1fr))` }}>{Array.from({ length: totalDays }).map((_, i) => (<div key={i} className="h-6 border-e border-gray-200 dark:border-gray-700 text-center text-xs text-gray-400 flex items-center justify-center">{new Date(new Date(projectStartDate).setDate(projectStartDate.getDate() + i)).getDate()}</div>))}</div>)}
                <div className="mt-4 relative" style={{ height: `${laneCount * 48}px` }}>
                    {todayOffset >= 0 && todayOffset < totalDays && (<div className="absolute top-0 bottom-0 z-0" style={{ left: `${(todayOffset / totalDays) * 100}%` }}><div className="w-0.5 h-full bg-red-500 opacity-70"></div><div className="absolute -top-5 -translate-x-1/2 px-1.5 py-0.5 text-xs text-white bg-red-500 rounded-full">Today</div></div>)}
                    {positionedTasks.map(task => (<div key={task.id} className={`absolute h-10 flex items-center rounded-lg text-white text-xs font-semibold px-2 shadow-sm transition-all duration-300 cursor-pointer z-10 ${getRoleColor(task.assignedTo, team)}`} style={task.style} onMouseEnter={(e) => setHoveredTask({ task, element: e.currentTarget })} onMouseLeave={() => setHoveredTask(null)}><span className="truncate">{task.name}</span></div>))}
                    {hoveredTask && (<div className="absolute z-20 w-64 bg-white dark:bg-dark-secondary p-4 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 pointer-events-none transition-opacity duration-200" style={{ top: `${hoveredTask.element.offsetTop - 12}px`, left: `${hoveredTask.element.offsetLeft + hoveredTask.element.offsetWidth / 2}px`, transform: 'translate(-50%, -100%)' }}><h4 className="font-bold text-dark dark:text-light mb-2">{hoveredTask.task.name}</h4><div className="flex items-center mb-2">{assignee ? (<><img src={assignee.avatarUrl} alt={assignee.name} className="w-6 h-6 rounded-full me-2" /><span className="text-sm text-gray-600 dark:text-gray-300">{assignee.name}</span></>) : (<span className="text-sm text-gray-500 dark:text-gray-400">{t('unassigned')}</span>)}</div><div className="mb-2"><TaskStatusBadge status={hoveredTask.task.status} /></div><p className="text-xs text-gray-500 dark:text-gray-400 max-h-20 overflow-y-auto">{hoveredTask.task.description}</p><div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white dark:border-t-dark-secondary"></div></div>)}
                </div>
            </div></div>
        </div>
    );
};

const Budget: React.FC<{ project: Project; onUpdate: (action: 'add' | 'update' | 'delete', item: Partial<BudgetItem>, itemId?: string) => void; showAlert: (message: string, type?: 'success' | 'error') => void; requestConfirmation: (message: string, onConfirm: () => void) => void; }> = ({ project, onUpdate, showAlert, requestConfirmation }) => {
    const { t } = useLocalization();
    const { budgetItems, budget: totalBudget } = project;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
    const totalSpent = useMemo(() => budgetItems.reduce((sum, item) => sum + item.actualCost, 0), [budgetItems]);
    const remainingBudget = totalBudget - totalSpent;
    const handleOpenModal = (item: BudgetItem | null = null) => { setEditingItem(item); setIsModalOpen(true); };
    const handleCloseModal = () => { setEditingItem(null); setIsModalOpen(false); };
    const handleSubmit = (itemData: Omit<BudgetItem, 'id'> & { id?: string }) => { onUpdate(itemData.id ? 'update' : 'add', itemData); handleCloseModal(); };
    const handleDelete = (itemId: string) => { requestConfirmation(t('deleteBudgetItemConfirmation'), () => onUpdate('delete', {}, itemId)); };
    const VarianceIndicator: React.FC<{ variance: number }> = ({ variance }) => { if (variance > 0) return <TrendingDown className="text-green-500" />; if (variance < 0) return <TrendingUp className="text-red-500" />; return <Minus className="text-gray-500" />; };

    return (
        <>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><Card title={t('totalBudget')} value={formatCurrency(totalBudget)} icon={<div className="font-bold text-lg">EGP</div>} color="bg-blue-500" /><Card title={t('totalSpent')} value={formatCurrency(totalSpent)} icon={<div className="font-bold text-lg">EGP</div>} color="bg-orange-500" /><Card title={t('remaining')} value={formatCurrency(remainingBudget)} icon={<div className="font-bold text-lg">EGP</div>} color={remainingBudget >= 0 ? 'bg-green-500' : 'bg-red-500'} /></div>
                <div className="bg-white dark:bg-dark-secondary p-4 sm:p-6 rounded-xl shadow-md">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4"><h2 className="text-2xl font-bold text-dark dark:text-light">{t('budgetManagement')}</h2><button onClick={() => handleOpenModal()} className="flex items-center justify-center bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors"><PlusCircle size={18} className="me-2" />{t('addBudgetItem')}</button></div>
                    <div className="overflow-x-auto hidden md:block"><table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"><thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"><tr><th scope="col" className="px-6 py-3">{t('budgetItemName')}</th><th scope="col" className="px-6 py-3">{t('expectedCost')}</th><th scope="col" className="px-6 py-3">{t('actualCost')}</th><th scope="col" className="px-6 py-3">{t('variance')}</th><th scope="col" className="px-6 py-3">{t('actions')}</th></tr></thead><tbody>
                    {budgetItems.length > 0 ? budgetItems.map(item => { const variance = item.expectedCost - item.actualCost; return (<tr key={item.id} className="bg-white dark:bg-dark-secondary border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"><td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.name}</td><td className="px-6 py-4">{formatCurrency(item.expectedCost)}</td><td className="px-6 py-4">{formatCurrency(item.actualCost)}</td><td className={`px-6 py-4 font-semibold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}><div className="flex items-center space-x-2 rtl:space-x-reverse"><VarianceIndicator variance={variance} /><span>{formatCurrency(variance)}</span></div></td><td className="px-6 py-4"><div className="flex items-center space-x-3 rtl:space-x-reverse"><button onClick={() => handleOpenModal(item)} className="text-blue-500 hover:text-blue-700" title={t('editItem')}><Pencil size={18}/></button><button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700" title={t('deleteItem')}><Trash2 size={18}/></button></div></td></tr>);}) : (<tr><td colSpan={5} className="text-center py-10 text-gray-500 dark:text-gray-400">{t('noBudgetItems')}</td></tr>)}</tbody></table></div>
                    <div className="block md:hidden space-y-4">{budgetItems.length > 0 ? budgetItems.map(item => { const variance = item.expectedCost - item.actualCost; return (<div key={item.id} className="bg-gray-50 dark:bg-dark p-4 rounded-lg border border-gray-200 dark:border-gray-700"><div className="flex justify-between items-start mb-3"><p className="font-bold text-gray-900 dark:text-white">{item.name}</p><div className={`flex items-center space-x-2 rtl:space-x-reverse font-semibold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}><VarianceIndicator variance={variance} /><span>{formatCurrency(variance)}</span></div></div><div className="grid grid-cols-2 gap-4 text-sm py-3 border-y border-gray-200 dark:border-gray-700"><div><p className="text-xs text-gray-500 dark:text-gray-400">{t('expectedCost')}</p><p className="font-medium text-gray-800 dark:text-gray-200 mt-1">{formatCurrency(item.expectedCost)}</p></div><div><p className="text-xs text-gray-500 dark:text-gray-400">{t('actualCost')}</p><p className="font-medium text-gray-800 dark:text-gray-200 mt-1">{formatCurrency(item.actualCost)}</p></div></div><div className="flex justify-end items-center mt-3 space-x-3 rtl:space-x-reverse"><button onClick={() => handleOpenModal(item)} className="text-blue-500 hover:text-blue-700" title={t('editItem')}><Pencil size={18}/></button><button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700" title={t('deleteItem')}><Trash2 size={18}/></button></div></div>);}) : (<div className="text-center py-10 text-gray-500 dark:text-gray-400">{t('noBudgetItems')}</div>)}</div>
                </div>
            </div>
            {isModalOpen && (<BudgetModal itemToEdit={editingItem} onClose={handleCloseModal} onSubmit={handleSubmit} showAlert={showAlert} />)}
        </>
    );
};

const Risks: React.FC<{ project: Project; onUpdate: (action: 'add' | 'update' | 'delete', risk: Partial<Risk>, riskId?: string) => void; showAlert: (message: string, type?: 'success' | 'error') => void; requestConfirmation: (message: string, onConfirm: () => void) => void; }> = ({ project, onUpdate, showAlert, requestConfirmation }) => {
    const { t } = useLocalization();
    const { risks } = project;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
    const handleOpenModal = (risk: Risk | null = null) => { setEditingRisk(risk); setIsModalOpen(true); };
    const handleCloseModal = () => { setEditingRisk(null); setIsModalOpen(false); };
    const handleSubmit = (riskData: Omit<Risk, 'id'> & { id?: string }) => { onUpdate(riskData.id ? 'update' : 'add', riskData); handleCloseModal(); };
    const handleDelete = (riskId: string) => { requestConfirmation(t('deleteRiskConfirmation'), () => onUpdate('delete', {}, riskId)); };
    const SeverityBadge: React.FC<{ severity: RiskSeverity }> = ({ severity }) => (<span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${{ [RiskSeverity.Low]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', [RiskSeverity.Medium]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', [RiskSeverity.High]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }[severity]}`}>{severity}</span>);

    return (
        <>
            <div className="bg-white dark:bg-dark-secondary p-4 sm:p-6 rounded-xl shadow-md">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4"><h2 className="text-2xl font-bold text-dark dark:text-light">{t('riskManagement')}</h2><button onClick={() => handleOpenModal()} className="flex items-center justify-center bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors"><PlusCircle size={18} className="me-2" />{t('addRisk')}</button></div>
                <div className="overflow-x-auto hidden md:block"><table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"><thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"><tr><th scope="col" className="px-6 py-3 w-2/5">{t('riskDescription')}</th><th scope="col" className="px-6 py-3">{t('severity')}</th><th scope="col" className="px-6 py-3 w-2/5">{t('mitigationSolution')}</th><th scope="col" className="px-6 py-3">{t('actions')}</th></tr></thead><tbody>
                {risks.length > 0 ? risks.map(risk => (<tr key={risk.id} className="bg-white dark:bg-dark-secondary border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"><td className="px-6 py-4">{risk.description}</td><td className="px-6 py-4"><SeverityBadge severity={risk.severity} /></td><td className="px-6 py-4">{risk.solution}</td><td className="px-6 py-4"><div className="flex items-center space-x-3 rtl:space-x-reverse"><button onClick={() => handleOpenModal(risk)} className="text-blue-500 hover:text-blue-700" title={t('editRisk')}><Pencil size={18}/></button><button onClick={() => handleDelete(risk.id)} className="text-red-500 hover:text-red-700" title={t('deleteTask')}><Trash2 size={18}/></button></div></td></tr>)) : (<tr><td colSpan={4} className="text-center py-10 text-gray-500 dark:text-gray-400">{t('noRisks')}</td></tr>)}</tbody></table></div>
                <div className="block md:hidden space-y-4">{risks.length > 0 ? risks.map(risk => (<div key={risk.id} className="bg-gray-50 dark:bg-dark p-4 rounded-lg border border-gray-200 dark:border-gray-700"><div className="flex justify-between items-start mb-3"><p className="font-medium text-gray-900 dark:text-white pr-4">{risk.description}</p><SeverityBadge severity={risk.severity} /></div><div className="text-sm py-3 border-y border-gray-200 dark:border-gray-700"><p className="text-xs text-gray-500 dark:text-gray-400">{t('mitigationSolution')}</p><p className="mt-1 text-gray-800 dark:text-gray-200">{risk.solution}</p></div><div className="flex justify-end items-center mt-3 space-x-3 rtl:space-x-reverse"><button onClick={() => handleOpenModal(risk)} className="text-blue-500 hover:text-blue-700" title={t('editRisk')}><Pencil size={18}/></button><button onClick={() => handleDelete(risk.id)} className="text-red-500 hover:text-red-700" title={t('deleteTask')}><Trash2 size={18}/></button></div></div>)) : (<div className="text-center py-10 text-gray-500 dark:text-gray-400">{t('noRisks')}</div>)}</div>
            </div>
            {isModalOpen && (<RiskModal riskToEdit={editingRisk} onClose={handleCloseModal} onSubmit={handleSubmit} showAlert={showAlert} />)}
        </>
    );
};

// --- LOGIN PAGE COMPONENT ---
const LoginPage = () => {
    const { t } = useLocalization();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true); setError(''); setSuccess('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setSuccess('Sign in successful! Redirecting...');
        } catch (err: any) {
            setError('Failed to sign in. Please check your credentials.');
        } finally { setLoading(false); }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-light dark:bg-dark font-sans">
            <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg dark:bg-dark-secondary">
                <div className="flex flex-col items-center text-center"><div className="bg-primary rounded-lg p-3 mb-4"><Rocket size={32} className="text-white" /></div><h1 className="text-2xl font-bold text-dark dark:text-light leading-tight">{t('appNameEnglish')}</h1><p className="text-sm text-gray-500 dark:text-gray-400">{t('appNameArabic')}</p></div>
                <form className="mt-6 space-y-4" onSubmit={handleSignIn}>
                    <div><label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label><input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary sm:text-sm" placeholder="you@example.com" /></div>
                    <div><label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label><input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary sm:text-sm" placeholder="••••••••" /></div>
                    {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800">{error}</div>}
                    {success && <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800">{success}</div>}
                    <div><button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50">{loading ? 'Signing In...' : 'Sign In'}</button></div>
                </form>
            </div>
        </div>
    );
};

// --- MAIN APP CONTENT ---
const AppContent: React.FC<{ user: User }> = ({ user }) => {
  const { t, dir } = useLocalization();
  const [activePage, setActivePage] = useState<Page>('Dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmation, setConfirmation] = useState<{ message: string; onConfirm: () => void; } | null>(null);

  const showAlert = (message: string, type: 'success' | 'error' = 'error') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const requestConfirmation = (message: string, onConfirm: () => void) => {
    setConfirmation({ message, onConfirm });
  };
  
  const handleConfirm = () => {
    if (confirmation) {
      confirmation.onConfirm();
      setConfirmation(null);
    }
  };

  const handleCancel = () => {
    setConfirmation(null);
  };

  // Fetch projects
  useEffect(() => {
    const unsubscribe = onSnapshot(projectsCollectionRef(), (snapshot) => {
        const fetchedProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), team: [], tasks: [], budgetItems: [], risks: [] } as Project));
        setProjects(fetchedProjects);
        if (!selectedProjectId && fetchedProjects.length > 0) { setSelectedProjectId(fetchedProjects[0].id); } 
        else if (selectedProjectId && !fetchedProjects.some(p => p.id === selectedProjectId)) { setSelectedProjectId(fetchedProjects.length > 0 ? fetchedProjects[0].id : null); }
    });
    return () => unsubscribe();
  }, []);

  // Fetch sub-collections for selected project
  useEffect(() => {
    if (!selectedProjectId) { setProjects(projs => projs.map(p => ({ ...p, team:[], tasks: [], budgetItems: [], risks: [] }))); return; };
    const listeners = ['team', 'tasks', 'budgetItems', 'risks'].map(sub => {
        return onSnapshot(subCollectionRef(selectedProjectId, sub), (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProjects(currentProjects => currentProjects.map(p => p.id === selectedProjectId ? { ...p, [sub]: items } : p));
        });
    });
    return () => listeners.forEach(unsub => unsub());
  }, [selectedProjectId]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const handleOpenProjectModal = (project: Project | null = null) => { setEditingProject(project); setIsProjectModalOpen(true); };
  const handleCloseProjectModal = () => { setEditingProject(null); setIsProjectModalOpen(false); };

  const handleSubmitProject = async (projectData: { id?: string; name: string; goal: string; startDate: string; endDate: string; budget: number }) => {
      const { id, ...data } = projectData;
      const projectPayload = { name: data.name, goal: data.goal, duration: { start: data.startDate, end: data.endDate }, budget: data.budget };
      try {
        if (id) {
          await updateDoc(projectDocRef(id), projectPayload);
          showAlert('Project updated successfully!', 'success');
        } else {
          const docRef = await addDoc(projectsCollectionRef(), projectPayload);
          setSelectedProjectId(docRef.id);
          showAlert('Project created successfully!', 'success');
        }
      } catch (error) { console.error("Error saving project: ", error); showAlert("Failed to save project."); }
      handleCloseProjectModal();
  };
  
  const handleDeleteProject = (projectId: string) => {
    requestConfirmation(t('deleteProjectConfirmation'), async () => {
      try {
          const subCollections = ['tasks', 'team', 'budgetItems', 'risks'];
          for (const sub of subCollections) {
              const snapshot = await getDocs(subCollectionRef(projectId, sub));
              const batch = writeBatch(db);
              snapshot.docs.forEach(doc => batch.delete(doc.ref));
              await batch.commit();
          }
          await deleteDoc(projectDocRef(projectId));
          showAlert('Project deleted successfully.', 'success');
      } catch (error) { console.error("Error deleting project: ", error); showAlert("Failed to delete project."); }
    });
  };
  
  const handleSubCollectionUpdate = async <T extends {id?: string}>(action: 'add' | 'update' | 'delete', collectionName: string, itemData: T, itemId?: string) => {
      if (!selectedProjectId) return;
      const collection = subCollectionRef(selectedProjectId, collectionName);
      try {
          if (action === 'add') { const { id, ...data } = itemData; await addDoc(collection, data); } 
          else if (action === 'update' && itemData.id) { const { id, ...data } = itemData; await updateDoc(doc(collection, id), data); } 
          else if (action === 'delete' && itemId) { await deleteDoc(doc(collection, itemId)); }
          showAlert(`Item ${action}ed successfully.`, 'success');
      } catch (error) { console.error(`Error ${action}ing item in ${collectionName}: `, error); showAlert(`Failed to ${action} item.`); }
  };

  const renderPage = () => {
    if (!selectedProject) {
      return (<div className="text-center p-10"><h2 className="text-2xl font-semibold">{ projects.length > 0 ? t('noProjectSelected') : "No projects found." }</h2><p className="text-gray-500 mt-2">{ projects.length > 0 ? t('selectOrCreateProject') : "Create a new project to get started." }</p></div>);
    }
    const pageProps = { project: selectedProject, showAlert, requestConfirmation };
    switch (activePage) {
      case 'Dashboard': return <Dashboard project={selectedProject} onEditProject={() => handleOpenProjectModal(selectedProject)} />;
      case 'Team': return <Team {...pageProps} onUpdate={(action, member, id) => handleSubCollectionUpdate(action, 'team', member, id)} />;
      case 'Tasks': return <Tasks {...pageProps} onUpdate={(action, task, id) => handleSubCollectionUpdate(action, 'tasks', task, id)} />;
      case 'Timeline': return <Timeline project={selectedProject} />;
      case 'Budget': return <Budget {...pageProps} onUpdate={(action, item, id) => handleSubCollectionUpdate(action, 'budgetItems', item, id)} />;
      case 'Risks': return <Risks {...pageProps} onUpdate={(action, risk, id) => handleSubCollectionUpdate(action, 'risks', risk, id)} />;
      default: return <Dashboard project={selectedProject} onEditProject={() => handleOpenProjectModal(selectedProject)} />;
    }
  };

  return (
    <div className="relative flex h-screen bg-light dark:bg-dark text-gray-800 dark:text-gray-200 font-sans" dir={dir}>
      {alert && <Alert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
      <ConfirmationModal isOpen={!!confirmation} message={confirmation?.message || ''} onConfirm={handleConfirm} onCancel={handleCancel} />
      <Sidebar activePage={activePage} setActivePage={(page) => { setActivePage(page); setIsSidebarOpen(false); }} projects={projects} selectedProjectId={selectedProjectId} onSelectProject={(id) => { setSelectedProjectId(id); setIsSidebarOpen(false); }} onNewProject={() => { handleOpenProjectModal(null); setIsSidebarOpen(false); }} onDeleteProject={handleDeleteProject} isSidebarOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={activePage} user={user} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-light dark:bg-dark p-4 sm:p-6">{renderPage()}</main>
      </div>
      {isProjectModalOpen && (<NewProjectModal onClose={handleCloseProjectModal} onSubmit={handleSubmitProject} projectToEdit={editingProject} showAlert={showAlert} />)}
    </div>
  );
};

// --- ROOT APP COMPONENT ---
const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-light dark:bg-dark text-dark dark:text-light">Loading...</div>;
    }

    return (
        <LocalizationProvider>
            {user ? <AppContent user={user} /> : <LoginPage />}
        </LocalizationProvider>
    );
};

export default App;