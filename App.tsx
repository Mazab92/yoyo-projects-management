
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Team from './pages/Team';
import Tasks from './pages/Tasks';
import Timeline from './pages/Timeline';
import Budget from './pages/Budget';
import Risks from './pages/Risks';
import NewProjectModal from './components/NewProjectModal';
import { Page, Project, Task, BudgetItem, Risk, TeamMember, UserRole } from './types';
import { LocalizationProvider } from './context/LocalizationContext';
import { useLocalization } from './hooks/useLocalization';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, writeBatch, getDocs, DocumentData, QuerySnapshot, CollectionReference } from 'firebase/firestore';
import { Rocket } from 'lucide-react';
import TeamMemberModal from './components/TeamMemberModal';

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "YOUR_API_KEY", // Replace with your Firebase config
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
// FIX: Export auth so it can be imported by other components.
export const auth = getAuth(app);
const db = getFirestore(app);

const getCollectionPath = (path: string) => {
    const appId = (window as any).APP_ID || 'default-app';
    return `artifacts/${appId}/public/data/${path}`;
};

const projectsCollectionRef = () => collection(db, getCollectionPath('projects'));
const projectDocRef = (projectId: string) => doc(db, getCollectionPath(`projects/${projectId}`));
const subCollectionRef = (projectId: string, subCollection: string) => collection(db, getCollectionPath(`projects/${projectId}/${subCollection}`));

