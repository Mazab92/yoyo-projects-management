import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, arrayUnion, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useProjectContext } from '../hooks/useProjectContext';
import { User } from '../types';
import { useToast } from '../hooks/useToast';
import { logActivity } from '../lib/activityLog';

import EmptyState from '../components/EmptyState';
import BouncingLoader from '../components/BouncingLoader';
import TeamMemberModal from '../components/TeamMemberModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { Plus, Trash2 } from 'lucide-react';

// Fix: Updated t function prop type to allow for a parameters object.
const TeamPage: React.FC<{ t: (key: string, params?: Record<string, string>) => string }> = ({ t }) => {
    const { currentProject } = useProjectContext();
    const { addToast } = useToast();
    const [team, setTeam] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState<User | null>(null);

    useEffect(() => {
        if (!currentProject || currentProject.team.length === 0) {
            setTeam([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const teamIds = currentProject.team;
        const q = query(collection(db, 'users'), where('__name__', 'in', teamIds));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const teamData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
            setTeam(teamData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentProject]);

    const handleAddMember = async (email: string) => {
        if (!currentProject) return;

        try {
            const q = query(collection(db, 'users'), where('email', '==', email));
            const userSnapshot = await getDocs(q);

            if (userSnapshot.empty) {
                addToast(t('userNotFound'), 'error');
                return;
            }

            const userToAddDoc = userSnapshot.docs[0];
            const userIdToAdd = userToAddDoc.id;

            if (currentProject.team.includes(userIdToAdd)) {
                addToast(t('teamMemberExists'), 'info');
                return;
            }

            const batch = writeBatch(db);
            const projectRef = doc(db, 'projects', currentProject.id);
            batch.update(projectRef, { team: arrayUnion(userIdToAdd) });

            const userRef = doc(db, 'users', userIdToAdd);
            batch.update(userRef, { projects: arrayUnion(currentProject.id) });

            await batch.commit();

            logActivity(`Added team member ${email}`, { projectId: currentProject.id, addedUserId: userIdToAdd });
            addToast(t('teamMemberAdded'), 'success');
            setModalOpen(false);

        } catch (error) {
            console.error("Error adding team member:", error);
            addToast(t('addMemberError'), 'error');
        }
    };
    
    const handleDeleteRequest = (member: User) => {
        if (member.id === currentProject?.createdBy) {
            addToast("Cannot remove the project owner.", "error");
            return;
        }
        setMemberToDelete(member);
        setDeleteModalOpen(true);
    }
    
    const confirmDelete = async () => {
        if (!memberToDelete || !currentProject) return;
        
        const newTeam = currentProject.team.filter(id => id !== memberToDelete.id);
        
        try {
            await updateDoc(doc(db, 'projects', currentProject.id), { team: newTeam });
            logActivity(`Removed team member ${memberToDelete.email}`, { projectId: currentProject.id, removedUserId: memberToDelete.id });
            addToast("Team member removed.", "success");
            setDeleteModalOpen(false);
            setMemberToDelete(null);
        } catch(e) {
            addToast("Failed to remove member.", "error");
            console.error(e);
        }
    }

    if (!currentProject) return null;

    return (
        <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {t('teamTitle', { projectName: currentProject.name })}
                </h1>
                <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-sm hover:bg-primary-dark"
                >
                    <Plus size={16} className="mr-2" /> {t('addTeamMember')}
                </button>
            </div>

            {loading ? <BouncingLoader /> : team.length === 0 ? (
                <EmptyState title={t('noTeam')} message={t('noTeamMessage')} />
            ) : (
                <div className="bg-white dark:bg-dark-secondary rounded-lg shadow overflow-hidden">
                    <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                        {team.map((member) => (
                            <li key={member.id} className="px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 flex items-center justify-center font-bold text-white bg-gradient-to-br from-primary to-emerald-500 rounded-full">
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-4">
                                        {member.id === currentProject.createdBy ? "Owner" : "Member"}
                                    </span>
                                    {member.id !== currentProject.createdBy && (
                                        <button onClick={() => handleDeleteRequest(member)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            <TeamMemberModal 
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onAddMember={handleAddMember}
                t={t}
            />
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={t('deleteItemTitle')}
                message={t('deleteItemMessage')}
                t={t}
            />
        </div>
    );
};

export default TeamPage;
