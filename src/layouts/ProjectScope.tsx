import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { useProjectContext } from '../hooks/useProjectContext';
import EmptyState from '../components/EmptyState';
import BouncingLoader from '../components/BouncingLoader';

const ProjectScope: React.FC<{t: (key: string) => string}> = ({ t }) => {
    const location = useLocation();
    const isProfilePage = location.pathname === '/profile';

    if (isProfilePage) {
        return <Outlet />;
    }

    const { currentProject } = useProjectContext();

    if (!currentProject) {
        return (
            <div className="flex items-center justify-center h-full">
                <EmptyState title={t('noProjectSelected')} message={t('noProjectMessage')} />
            </div>
        );
    }
    return <Outlet />;
};

export default ProjectScope;
