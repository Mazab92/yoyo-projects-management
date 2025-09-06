import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ActivityLog } from '../types';
import BouncingLoader from '../components/BouncingLoader';
import { formatDateTime } from '../lib/helpers';

const SettingsPage: React.FC<{ t: (key: string) => string; locale: string }> = ({ t, locale }) => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const q = query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog));
            setLogs(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="p-6 md:p-8">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                {t('settingsTitle')}
            </h1>

            <div className="bg-white dark:bg-dark-secondary rounded-lg shadow overflow-x-auto">
                {loading ? <div className="h-64 flex items-center justify-center"><BouncingLoader /></div> : (
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('action')}</th>
                                <th scope="col" className="px-6 py-3">{t('user')}</th>
                                <th scope="col" className="px-6 py-3">{t('project')}</th>
                                <th scope="col" className="px-6 py-3">{t('timestamp')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.id} className="bg-white border-b dark:bg-dark-secondary dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{log.action}</td>
                                    <td className="px-6 py-4">{log.userName || log.userEmail}</td>
                                    <td className="px-6 py-4">{log.projectName || 'N/A'}</td>
                                    <td className="px-6 py-4">{formatDateTime(log.timestamp, locale as 'en'|'ar')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                 {logs.length === 0 && !loading && <div className="p-8 text-center">{t('noActivity')}</div>}
            </div>
        </div>
    );
};

export default SettingsPage;
