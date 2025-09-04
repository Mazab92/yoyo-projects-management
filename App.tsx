import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, User, signInWithCustomToken, signInAnonymously } from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    onSnapshot, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc,
    writeBatch,
    query,
    getDocs,
    setDoc
} from 'firebase/firestore';

// All types defined in one file for the single-file React app structure
type Project = {
    id: string;
    name: string;
    description: string;
    status: 'In Progress' | 'On Hold' | 'Completed';
    startDate: string;
    endDate: string;
};

type Task = {
    id: string;
    name: string;
    description: string;
    assignee: string;
    status: 'To Do' | 'In Progress' | 'Done';
    dueDate: string;
};

type TeamMember = {
    id: string;
    name: string;
    role: string;
    email: string;
};

type BudgetItem = {
    id: string;
    name: string;
    category: string;
    amount: number;
    notes?: string;
};

type Risk = {
    id: string;
    name: string;
    description: string;
    severity: 'Low' | 'Medium' | 'High';
    mitigationPlan: string;
};

// All components and context providers are now in this single file.

// Tailwind CSS is assumed to be available
const tailwindScript = `<script src="https://cdn.tailwindcss.com"></script>`;

const LocalizationContext = createContext({
    t: (key: string) => key,
    changeLanguage: (lang: string) => {},
    language: 'en'
});

const useLocalization = () => useContext(LocalizationContext);

const LocalizationProvider = ({ children }: { children: React.ReactNode }) => {
    // Placeholder implementation
    const t = (key: string) => key;
    const changeLanguage = (lang: string) => {};
    const language = 'en';

    return (
        <LocalizationContext.Provider value={{ t, changeLanguage, language }}>
            {children}
        </LocalizationContext.Provider>
    );
};

