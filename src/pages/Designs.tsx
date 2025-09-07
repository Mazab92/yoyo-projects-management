import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useProjectContext } from '../hooks/useProjectContext';
import { DesignFile, Locale } from '../types';
import EmptyState from '../components/EmptyState';
import BouncingLoader from '../components/BouncingLoader';
import DesignUploadModal from '../components/DesignUploadModal';
import { Plus, Download, File as FileIcon } from 'lucide-react';
import { formatDateTime } from '../lib/helpers';

interface DesignsPageProps {
    t: (key: string, params?: Record<string, string>) => string;
    locale: Locale;
}

const DesignsPage: React.FC<DesignsPageProps> = ({ t, locale }) => {
    const { currentProject } = useProjectContext();
    const [files, setFiles] = useState<DesignFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        if (!currentProject) {
            setLoading(false);
            setFiles([]);
            return;
        }

        setLoading(true);
        const q = query(
            collection(db, 'files'), 
            where('projectId', '==', currentProject.id),
            orderBy('createdAt', 'desc')
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DesignFile));
            setFiles(data);
            setLoading(false);
        }, () => setLoading(false));

        return () => unsubscribe();
    }, [currentProject]);

    if (!currentProject) return null;
    
    const canUpload = !!currentProject.googleDriveFolderId;

    return (
        <div className="p-6 md:p-8">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {t('designsFor', { projectName: currentProject.name })}
                </h1>
                <button
                    onClick={() => setModalOpen(true)}
                    disabled={!canUpload}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-sm hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!canUpload ? t('designFolderMissing') : t('uploadDesign')}
                >
                    <Plus size={16} className="mr-2" /> {t('uploadDesign')}
                </button>
            </div>

            {loading ? <BouncingLoader /> : files.length === 0 ? (
                <EmptyState title={t('noDesigns')} message={t('noDesignsMessage')} />
            ) : (
                <div className="bg-white dark:bg-dark-secondary rounded-lg shadow overflow-hidden">
                    <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                       {files.map(file => (
                           <li key={file.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50">
                               <div className="flex items-center min-w-0">
                                   <FileIcon className="w-6 h-6 text-gray-400 mr-4 flex-shrink-0" />
                                   <div className="min-w-0">
                                       <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.name}</p>
                                       <p className="text-sm text-gray-500 dark:text-gray-400">
                                           {t('uploadedBy', { name: file.uploadedByName })} - {formatDateTime(file.createdAt, locale)}
                                       </p>
                                   </div>
                               </div>
                               <a href={file.downloadUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label={`Download ${file.name}`}>
                                   <Download size={18} />
                               </a>
                           </li>
                       ))}
                    </ul>
                </div>
            )}
            
            {canUpload && (
                <DesignUploadModal
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    t={t}
                />
            )}
        </div>
    );
};

export default DesignsPage;
