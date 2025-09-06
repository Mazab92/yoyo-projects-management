import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// Fix: Separated Firebase 'User' type import from function imports.
// FIX: Switched to Firebase compat mode. Removing modular auth function imports.
// import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
// import type { User } from 'firebase/auth';
// FIX: Import User type from compat library.
// import type { User } from 'firebase/compat/auth';
// FIX: The User type is not a named export from 'firebase/compat/auth'. It must be accessed via the firebase namespace.
import firebase from 'firebase/compat/app';
import { 
    collection, onSnapshot, doc, addDoc, updateDoc, writeBatch, query, where, getDocs, serverTimestamp, setDoc, getDoc, Timestamp
} from 'firebase/firestore';

import { auth, db } from './lib/firebase';
import { logActivity } from './lib/activityLog';
import { translations } from './lib/i18n';
import { Project, Locale, Task } from './types';

import { ToastProvider } from './context/ToastContext';
import { useToast } from './hooks/useToast';
import { ProjectContext } from './context/ProjectContext';

import LoginPage from './pages/LoginPage';
import ProjectScope from './layouts/ProjectScope';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BouncingLoader from './components/BouncingLoader';
import ProjectModal from './components/ProjectModal';
import ConfirmationModal from './components/ConfirmationModal';

// Import newly implemented pages
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/Tasks';
import TeamPage from './pages/Team';
import BudgetPage from './pages/Budget';
import RisksPage from './pages/Risks';
import CalendarPage from './pages/Calendar';
import ReportsPage from './pages/Reports';
import SettingsPage from './pages/Settings';
import ProfilePage from './pages/Profile';

