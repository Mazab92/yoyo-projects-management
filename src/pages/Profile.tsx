import React, { useState, useEffect } from 'react';
// Fix: Separated Firebase 'User' type import from function imports.
// FIX: Use User type from firebase/compat/auth
// import type { User as FirebaseUser } from 'firebase/compat/auth';
// FIX: The User type is not a named export from 'firebase/compat/auth'. It must be accessed via the firebase namespace.
import firebase from 'firebase/compat/app';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task, Project } from '../types';
import BouncingLoader from '../components/BouncingLoader';
import EmptyState from '../components/EmptyState';
import { formatDateTime } from '../lib/helpers';

interface ProfilePageProps {
    // FIX: Use firebase.User type from the firebase namespace.
    user: firebase.User;
    t: (key: string) => string;
    locale: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, t, locale }) => {
    const [myTasks, setMyTasks] = useState<Task[]>([]);
    const [myProjects, setMyProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const tasksQuery = query(collection(db, 'tasks'), where('assignedTo', '==', user.uid));
        const projectsQuery = query(collection(db, 'projects'), where('team', 'array-contains', user.uid));
        
        const unsubTasks = onSnapshot(tasksQuery, snap => {
            setMyTasks(snap.docs.map(d => ({id: d.id, ...d.data()}) as Task));
        });
        
        const unsubProjects = onSnapshot(projectsQuery, snap => {
            setMyProjects(snap.docs.map(d => ({id: d.id, ...d.data()}) as Project));
            setLoading(false);
        });

        return () => {
            unsubTasks();
            unsubProjects();
        };

    }, [user.uid]);

    return (
        <div className="p-6 md:p-8">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                {t('profileTitle')}
            </h1>
            {loading ? <BouncingLoader /> : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-dark-secondary p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4">{t('myTasks')}</h2>
                        {myTasks.length > 0 ? (
                             <ul className="space-y-3">
                                {myTasks.map(task => (
                                    <li key={task.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                                        <p className="font-medium">{task.title}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Due: {formatDateTime(task.dueDate, locale as 'en'|'ar')}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : <EmptyState title={t('noAssignedTasks')} message="" />}
                    </div>
                     <div className="bg-white dark:bg-dark-secondary p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4">{t('myProjects')}</h2>
                         <ul className="space-y-3">
                            {myProjects.map(project => (
                                <li key={project.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                                    <p className="font-medium">{project.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;