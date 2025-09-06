import React from 'react';
import { useProjectContext } from '../hooks/useProjectContext';
import EmptyState from '../components/EmptyState';

// Fix: Updated t function prop type to allow for a parameters object.
const ReportsPage: React.FC<{ t: (key: string, params?: Record<string, string>) => string; locale: string }> = ({ t, locale }) => {
    const { currentProject } = useProjectContext();

    if (!currentProject) return null;

    return (
        <div className="p-6 md:p-8">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                {t('reportsTitle', { projectName: currentProject.name })}
            </h1>
            
            <div className="bg-white dark:bg-dark-secondary p-6 rounded-lg shadow">
                 <h2 className="text-lg font-semibold mb-4">{t('projectSummary')}</h2>
                 <EmptyState title="Reporting Under Construction" message="Advanced charts and export functionality will be available soon." />
                 <div className="flex space-x-4 mt-6">
                    <button className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg" disabled>{t('exportToCsv')}</button>
                    <button className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-lg" disabled>{t('exportToPdf')}</button>
                 </div>
            </div>
        </div>
    );
};

export default ReportsPage;
