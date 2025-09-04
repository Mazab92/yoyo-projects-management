import React, { useState, useEffect, useCallback } from 'react';
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

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Team from './pages/Team';
import Tasks from './pages/Tasks';
import Timeline from './pages/Timeline';
import Budget from './pages/Budget';
import Risks from './pages/Risks';
import { LocalizationProvider } from './context/LocalizationContext';
import NewProjectModal from './components/NewProjectModal';
import ConfirmationModal from './components/ConfirmationModal';

import type { Project, Task, TeamMember, BudgetItem, Risk } from './types';

// Fix: Declare `__firebase_config` as a global variable to prevent TypeScript errors.
// This variable is expected to be injected by the build environment.
declare var __firebase_config: string;

// Firebase configuration (should be populated by environment variables in a real deployment)
const fallbackFirebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const firebaseConfig = typeof __firebase_config !== 'undefined' 
    ? JSON.parse(__firebase_config) 
    : fallbackFirebaseConfig;

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const APP_ID = window.APP_ID || "yoyo-projects-management";

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
        return <div className="flex items-center justify-center h-screen bg-light dark:bg-dark text-dark dark:text-light">Loading...</div>
    }

    return (
        <div className="app-container" style={{ display: 'flex', height: '100vh' }}>
            <Sidebar 
                projects={projects}
                selectedProjectId={selectedProjectId}
                onSelectProject={setSelectedProjectId}
                onNewProject={() => { setProjectToEdit(null); setProjectModalOpen(true); }}
                onEditProject={(project) => { setProjectToEdit(project); setProjectModalOpen(true); }}
                onDeleteProject={handleDeleteProject}
            />
            <div className="main-content" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
                <Header user={user} onSignOut={() => signOut(auth)} />
                <main className="page-content" style={{ padding: '24px' }}>
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
                             <button onClick={() => { setProjectToEdit(null); setProjectModalOpen(true); }} className="mt-4 px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-dark">
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