const AppContainer = () => {
    // FIX: Use firebase.User type from the firebase namespace.
    const [user, setUser] = useState<firebase.User | null>(null);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light');
    const [locale, setLocale] = useState<Locale>(() => (localStorage.getItem('locale') as Locale) || 'en');
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => localStorage.getItem('selectedProjectId'));
    
    const [isProjectModalOpen, setProjectModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [notifiedTaskIds, setNotifiedTaskIds] = useState<string[]>([]);

    const { addToast } = useToast();
    const currentProject = useMemo(() => projects.find(p => p.id === selectedProjectId) || null, [projects, selectedProjectId]);
    const t = useCallback((key: string, params: Record<string, string> = {}) => {
        let translation = (translations[locale] as any)[key] || key;
        Object.keys(params).forEach(param => {
            translation = translation.replace(`{${param}}`, params[param]);
        });
        return translation;
    }, [locale]);

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
        // FIX: Use auth.onAuthStateChanged from compat API.
        const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
            if (authUser) {
                const userDocRef = doc(db, 'users', authUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (!userDoc.exists()) {
                    await setDoc(userDocRef, {
                        name: authUser.displayName || authUser.email?.split('@')[0] || 'New User',
                        email: authUser.email,
                        role: 'Member',
                        projects: [],
                    });
                }
            }
            setUser(authUser);
            if (!authUser) {
                setSelectedProjectId(null);
                setProjects([]);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
            const q = query(collection(db, "projects"), where("team", "array-contains", user.uid));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const projectsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
                setProjects(projectsData);
            }, (error) => {
                console.error("Error fetching projects:", error);
                addToast(t('fetchProjectsError', { message: error.message }), 'error');
            });
            return () => unsubscribe();
        }
    }, [user, addToast, t]);

    useEffect(() => {
        if (projects.length > 0 && !projects.some(p => p.id === selectedProjectId)) {
            const newProjectId = projects[0].id;
            setSelectedProjectId(newProjectId);
            localStorage.setItem('selectedProjectId', newProjectId);
        } else if (projects.length === 0 && selectedProjectId) {
            setSelectedProjectId(null);
            localStorage.removeItem('selectedProjectId');
        }
    }, [projects, selectedProjectId]);

    useEffect(() => {
        if (!user) return;

        const checkReminders = async () => {
            try {
                const now = new Date();
                const q = query(
                    collection(db, 'tasks'),
                    where('assignedTo', '==', user.uid),
                    where('status', '!=', 'Done'),
                    where('reminderDate', '<=', Timestamp.fromDate(now))
                );
                const snapshot = await getDocs(q);
                snapshot.forEach(doc => {
                    const task = { id: doc.id, ...doc.data() } as Task;
                    if (task.reminderDate && !notifiedTaskIds.includes(task.id)) {
                        addToast(t('reminderToast', { taskName: task.title }), 'info');
                        setNotifiedTaskIds(prev => [...prev, task.id]);
                    }
                });
            } catch (error) {
                console.error("Error checking reminders:", error);
            }
        };

        const intervalId = setInterval(checkReminders, 60000); // Check every minute
        return () => clearInterval(intervalId);
    }, [user, notifiedTaskIds, addToast, t]);


    // FIX: Use auth.signInWithEmailAndPassword from compat API.
    const handleLogin = (email: string, pass: string) => auth.signInWithEmailAndPassword(email, pass);
    
    const handleSignUp = async (email: string, pass: string) => {
        const userCredential = await auth.createUserWithEmailAndPassword(email, pass);
        const newUser = userCredential.user;
        if (newUser) {
            // Immediately create the user document in Firestore to ensure sync
            const userDocRef = doc(db, 'users', newUser.uid);
            await setDoc(userDocRef, {
                name: newUser.email?.split('@')[0] || 'New User',
                email: newUser.email,
                role: 'Member',
                projects: [],
            });
        }
        return userCredential;
    };

    // FIX: Use auth.signOut from compat API.
    const handleSignOut = () => auth.signOut();
    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    const toggleLocale = () => setLocale(prev => prev === 'en' ? 'ar' : 'en');
    const handleSelectProject = (id: string) => {
        setSelectedProjectId(id);
        localStorage.setItem('selectedProjectId', id);
        setSidebarOpen(false);
    };

    const handleNewProject = () => {
        setProjectToEdit(null);
        setProjectModalOpen(true);
    };

    const handleEditProject = (project: Project) => {
        setProjectToEdit(project);
        setProjectModalOpen(true);
    };

    const handleDeleteProject = (project: Project) => {
        setProjectToDelete(project);
        setDeleteModalOpen(true);
    };

    const confirmDeleteProject = async () => {
        if (!projectToDelete || !user) return;
        try {
            const projectId = projectToDelete.id;
            const batch = writeBatch(db);
            const projectRef = doc(db, 'projects', projectId);
            batch.delete(projectRef);

            const collectionsToDelete = ['tasks', 'team', 'budget', 'risks', 'activity_logs'];
            for (const coll of collectionsToDelete) {
                const q = query(collection(db, coll), where('projectId', '==', projectId));
                const snapshot = await getDocs(q);
                snapshot.docs.forEach(doc => batch.delete(doc.ref));
            }
            await batch.commit();
            await logActivity(`Deleted project: ${projectToDelete.name}`, { projectId });
            addToast(t('deleteProjectSuccess', { name: projectToDelete.name }), 'success');
        } catch (error) {
            console.error("Error deleting project: ", error);
            addToast(t('deleteProjectError'), 'error');
        } finally {
            setDeleteModalOpen(false);
            setProjectToDelete(null);
        }
    };

    const handleSaveProject = async (projectData: Omit<Project, 'id' | 'createdBy' | 'team' | 'createdAt'>) => {
        if (!user) return;
        try {
            if (projectToEdit) {
                const projectRef = doc(db, 'projects', projectToEdit.id);
                await updateDoc(projectRef, projectData);
                await logActivity(`Updated project: ${projectData.name}`, { projectId: projectToEdit.id });
                addToast(t('saveProjectSuccess', { name: projectData.name }), 'success');
            } else {
                const newProject = {
                    ...projectData,
                    createdBy: user.uid,
                    team: [user.uid],
                    createdAt: serverTimestamp(),
                };
                const docRef = await addDoc(collection(db, 'projects'), newProject);
                // Also add project to user's project list
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const userProjects = userData.projects || [];
                    await updateDoc(userDocRef, {
                        projects: [...userProjects, docRef.id]
                    });
                }

                await logActivity(`Created project: ${projectData.name}`, { projectId: docRef.id });
                addToast(t('createProjectSuccess', { name: projectData.name }), 'success');
            }
        } catch (error) {
            console.error("Error saving project: ", error);
            addToast(t('saveProjectError'), 'error');
        } finally {
            setProjectModalOpen(false);
            setProjectToEdit(null);
        }
    };
    
    if (loading) {
        return <div className="flex items-center justify-center w-full h-screen bg-gray-50 dark:bg-dark-primary"><BouncingLoader /></div>;
    }

    if (!user) {
        return <LoginPage onLogin={handleLogin} onSignUp={handleSignUp} t={t} />;
    }
    
    return (
        <ProjectContext.Provider value={{ currentProject, projects }}>
            <BrowserRouter>
                <div className={`flex h-screen bg-gray-100 dark:bg-dark-primary text-gray-900 dark:text-gray-100`}>
                    <Sidebar 
                        projects={projects}
                        selectedProjectId={selectedProjectId}
                        onSelectProject={handleSelectProject}
                        onNewProject={handleNewProject}
                        onEditProject={handleEditProject}
                        onDeleteProject={handleDeleteProject}
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
                                    <Route path="/" element={<Dashboard t={t} />} />
                                    <Route path="/tasks" element={<TasksPage t={t} locale={locale} />} />
                                    <Route path="/calendar" element={<CalendarPage t={t} locale={locale} />} />
                                    <Route path="/team" element={<TeamPage t={t} />} />
                                    <Route path="/budget" element={<BudgetPage t={t} locale={locale} />} />
                                    <Route path="/risks" element={<RisksPage t={t} />} />
                                    <Route path="/reports" element={<ReportsPage t={t} locale={locale} />} />
                                </Route>
                                <Route path="/settings" element={<SettingsPage t={t} locale={locale} />} />
                                <Route path="/profile" element={<ProfilePage user={user} t={t} locale={locale} />} />
                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                        </main>
                    </div>
                </div>
                <ProjectModal 
                    isOpen={isProjectModalOpen}
                    onClose={() => setProjectModalOpen(false)}
                    onSave={handleSaveProject}
                    project={projectToEdit}
                    t={t}
                />
                <ConfirmationModal 
                    isOpen={isDeleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={confirmDeleteProject}
                    title={t('deleteProjectTitle')}
                    message={t('deleteProjectMessage')}
                    t={t}
                />
            </BrowserRouter>
        </ProjectContext.Provider>
    );
};

const App = () => (
    <ToastProvider>
        <AppContainer />
    </ToastProvider>
);

export default App;