import React, { useState } from 'react';
import Modal from './Modal';
import { useProjectContext } from '../hooks/useProjectContext';
import { auth } from '../lib/firebase';
import { useToast } from '../hooks/useToast';
import BouncingLoader from './BouncingLoader';
import { logActivity } from '../lib/activityLog';

interface DesignUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    t: (key: string) => string;
}

const DesignUploadModal: React.FC<DesignUploadModalProps> = ({ isOpen, onClose, t }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { currentProject } = useProjectContext();
    const { addToast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !currentProject || !currentProject.googleDriveFolderId) {
            addToast(t('uploadError'), 'error');
            return;
        }

        const user = auth.currentUser;
        if (!user) {
             addToast('You must be logged in to upload files.', 'error');
            return;
        }

        setIsLoading(true);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('projectId', currentProject.id);
        formData.append('googleDriveFolderId', currentProject.googleDriveFolderId);
        formData.append('userId', user.uid);

        try {
            // This URL should be stored in environment variables. Using import.meta.env as per existing firebase.ts pattern.
            const uploadFunctionUrl = (import.meta as any).env.VITE_UPLOAD_FUNCTION_URL;
            if (!uploadFunctionUrl) {
                console.error("VITE_UPLOAD_FUNCTION_URL is not configured.");
                throw new Error("Upload service is not configured.");
            }

            const response = await fetch(uploadFunctionUrl, {
                method: 'POST',
                body: formData,
                // No 'Content-Type' header needed; the browser sets it correctly for FormData.
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Upload failed with no specific message.' }));
                throw new Error(errorData.error || 'Upload failed');
            }

            await logActivity(`Uploaded design file: ${file.name}`, { projectId: currentProject.id });
            addToast(t('uploadSuccess'), 'success');
            handleClose();
        } catch (error) {
            console.error("Error uploading file:", error);
            addToast((error as Error).message || t('uploadError'), 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setIsLoading(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={t('uploadDesign')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="design-file-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('selectFile')}</label>
                    <input
                        id="design-file-upload"
                        type="file"
                        onChange={handleFileChange}
                        required
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary dark:file:bg-primary/20 dark:file:text-white hover:file:bg-primary/20 dark:hover:file:bg-primary/30 cursor-pointer"
                    />
                </div>
                {file && <p className="text-sm mt-2 text-gray-500 dark:text-gray-400">Selected: {file.name}</p>}

                <div className="flex justify-end pt-4 space-x-3">
                    <button type="button" onClick={handleClose} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 disabled:opacity-50">
                        {t('cancel')}
                    </button>
                    <button type="submit" disabled={!file || isLoading} className="px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark h-10 w-28 flex justify-center items-center disabled:opacity-50">
                        {isLoading ? <BouncingLoader /> : t('uploadFile')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default DesignUploadModal;