import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, getCountFromServer } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useProjectContext } from '../hooks/useProjectContext';
import Card from '../components/Card';
import { CheckSquare, Users, AlertTriangle, DollarSign } from 'lucide-react';
import { BudgetItem, Risk, Task } from '../types';
import BouncingLoader from '../components/BouncingLoader';

// Fix: Updated t function prop type to allow for a parameters object.
const Dashboard: React.FC<{ t: (key: string, params?: Record<string, string>) => string }> = ({ t }) => {
    const { currentProject } = useProjectContext();
    const [stats, setStats] = useState({ tasks: 0, team: 0, risks: 0, budget: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentProject) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const projectId = currentProject.id;

        const unsubscribes = [
            onSnapshot(query(collection(db, 'tasks'), where('projectId', '==', projectId)), snap => 
                setStats(s => ({ ...s, tasks: snap.size }))
            ),
            onSnapshot(query(collection(db, 'risks'), where('projectId', '==', projectId)), snap => 
                setStats(s => ({ ...s, risks: snap.size }))
            ),
            onSnapshot(query(collection(db, 'budget'), where('projectId', '==', projectId)), snap => {
                const totalSpent = snap.docs
                    .map(doc => (doc.data() as BudgetItem).actual)
                    .reduce((sum, spent) => sum + spent, 0);
                setStats(s => ({ ...s, budget: totalSpent }));
            })
        ];

        setStats(s => ({...s, team: currentProject.team.length}));
        
        // A small delay to allow all snapshots to fire at least once
        setTimeout(() => setLoading(false), 500);

        return () => unsubscribes.forEach(unsub => unsub());
    }, [currentProject]);

    if (!currentProject) {
      return null; // The ProjectScope layout handles the empty state
    }
    
    if (loading) {
        return <div className="flex justify-center items-center h-64"><BouncingLoader /></div>;
    }

    return (
        <div className="p-6 md:p-8">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                {t('dashboardTitle', { projectName: currentProject.name })}
            </h1>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Link to="/tasks"><Card title={t('totalTasks')} value={stats.tasks.toString()} icon={<CheckSquare />} color="#3B82F6" /></Link>
                <Link to="/team"><Card title={t('teamMembers')} value={stats.team.toString()} icon={<Users />} color="#10B981" /></Link>
                <Link to="/risks"><Card title={t('openRisks')} value={stats.risks.toString()} icon={<AlertTriangle />} color="#F59E0B" /></Link>
                <Link to="/budget"><Card title={t('budgetSpent')} value={`E£ ${stats.budget.toLocaleString()}`} icon={<DollarSign />} color="#EF4444" /></Link>
            </div>
            {/* Additional charts and summaries can be added here */}
        </div>
    );
};

export default Dashboard;