// --- LOGIN PAGE COMPONENT ---
const LoginPage = () => {
    const { t } = useLocalization();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setSuccess('Sign in successful! Redirecting...');
        } catch (err: any) {
            setError('Failed to sign in. Please check your credentials.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="flex items-center justify-center min-h-screen bg-light dark:bg-dark font-sans" dir={t('dashboard') === 'Dashboard' ? 'ltr' : 'rtl'}>
            <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg dark:bg-dark-secondary">
                <div className="flex flex-col items-center text-center">
                    <div className="bg-primary rounded-lg p-3 mb-4">
                        <Rocket size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-dark dark:text-light leading-tight">{t('appNameEnglish')}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('appNameArabic')}</p>
                </div>
                <form className="mt-6 space-y-4" onSubmit={handleSignIn}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary sm:text-sm" placeholder="you@example.com" />
                    </div>
                    <div>
                        <label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary sm:text-sm" placeholder="••••••••" />
                    </div>
                    {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800">{error}</div>}
                    {success && <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800">{success}</div>}
                    <div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50">
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </div>
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

  // Fetch projects
  useEffect(() => {
    const unsubscribe = onSnapshot(projectsCollectionRef(), (snapshot) => {
        const fetchedProjects = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                team: [], tasks: [], budgetItems: [], risks: [] // Initialize sub-collections
            } as Project;
        });
        setProjects(fetchedProjects);

        if (!selectedProjectId && fetchedProjects.length > 0) {
            setSelectedProjectId(fetchedProjects[0].id);
        } else if (selectedProjectId && !fetchedProjects.some(p => p.id === selectedProjectId)) {
            setSelectedProjectId(fetchedProjects.length > 0 ? fetchedProjects[0].id : null);
        }
    });
    return () => unsubscribe();
  }, []);

  // Fetch sub-collections for selected project
  useEffect(() => {
    if (!selectedProjectId) {
      setProjects(projs => projs.map(p => ({ ...p, team:[], tasks: [], budgetItems: [], risks: [] })));
      return;
    };

    const listeners = [
        { name: 'team', type: 'TeamMember' },
        { name: 'tasks', type: 'Task' },
        { name: 'budgetItems', type: 'BudgetItem' },
        { name: 'risks', type: 'Risk' }
    ].map(sub => {
        return onSnapshot(subCollectionRef(selectedProjectId, sub.name), (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProjects(currentProjects => currentProjects.map(p =>
                p.id === selectedProjectId ? { ...p, [sub.name]: items } : p
            ));
        });
    });

    return () => listeners.forEach(unsub => unsub());

  }, [selectedProjectId]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleOpenProjectModal = (project: Project | null = null) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };
  
  const handleCloseProjectModal = () => {
    setEditingProject(null);
    setIsProjectModalOpen(false);
  };

  const handleSubmitProject = async (projectData: { id?: string; name: string; goal: string; startDate: string; endDate: string; budget: number }) => {
      const { id, ...data } = projectData;
      const projectPayload = {
          name: data.name,
          goal: data.goal,
          duration: { start: data.startDate, end: data.endDate },
          budget: data.budget
      };
      try {
        if (id) { // Editing
          await updateDoc(projectDocRef(id), projectPayload);
        } else { // Adding
          const docRef = await addDoc(projectsCollectionRef(), projectPayload);
          setSelectedProjectId(docRef.id);
        }
      } catch (error) {
        console.error("Error saving project: ", error);
        alert("Failed to save project.");
      }
      handleCloseProjectModal();
  };
  
  const handleDeleteProject = async (projectId: string) => {
      if (window.confirm(t('deleteProjectConfirmation'))) {
          try {
              const subCollections = ['tasks', 'team', 'budgetItems', 'risks'];
              for (const sub of subCollections) {
                  const subColRef = subCollectionRef(projectId, sub);
                  const snapshot = await getDocs(subColRef);
                  const batch = writeBatch(db);
                  snapshot.docs.forEach(doc => batch.delete(doc.ref));
                  await batch.commit();
              }
              await deleteDoc(projectDocRef(projectId));
          } catch (error) {
              console.error("Error deleting project: ", error);
              alert("Failed to delete project.");
          }
      }
  };
  
  const handleSubCollectionUpdate = async <T extends {id?: string}>(
    action: 'add' | 'update' | 'delete',
    collectionName: string,
    itemData: T,
    itemId?: string
  ) => {
      if (!selectedProjectId) return;
      const collection = subCollectionRef(selectedProjectId, collectionName);
      try {
          if (action === 'add') {
              const { id, ...data } = itemData;
              await addDoc(collection, data);
          } else if (action === 'update' && itemData.id) {
              const { id, ...data } = itemData;
              await updateDoc(doc(collection, id), data);
          } else if (action === 'delete' && itemId) {
              await deleteDoc(doc(collection, itemId));
          }
      } catch (error) {
          console.error(`Error ${action}ing item in ${collectionName}: `, error);
          alert(`Failed to ${action} item.`);
      }
  };

  const renderPage = () => {
    if (!selectedProject) {
      return (
        <div className="text-center p-10">
          <h2 className="text-2xl font-semibold">{ projects.length > 0 ? t('noProjectSelected') : "No projects found." }</h2>
          <p className="text-gray-500 mt-2">{ projects.length > 0 ? t('selectOrCreateProject') : "Create a new project to get started." }</p>
        </div>
      );
    }
    switch (activePage) {
      case 'Dashboard':
        return <Dashboard project={selectedProject} onEditProject={() => handleOpenProjectModal(selectedProject)} />;
      case 'Team':
        return <Team project={selectedProject} onUpdate={(action, member, id) => handleSubCollectionUpdate(action, 'team', member, id)} />;
      case 'Tasks':
        return <Tasks project={selectedProject} onUpdate={(action, task, id) => handleSubCollectionUpdate(action, 'tasks', task, id)} />;
      case 'Timeline':
        return <Timeline project={selectedProject} />;
      case 'Budget':
        return <Budget project={selectedProject} onUpdate={(action, item, id) => handleSubCollectionUpdate(action, 'budgetItems', item, id)} />;
      case 'Risks':
        return <Risks project={selectedProject} onUpdate={(action, risk, id) => handleSubCollectionUpdate(action, 'risks', risk, id)} />;
      default:
        return <Dashboard project={selectedProject} onEditProject={() => handleOpenProjectModal(selectedProject)} />;
    }
  };

  return (
    <div className="relative flex h-screen bg-light dark:bg-dark text-gray-800 dark:text-gray-200 font-sans" dir={dir}>
      <Sidebar
        activePage={activePage}
        setActivePage={(page) => {
            setActivePage(page);
            setIsSidebarOpen(false);
        }}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={(id) => {
            setSelectedProjectId(id);
            setIsSidebarOpen(false);
        }}
        onNewProject={() => {
            handleOpenProjectModal(null);
            setIsSidebarOpen(false);
        }}
        onDeleteProject={handleDeleteProject}
        isSidebarOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
            title={activePage} 
            user={user}
            onMenuClick={() => setIsSidebarOpen(true)} 
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-light dark:bg-dark p-4 sm:p-6">
          {renderPage()}
        </main>
      </div>
      {isProjectModalOpen && (
        <NewProjectModal
          onClose={handleCloseProjectModal}
          onSubmit={handleSubmitProject}
          projectToEdit={editingProject}
        />
      )}
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
