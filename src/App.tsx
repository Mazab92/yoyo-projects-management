import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { 
    collection, onSnapshot, doc, addDoc, updateDoc, writeBatch, query, where, getDocs, serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { translations } from './lib/i18n';
import { Project, Locale } from './types';

// FIX: `useToast` is a custom hook and should be imported from its own file.
import { ToastProvider } from './context/ToastContext';
import { useToast } from './hooks/useToast';
import { ProjectContext } from './context/ProjectContext';

import LoginPage from './pages/LoginPage';
import PlaceholderPage from './pages/PlaceholderPage';
import ProjectScope from './layouts/ProjectScope';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BouncingLoader from './components/BouncingLoader';
import ProjectModal from './components/ProjectModal';
import ConfirmationModal from './components/ConfirmationModal';

const AppContainer = () => {
    const [user, setUser] = useState<User | null>(null);
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

    const { addToast } = useToast();
    const currentProject = useMemo(() => projects.find(p => p.id === selectedProjectId) || null, [projects, selectedProjectId]);
    const t = (key: string, params: Record<string, string> = {}) => {
        let translation = (translations[locale] as any)[key] || key;
        Object.keys(params).forEach(param => {
            translation = translation.replace(`{${param}}`, params[param]);
        });
        return translation;
    };

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
            }, (error) => {
                console.error("Error fetching projects:", error);
                addToast(t('fetchProjectsError', { message: error.message }), 'error');
            });
            return () => unsubscribe();
        }
    }, [user, selectedProjectId, addToast, t]);

    const handleLogin = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
    const handleSignOut = () => signOut(auth);
    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
    const toggleLocale = () => setLocale(prev => prev === 'en' ? 'ar' : 'en');
    const handleSelectProject = (id: string) => {
        setSelectedProjectId(id);
        localStorage.setItem('selectedProjectId', id);
        setSidebarOpen(false);
    };

    // --- CRUD Handlers ---
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

            // Delete associated items in other collections (example)
            const collectionsToDelete = ['tasks', 'team', 'budget', 'risks'];
            for (const coll of collectionsToDelete) {
                const q = query(collection(db, coll), where('projectId', '==', projectId));
                const snapshot = await getDocs(q);
                snapshot.docs.forEach(doc => batch.delete(doc.ref));
            }
            await batch.commit();
            addToast(t('deleteProjectSuccess', { name: projectToDelete.name }), 'success');
        } catch (error) {
            console.error("Error deleting project: ", error);
            addToast(t('deleteProjectError'), 'error');
        } finally {
            setDeleteModalOpen(false);
            setProjectToDelete(null);
        }
    };

    const handleSaveProject = async (projectData: Omit<Project, 'id' | 'ownerId' | 'members'>) => {
        if (!user) return;
        try {
            if (projectToEdit) { // Update existing project
                const projectRef = doc(db, 'projects', projectToEdit.id);
                await updateDoc(projectRef, projectData);
                addToast(t('saveProjectSuccess', { name: projectData.name }), 'success');
            } else { // Create new project
                await addDoc(collection(db, 'projects'), {
                    ...projectData,
                    ownerId: user.uid,
                    members: [user.uid],
                    createdAt: serverTimestamp(),
                });
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
        return <LoginPage onLogin={handleLogin} t={t} />;
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
                        onDeleteProject={(id) => {
                            const proj = projects.find(p => p.id === id);
                            if(proj) handleDeleteProject(proj);
                        }}
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
                                    <Route path="/reports" element={<PlaceholderPage title={t('reports')} />} />
                                    <Route path="/settings" element={<PlaceholderPage title={t('settings')} />} />
                                </Route>
                                <Route path="/profile" element={<PlaceholderPage title={t('profile')} />} />
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