const Sidebar = ({ projects, selectedProjectId, onSelectProject, onNewProject, onEditProject, onDeleteProject }: any) => {
    const { t } = useLocalization();

    return (
        <aside className="w-64 bg-gray-800 text-white flex flex-col p-4 shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">Projects</h1>
                <button onClick={onNewProject} className="p-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
            <nav className="flex-1 overflow-y-auto">
                <ul>
                    {projects.map((project: Project) => (
                        <li key={project.id} className="mb-2 group">
                            <button
                                onClick={() => onSelectProject(project.id)}
                                className={`w-full text-left p-3 rounded-md transition-colors duration-200 flex items-center justify-between ${
                                    selectedProjectId === project.id ? 'bg-blue-600 font-semibold' : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                            >
                                <span className="truncate">{project.name}</span>
                                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); onEditProject(project); }} className="text-white p-1 rounded-full hover:bg-gray-500 ml-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                            <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }} className="text-red-400 p-1 rounded-full hover:bg-gray-500 ml-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="mt-auto pt-4 border-t border-gray-700">
                <p className="text-sm text-gray-400">User ID: {projects.length > 0 ? projects[0].id : 'N/A'}</p>
            </div>
        </aside>
    );
};

const Header = ({ user, onSignOut }: any) => {
    const { t } = useLocalization();
    const navItems = [
        { name: t('Dashboard'), path: '/dashboard' },
        { name: t('Team'), path: '/team' },
        { name: t('Tasks'), path: '/tasks' },
        { name: t('Timeline'), path: '/timeline' },
        { name: t('Budget'), path: '/budget' },
        { name: t('Risks'), path: '/risks' },
    ];

    return (
        <header className="bg-white shadow-md p-4 flex justify-between items-center z-10">
            <nav className="flex space-x-4">
                {navItems.map(item => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                    >
                        {item.name}
                    </Link>
                ))}
            </nav>
            <div className="flex items-center space-x-4">
                <span className="text-gray-700 text-sm">{user?.email || 'Guest'}</span>
                <button onClick={onSignOut} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
                    Sign Out
                </button>
            </div>
        </header>
    );
};

const Dashboard = ({ project, tasks, team, budget }: any) => {
    const { t } = useLocalization();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'In Progress': return 'bg-yellow-400';
            case 'On Hold': return 'bg-red-400';
            case 'Completed': return 'bg-green-400';
            default: return 'bg-gray-400';
        }
    };

    const taskStatusCounts = tasks.reduce((acc: any, task: Task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="p-6 bg-gray-50 rounded-lg shadow-inner min-h-full">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{project.name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold mb-2">Project Overview</h2>
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 text-sm text-white rounded-full ${getStatusColor(project.status)}`}>
                            {project.status}
                        </span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold mb-2">Task Summary</h2>
                    <ul className="space-y-2">
                        {Object.entries(taskStatusCounts).map(([status, count]) => (
                            <li key={status} className="flex justify-between items-center text-gray-700">
                                <span>{status}</span>
                                <span className="font-bold">{count}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-semibold mb-2">Team Members</h2>
                    <p className="text-gray-700">Total Members: <span className="font-bold">{team.length}</span></p>
                </div>
            </div>
        </div>
    );
};

const Team = ({ team, onUpdate }: any) => {
    const { t } = useLocalization();
    const [isModalOpen, setModalOpen] = useState(false);
    const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const newMember = {
            name: formData.get('name') as string,
            role: formData.get('role') as string,
            email: formData.get('email') as string,
        };
        if (memberToEdit) {
            onUpdate('team', 'update', { ...newMember, id: memberToEdit.id });
        } else {
            onUpdate('team', 'add', newMember);
        }
        setModalOpen(false);
        setMemberToEdit(null);
    };

    return (
        <div className="p-6 bg-gray-50 rounded-lg shadow-inner min-h-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Team Members</h1>
                <button onClick={() => { setMemberToEdit(null); setModalOpen(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Add Member
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-xl shadow-md">
                    <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Name</th>
                            <th className="py-3 px-6 text-left">Role</th>
                            <th className="py-3 px-6 text-left">Email</th>
                            <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                        {team.map((member: TeamMember) => (
                            <tr key={member.id} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left whitespace-nowrap">{member.name}</td>
                                <td className="py-3 px-6 text-left">{member.role}</td>
                                <td className="py-3 px-6 text-left">{member.email}</td>
                                <td className="py-3 px-6 text-center">
                                    <div className="flex item-center justify-center">
                                        <button onClick={() => { setMemberToEdit(member); setModalOpen(true); }} className="w-4 mr-2 transform hover:text-blue-500 hover:scale-110">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </button>
                                        <button onClick={() => onUpdate('team', 'delete', member)} className="w-4 mr-2 transform hover:text-red-500 hover:scale-110">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">{memberToEdit ? 'Edit Member' : 'Add New Member'}</h3>
                        <form onSubmit={handleFormSubmit}>
                            <div className="mt-2 space-y-4">
                                <input type="text" name="name" placeholder="Name" defaultValue={memberToEdit?.name || ''} required className="w-full px-3 py-2 border rounded-md" />
                                <input type="text" name="role" placeholder="Role" defaultValue={memberToEdit?.role || ''} required className="w-full px-3 py-2 border rounded-md" />
                                <input type="email" name="email" placeholder="Email" defaultValue={memberToEdit?.email || ''} required className="w-full px-3 py-2 border rounded-md" />
                            </div>
                            <div className="mt-4 flex justify-end space-x-2">
                                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                                    {memberToEdit ? 'Save Changes' : 'Add Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const Tasks = ({ tasks, team, onUpdate }: any) => {
    const { t } = useLocalization();
    const [isModalOpen, setModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const newTask = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            assignee: formData.get('assignee') as string,
            status: formData.get('status') as Task['status'],
            dueDate: formData.get('dueDate') as string,
        };
        if (taskToEdit) {
            onUpdate('tasks', 'update', { ...newTask, id: taskToEdit.id });
        } else {
            onUpdate('tasks', 'add', newTask);
        }
        setModalOpen(false);
        setTaskToEdit(null);
    };

    return (
        <div className="p-6 bg-gray-50 rounded-lg shadow-inner min-h-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Tasks</h1>
                <button onClick={() => { setTaskToEdit(null); setModalOpen(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Add Task
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-xl shadow-md">
                    <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Name</th>
                            <th className="py-3 px-6 text-left">Assignee</th>
                            <th className="py-3 px-6 text-left">Status</th>
                            <th className="py-3 px-6 text-left">Due Date</th>
                            <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                        {tasks.map((task: Task) => (
                            <tr key={task.id} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left whitespace-nowrap">{task.name}</td>
                                <td className="py-3 px-6 text-left">{team.find((m: any) => m.id === task.assignee)?.name || task.assignee}</td>
                                <td className="py-3 px-6 text-left">{task.status}</td>
                                <td className="py-3 px-6 text-left">{task.dueDate}</td>
                                <td className="py-3 px-6 text-center">
                                    <div className="flex item-center justify-center">
                                        <button onClick={() => { setTaskToEdit(task); setModalOpen(true); }} className="w-4 mr-2 transform hover:text-blue-500 hover:scale-110">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </button>
                                        <button onClick={() => onUpdate('tasks', 'delete', task)} className="w-4 mr-2 transform hover:text-red-500 hover:scale-110">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">{taskToEdit ? 'Edit Task' : 'Add New Task'}</h3>
                        <form onSubmit={handleFormSubmit}>
                            <div className="mt-2 space-y-4">
                                <input type="text" name="name" placeholder="Name" defaultValue={taskToEdit?.name || ''} required className="w-full px-3 py-2 border rounded-md" />
                                <textarea name="description" placeholder="Description" defaultValue={taskToEdit?.description || ''} className="w-full px-3 py-2 border rounded-md" />
                                <select name="assignee" defaultValue={taskToEdit?.assignee || ''} required className="w-full px-3 py-2 border rounded-md">
                                    <option value="" disabled>Select Assignee</option>
                                    {team.map((member: any) => (
                                        <option key={member.id} value={member.id}>{member.name}</option>
                                    ))}
                                </select>
                                <select name="status" defaultValue={taskToEdit?.status || ''} required className="w-full px-3 py-2 border rounded-md">
                                    <option value="" disabled>Select Status</option>
                                    <option>To Do</option>
                                    <option>In Progress</option>
                                    <option>Done</option>
                                </select>
                                <input type="date" name="dueDate" placeholder="Due Date" defaultValue={taskToEdit?.dueDate || ''} required className="w-full px-3 py-2 border rounded-md" />
                            </div>
                            <div className="mt-4 flex justify-end space-x-2">
                                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                                    {taskToEdit ? 'Save Changes' : 'Add Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const Timeline = ({ tasks, team }: any) => {
    const { t } = useLocalization();

    return (
        <div className="p-6 bg-gray-50 rounded-lg shadow-inner min-h-full">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Project Timeline</h1>
            <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-gray-600">Timeline view for tasks will be displayed here.</p>
                <ul className="list-disc list-inside mt-4 space-y-2">
                    {tasks.map((task: Task) => (
                        <li key={task.id} className="text-gray-800">
                            <strong>{task.name}</strong> - Due: {task.dueDate}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const Budget = ({ budget, onUpdate }: any) => {
    const { t } = useLocalization();
    const [isModalOpen, setModalOpen] = useState(false);
    const [budgetItemToEdit, setBudgetItemToEdit] = useState<BudgetItem | null>(null);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const newItem = {
            name: formData.get('name') as string,
            category: formData.get('category') as string,
            amount: parseFloat(formData.get('amount') as string),
            notes: formData.get('notes') as string,
        };
        if (budgetItemToEdit) {
            onUpdate('budget', 'update', { ...newItem, id: budgetItemToEdit.id });
        } else {
            onUpdate('budget', 'add', newItem);
        }
        setModalOpen(false);
        setBudgetItemToEdit(null);
    };

    const totalBudget = budget.reduce((acc: number, item: BudgetItem) => acc + item.amount, 0);

    return (
        <div className="p-6 bg-gray-50 rounded-lg shadow-inner min-h-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Project Budget</h1>
                <button onClick={() => { setBudgetItemToEdit(null); setModalOpen(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Add Item
                </button>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md mb-6 flex justify-between items-center">
                <h2 className="text-xl font-semibold">Total Budget</h2>
                <span className="text-2xl font-bold text-green-600">${totalBudget.toFixed(2)}</span>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-xl shadow-md">
                    <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Item</th>
                            <th className="py-3 px-6 text-left">Category</th>
                            <th className="py-3 px-6 text-right">Amount</th>
                            <th className="py-3 px-6 text-left">Notes</th>
                            <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                        {budget.map((item: BudgetItem) => (
                            <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left whitespace-nowrap">{item.name}</td>
                                <td className="py-3 px-6 text-left">{item.category}</td>
                                <td className="py-3 px-6 text-right">${item.amount.toFixed(2)}</td>
                                <td className="py-3 px-6 text-left">{item.notes}</td>
                                <td className="py-3 px-6 text-center">
                                    <div className="flex item-center justify-center">
                                        <button onClick={() => { setBudgetItemToEdit(item); setModalOpen(true); }} className="w-4 mr-2 transform hover:text-blue-500 hover:scale-110">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </button>
                                        <button onClick={() => onUpdate('budget', 'delete', item)} className="w-4 mr-2 transform hover:text-red-500 hover:scale-110">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">{budgetItemToEdit ? 'Edit Budget Item' : 'Add New Budget Item'}</h3>
                        <form onSubmit={handleFormSubmit}>
                            <div className="mt-2 space-y-4">
                                <input type="text" name="name" placeholder="Name" defaultValue={budgetItemToEdit?.name || ''} required className="w-full px-3 py-2 border rounded-md" />
                                <input type="text" name="category" placeholder="Category" defaultValue={budgetItemToEdit?.category || ''} required className="w-full px-3 py-2 border rounded-md" />
                                <input type="number" name="amount" placeholder="Amount" defaultValue={budgetItemToEdit?.amount || ''} required className="w-full px-3 py-2 border rounded-md" />
                                <textarea name="notes" placeholder="Notes" defaultValue={budgetItemToEdit?.notes || ''} className="w-full px-3 py-2 border rounded-md" />
                            </div>
                            <div className="mt-4 flex justify-end space-x-2">
                                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                                    {budgetItemToEdit ? 'Save Changes' : 'Add Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const Risks = ({ risks, onUpdate }: any) => {
    const { t } = useLocalization();
    const [isModalOpen, setModalOpen] = useState(false);
    const [riskToEdit, setRiskToEdit] = useState<Risk | null>(null);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const newRisk = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            severity: formData.get('severity') as Risk['severity'],
            mitigationPlan: formData.get('mitigationPlan') as string,
        };
        if (riskToEdit) {
            onUpdate('risks', 'update', { ...newRisk, id: riskToEdit.id });
        } else {
            onUpdate('risks', 'add', newRisk);
        }
        setModalOpen(false);
        setRiskToEdit(null);
    };
    
    return (
        <div className="p-6 bg-gray-50 rounded-lg shadow-inner min-h-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Project Risks</h1>
                <button onClick={() => { setRiskToEdit(null); setModalOpen(true); }} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Add Risk
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-xl shadow-md">
                    <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Risk</th>
                            <th className="py-3 px-6 text-left">Severity</th>
                            <th className="py-3 px-6 text-left">Mitigation Plan</th>
                            <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light">
                        {risks.map((risk: Risk) => (
                            <tr key={risk.id} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-6 text-left whitespace-nowrap">{risk.name}</td>
                                <td className="py-3 px-6 text-left">{risk.severity}</td>
                                <td className="py-3 px-6 text-left">{risk.mitigationPlan}</td>
                                <td className="py-3 px-6 text-center">
                                    <div className="flex item-center justify-center">
                                        <button onClick={() => { setRiskToEdit(risk); setModalOpen(true); }} className="w-4 mr-2 transform hover:text-blue-500 hover:scale-110">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </button>
                                        <button onClick={() => onUpdate('risks', 'delete', risk)} className="w-4 mr-2 transform hover:text-red-500 hover:scale-110">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
                        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">{riskToEdit ? 'Edit Risk' : 'Add New Risk'}</h3>
                        <form onSubmit={handleFormSubmit}>
                            <div className="mt-2 space-y-4">
                                <input type="text" name="name" placeholder="Name" defaultValue={riskToEdit?.name || ''} required className="w-full px-3 py-2 border rounded-md" />
                                <textarea name="description" placeholder="Description" defaultValue={riskToEdit?.description || ''} className="w-full px-3 py-2 border rounded-md" />
                                <select name="severity" defaultValue={riskToEdit?.severity || ''} required className="w-full px-3 py-2 border rounded-md">
                                    <option value="" disabled>Select Severity</option>
                                    <option>Low</option>
                                    <option>Medium</option>
                                    <option>High</option>
                                </select>
                                <textarea name="mitigationPlan" placeholder="Mitigation Plan" defaultValue={riskToEdit?.mitigationPlan || ''} className="w-full px-3 py-2 border rounded-md" />
                            </div>
                            <div className="mt-4 flex justify-end space-x-2">
                                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                                    {riskToEdit ? 'Save Changes' : 'Add Risk'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const NewProjectModal = ({ isOpen, onClose, onSubmit, projectToEdit }: any) => {
    const [name, setName] = useState(projectToEdit?.name || '');
    const [description, setDescription] = useState(projectToEdit?.description || '');
    const [status, setStatus] = useState(projectToEdit?.status || 'In Progress');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, description, status });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">{projectToEdit ? 'Edit Project' : 'Create New Project'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mt-2 space-y-4">
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Project Name" required className="w-full px-3 py-2 border rounded-md" />
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" required className="w-full px-3 py-2 border rounded-md" />
                        <select value={status} onChange={(e) => setStatus(e.target.value as 'In Progress' | 'On Hold' | 'Completed')} required className="w-full px-3 py-2 border rounded-md">
                            <option value="In Progress">In Progress</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                            {projectToEdit ? 'Save Changes' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ConfirmationModal = ({ message, onConfirm, onCancel }: any) => {
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white text-center">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Confirmation</h3>
                <p className="text-sm text-gray-500">{message}</p>
                <div className="mt-4 flex justify-center space-x-4">
                    <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                        Confirm
                    </button>
                    <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

// Firebase configuration (should be populated by environment variables in a real deployment)
const fallbackFirebaseConfig = {
    apiKey: "AIzaSyCr6zvT7MqzlLGylTUvWlWfJudgi_nFCos",
    authDomain: "yoyo-projects-management.firebaseapp.com",
    projectId: "yoyo-projects-management",
    storageBucket: "yoyo-projects-management.firebasestorage.app",
    messagingSenderId: "314270688402",
    appId: "1:314270688402:web:4dbe40616d4732d444724b",
    measurementId: "G-9YHY63624V"
};

const firebaseConfig = typeof __firebase_config !== 'undefined' 
    ? JSON.parse(__firebase_config) 
    : fallbackFirebaseConfig;

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const APP_ID = typeof __app_id !== 'undefined' ? __app_id : "yoyo-projects-management";
const userId = auth.currentUser?.uid || crypto.randomUUID();

// --- LOGIN PAGE ---
function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">Yoyo Projects Management</h2>
                <form onSubmit={handleSignIn} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                    </div>
                    {error && <p className="text-sm text-center text-red-500">{error}</p>}
                    <button type="submit" className="w-full px-4 py-2 font-medium text-white rounded-md bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Sign In</button>
                </form>
            </div>
        </div>
    );
}

// --- MAIN APP CONTENT ---
function AppContent({ user }: { user: User }) {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [budget, setBudget] = useState<BudgetItem[]>([]);
    const [risks, setRisks] = useState<Risk[]>([]);
    const [loading, setLoading] = useState(true);

    const [isProjectModalOpen, setProjectModalOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
    const [confirmation, setConfirmation] = useState<{
        message: string;
        onConfirm: () => void;
    } | null>(null);

    const projectsCollectionRef = collection(db, `artifacts/${APP_ID}/public/data/projects`);

    // Fetch projects
    useEffect(() => {
        setLoading(true);
        const unsubscribe = onSnapshot(projectsCollectionRef, snapshot => {
            const projectsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Project[];
            setProjects(projectsData);
            if (!selectedProjectId && projectsData.length > 0) {
                setSelectedProjectId(projectsData[0].id);
            } else if (projectsData.length === 0) {
                setSelectedProjectId(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);
    
    // Fetch data for the selected project
    useEffect(() => {
        if (!selectedProjectId) {
            setTasks([]);
            setTeam([]);
            setBudget([]);
            setRisks([]);
            return;
        };

        const projectRef = doc(db, `artifacts/${APP_ID}/public/data/projects/${selectedProjectId}`);
        
        const unsubTasks = onSnapshot(collection(projectRef, 'tasks'), snapshot => {
            setTasks(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})) as Task[]);
        });
        const unsubTeam = onSnapshot(collection(projectRef, 'team'), snapshot => {
            setTeam(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})) as TeamMember[]);
        });
        const unsubBudget = onSnapshot(collection(projectRef, 'budget'), snapshot => {
            setBudget(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})) as BudgetItem[]);
        });
        const unsubRisks = onSnapshot(collection(projectRef, 'risks'), snapshot => {
            setRisks(snapshot.docs.map(doc => ({...doc.data(), id: doc.id})) as Risk[]);
        });

        return () => {
            unsubTasks();
            unsubTeam();
            unsubBudget();
            unsubRisks();
        };
    }, [selectedProjectId]);

    const handleProjectSubmit = async (project: Omit<Project, 'id'>) => {
        if (projectToEdit) {
            await updateDoc(doc(projectsCollectionRef, projectToEdit.id), project);
        } else {
            await addDoc(projectsCollectionRef, project);
        }
        setProjectModalOpen(false);
        setProjectToEdit(null);
    };

    const handleDeleteProject = (projectId: string) => {
        setConfirmation({
            message: 'Are you sure you want to delete this project and all its data?',
            onConfirm: async () => {
                const projectDoc = doc(projectsCollectionRef, projectId);
                const batch = writeBatch(db);

                // Delete subcollections
                const subcollections = ['tasks', 'team', 'budget', 'risks'];
                for (const sub of subcollections) {
                    const subcollectionRef = collection(projectDoc, sub);
                    const snapshot = await getDocs(query(subcollectionRef));
                    snapshot.forEach(doc => batch.delete(doc.ref));
                }
                
                // Delete project itself
                batch.delete(projectDoc);
                await batch.commit();

                if (selectedProjectId === projectId) {
                    setSelectedProjectId(projects.length > 1 ? projects.find(p => p.id !== projectId)!.id : null);
                }
                setConfirmation(null);
            },
        });
    };
    
    const handleSubCollectionUpdate = useCallback(async (
        collectionName: 'tasks' | 'team' | 'budget' | 'risks',
        action: 'add' | 'update' | 'delete',
        data: any
    ) => {
        if (!selectedProjectId) return;
        const collectionRef = collection(db, `artifacts/${APP_ID}/public/data/projects/${selectedProjectId}/${collectionName}`);
        
        try {
            if (action === 'add') {
                const { id, ...addData } = data;
                await addDoc(collectionRef, addData);
            } else if (action === 'update') {
                const { id, ...updateData } = data;
                await updateDoc(doc(collectionRef, id), updateData);
            } else if (action === 'delete') {
                await deleteDoc(doc(collectionRef, data.id));
            }
        } catch (error) {
            console.error(`Error performing ${action} on ${collectionName}:`, error);
        }

    }, [selectedProjectId]);


    const selectedProject = projects.find(p => p.id === selectedProjectId);

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">Loading...</div>
    }

    return (
        <div className="app-container flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <Sidebar 
                projects={projects}
                selectedProjectId={selectedProjectId}
                onSelectProject={setSelectedProjectId}
                onNewProject={() => { setProjectToEdit(null); setProjectModalOpen(true); }}
                onEditProject={(project: Project) => { setProjectToEdit(project); setProjectModalOpen(true); }}
                onDeleteProject={handleDeleteProject}
            />
            <div className="main-content flex-grow flex flex-col overflow-auto">
                <Header user={user} onSignOut={() => signOut(auth)} />
                <main className="page-content p-6 flex-grow">
                    {selectedProject ? (
                        <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<Dashboard project={selectedProject} tasks={tasks} team={team} budget={budget} />} />
                            <Route path="/team" element={<Team team={team} onUpdate={handleSubCollectionUpdate} />} />
                            <Route path="/tasks" element={<Tasks tasks={tasks} team={team} onUpdate={handleSubCollectionUpdate} />} />
                            <Route path="/timeline" element={<Timeline tasks={tasks} team={team} />} />
                            <Route path="/budget" element={<Budget budget={budget} onUpdate={handleSubCollectionUpdate} />} />
                            <Route path="/risks" element={<Risks risks={risks} onUpdate={handleSubCollectionUpdate} />} />
                        </Routes>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                             <h2 className="text-2xl font-semibold">No Projects Found</h2>
                             <p className="mt-2">Create a new project to get started.</p>
                             <button onClick={() => { setProjectToEdit(null); setProjectModalOpen(true); }} className="mt-4 px-4 py-2 text-white rounded-md bg-blue-600 hover:bg-blue-700">
                                 Create Project
                             </button>
                        </div>
                    )}
                </main>
            </div>
            {isProjectModalOpen && (
                <NewProjectModal
                    isOpen={isProjectModalOpen}
                    onClose={() => { setProjectModalOpen(false); setProjectToEdit(null); }}
                    onSubmit={handleProjectSubmit}
                    projectToEdit={projectToEdit}
                />
            )}
            {confirmation && (
                <ConfirmationModal
                    message={confirmation.message}
                    onConfirm={confirmation.onConfirm}
                    onCancel={() => setConfirmation(null)}
                />
            )}
        </div>
    );
}

// --- ROOT APP COMPONENT ---
function App() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const initialToken = (window as any).__initial_auth_token;
            try {
                if (initialToken) {
                    await signInWithCustomToken(auth, initialToken);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Firebase Auth Error:", error);
            }

            const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
                setUser(currentUser);
                setLoading(false);
            });
            return () => unsubscribe();
        };

        initializeAuth();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">Authenticating...</div>;
    }

    return (
        <LocalizationProvider>
            <Router>
                {user ? <AppContent user={user} /> : <LoginPage />}
            </Router>
        </LocalizationProvider>
    );
}

export default App;