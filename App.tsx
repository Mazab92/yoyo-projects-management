import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
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
    getDocs
} from 'firebase/firestore';

import { LocalizationProvider } from './context/LocalizationContext';
import DashboardLayout from './layouts/DashboardLayout';
import NewProjectModal from './components/NewProjectModal';
import ConfirmationModal from './components/ConfirmationModal';
import Toast from './components/Toast';

import type { Project, Task, TeamMember, BudgetItem, Risk } from './types';

// Lazy load page components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Team = lazy(() => import('./pages/Team'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Timeline = lazy(() => import('./pages/Timeline'));
const Budget = lazy(() => import('./pages/Budget'));
const Risks = lazy(() => import('./pages/Risks'));


declare var __firebase_config: string;

const fallbackFirebaseConfig = {
    apiKey: "AIzaSyCr6zvT7MqzlLGylTUvWlWfJudgi_nFCos",
    authDomain: "yoyo-projects-management.firebaseapp.com",
    projectId: "yoyo-projects-management",
    storageBucket: "yoyo-projects-management.appspot.com",
    messagingSenderId: "314270688402",
    appId: "1:314270688402:web:4dbe40616d4732d444724b"
};

const firebaseConfig = typeof __firebase_config !== 'undefined' 
    ? JSON.parse(__firebase_config) 
    : fallbackFirebaseConfig;

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const APP_ID = window.APP_ID || "yoyo-projects-management";

