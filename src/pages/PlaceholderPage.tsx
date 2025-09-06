import React from 'react';
import EmptyState from '../components/EmptyState';

const PlaceholderPage: React.FC<{ title: string; }> = ({ title }) => (
    <div className="p-6 md:p-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h1>
        <div className="mt-8">
            <EmptyState title={`${title} Page`} message="Content for this page is under construction." />
        </div>
    </div>
);

export default PlaceholderPage;