type ToastMessage = {
    id: number;
    message: string;
    type: 'success' | 'error';
};

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
        <div className="flex items-center justify-center min-h-screen bg-light dark:bg-dark">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-dark-secondary">
                <h2 className="text-2xl font-bold text-center text-dark dark:text-light">Yoyo Projects Management</h2>
                <form onSubmit={handleSignIn} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                    </div>
                    {error && <p className="text-sm text-center text-red-500">{error}</p>}
                    <button type="submit" className="w-full px-4 py-2 font-medium text-white rounded-md bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">Sign In</button>
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
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = (message: string, type: 'success' | 'error') => {
        const newToast = { id: Date.now(), message, type };
        setToasts(prevToasts => [...prevToasts, newToast]);
        setTimeout(() => {
            setToasts(prevToasts => prevToasts.filter(toast => toast.id !== newToast.id));
        }, 3000);
    };

    const projectsCollectionRef = collection(db, `artifacts/${APP_ID}/public/data/projects`);

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
        }, (error) => {
            console.error("Error fetching projects: ", error);
            showToast("Failed to load projects.", "error");
            setLoading(false);
        });
        return unsubscribe;
    }, []);
    
    useEffect(() => {
        if (!selectedProjectId) {
            setTasks([]); setTeam([]); setBudget([]); setRisks([]); return;
        };

        const projectRef = doc(db, `artifacts/${APP_ID}/public/data/projects/${selectedProjectId}`);
        const unsubscribers = ['tasks', 'team', 'budget', 'risks'].map(col => {
            return onSnapshot(collection(projectRef, col), snapshot => {
                const data = snapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
                switch(col) {
                    case 'tasks': setTasks(data as Task[]); break;
                    case 'team': setTeam(data as TeamMember[]); break;
                    case 'budget': setBudget(data as BudgetItem[]); break;
                    case 'risks': setRisks(data as Risk[]); break;
                }
            }, (error) => {
                console.error(`Error fetching ${col}:`, error);
                showToast(`Failed to load ${col}.`, "error");
            });
        });
        return () => unsubscribers.forEach(unsub => unsub());
    }, [selectedProjectId]);

    const handleProjectSubmit = async (project: Omit<Project, 'id'>) => {
        try {
            if (projectToEdit) {
                await updateDoc(doc(projectsCollectionRef, projectToEdit.id), project);
                showToast("Project updated successfully!", "success");
            } else {
                await addDoc(projectsCollectionRef, project);
                showToast("Project created successfully!", "success");
            }
        } catch (error) {
            showToast("Failed to save project.", "error");
        } finally {
            setProjectModalOpen(false);
            setProjectToEdit(null);
        }
    };

    const handleDeleteProject = (projectId: string) => {
        setConfirmation({
            message: 'Are you sure you want to delete this project and all its data?',
            onConfirm: async () => {
                try {
                    const projectDoc = doc(projectsCollectionRef, projectId);
                    const batch = writeBatch(db);
                    const subcollections = ['tasks', 'team', 'budget', 'risks'];
                    for (const sub of subcollections) {
                        const snapshot = await getDocs(query(collection(projectDoc, sub)));
                        snapshot.forEach(doc => batch.delete(doc.ref));
                    }
                    batch.delete(projectDoc);
                    await batch.commit();
                    showToast("Project deleted successfully!", "success");

                    if (selectedProjectId === projectId) {
                        setSelectedProjectId(projects.length > 1 ? projects.find(p => p.id !== projectId)!.id : null);
                    }
                } catch (error) {
                    showToast("Failed to delete project.", "error");
                } finally {
                    setConfirmation(null);
                }
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
                showToast(`${collectionName.slice(0, -1)} added!`, "success");
            } else if (action === 'update') {
                const { id, ...updateData } = data;
                await updateDoc(doc(collectionRef, id), updateData);
                showToast(`${collectionName.slice(0, -1)} updated!`, "success");
            } else if (action === 'delete') {
                await deleteDoc(doc(collectionRef, data.id));
                showToast(`${collectionName.slice(0, -1)} deleted!`, "success");
            }
        } catch (error) {
            console.error(`Error performing ${action} on ${collectionName}:`, error);
            showToast(`Failed to ${action} ${collectionName.slice(0, -1)}.`, "error");
        }

    }, [selectedProjectId]);

    const handleSubCollectionDelete = (
        collectionName: 'tasks' | 'team' | 'budget' | 'risks',
        item: { id: string, name?: string }
    ) => {
        setConfirmation({
            message: `Are you sure you want to delete "${item.name || 'this item'}"?`,
            onConfirm: () => {
                handleSubCollectionUpdate(collectionName, 'delete', item);
                setConfirmation(null);
            }
        });
    };

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-light dark:bg-dark text-dark dark:text-light">Loading Projects...</div>
    }

    return (
        <DashboardLayout 
            user={user}
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={setSelectedProjectId}
            onNewProject={() => { setProjectToEdit(null); setProjectModalOpen(true); }}
            onEditProject={(project) => { setProjectToEdit(project); setProjectModalOpen(true); }}
            onDeleteProject={handleDeleteProject}
            onSignOut={() => signOut(auth)}
        >
            <main className="flex-1 p-4 overflow-y-auto lg:p-6 bg-light dark:bg-dark">
                <Suspense fallback={<div className="flex items-center justify-center h-full">Loading Page...</div>}>
                    {selectedProject ? (
                        <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<Dashboard project={selectedProject} tasks={tasks} team={team} budget={budget} />} />
                            <Route path="/team" element={<Team team={team} onUpdate={handleSubCollectionUpdate} onDelete={item => handleSubCollectionDelete('team', item)} />} />
                            <Route path="/tasks" element={<Tasks tasks={tasks} team={team} onUpdate={handleSubCollectionUpdate} onDelete={item => handleSubCollectionDelete('tasks', item)} />} />
                            <Route path="/timeline" element={<Timeline tasks={tasks} team={team} />} />
                            <Route path="/budget" element={<Budget budget={budget} onUpdate={handleSubCollectionUpdate} onDelete={item => handleSubCollectionDelete('budget', item)}/>} />
                            <Route path="/risks" element={<Risks risks={risks} onUpdate={handleSubCollectionUpdate} onDelete={item => handleSubCollectionDelete('risks', item)} />} />
                        </Routes>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                             <h2 className="text-2xl font-semibold">No Projects Found</h2>
                             <p className="mt-2">Create a new project to get started.</p>
                             <button onClick={() => { setProjectToEdit(null); setProjectModalOpen(true); }} className="mt-4 px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-dark">
                                 Create Project
                             </button>
                        </div>
                    )}
                </Suspense>
            </main>
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
            <div className="fixed top-4 right-4 z-[100] space-y-2">
                {toasts.map(toast => (
                    <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToasts(ts => ts.filter(t => t.id !== toast.id))} />
                ))}
            </div>
        </DashboardLayout>
    );
}


// --- ROOT APP COMPONENT ---
function App() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-screen bg-light dark:bg-dark text-dark dark:text-light">Authenticating...</div>
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