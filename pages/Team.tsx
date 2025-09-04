import React, { useState } from 'react';
import { TeamMember } from '../types';
import { getInitials } from '../utils/helpers';
import TeamMemberModal from '../components/TeamMemberModal';
import { Plus } from 'lucide-react';

interface TeamProps {
  team: TeamMember[];
  onUpdate: (collection: 'team', action: 'add' | 'update' | 'delete', data: any) => void;
}

const Team: React.FC<TeamProps> = ({ team, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null);

    const handleEdit = (member: TeamMember) => {
        setMemberToEdit(member);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setMemberToEdit(null);
        setIsModalOpen(true);
    };

    const handleDelete = (member: TeamMember) => {
        if (window.confirm(`Are you sure you want to delete ${member.name}?`)) {
            onUpdate('team', 'delete', member);
        }
    };
    
    const handleSubmit = (memberData: Omit<TeamMember, 'id'> | TeamMember) => {
        if ('id' in memberData) {
            onUpdate('team', 'update', memberData);
        } else {
            onUpdate('team', 'add', memberData);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-dark dark:text-light">Team</h1>
                <button onClick={handleAdd} className="flex items-center px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-dark">
                    <Plus size={20} className="mr-2" /> Add Member
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {team.map(member => (
                    <div key={member.id} className="p-6 text-center bg-white rounded-lg shadow-md dark:bg-dark-secondary">
                        {member.avatar ? (
                            <img src={member.avatar} alt={member.name} className="object-cover w-24 h-24 mx-auto mb-4 rounded-full" />
                        ) : (
                            <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 text-3xl font-bold text-white bg-indigo-500 rounded-full">
                                {getInitials(member.name)}
                            </div>
                        )}
                        <h3 className="text-lg font-semibold text-dark dark:text-light">{member.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                        <p className="mt-2 text-sm text-primary">{member.email}</p>
                        <div className="flex justify-center mt-4 space-x-2">
                             <button onClick={() => handleEdit(member)} className="px-3 py-1 text-sm text-white bg-yellow-500 rounded-md hover:bg-yellow-600">Edit</button>
                             <button onClick={() => handleDelete(member)} className="px-3 py-1 text-sm text-white bg-red-500 rounded-md hover:bg-red-600">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
            
            {isModalOpen && (
                <TeamMemberModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmit}
                    memberToEdit={memberToEdit}
                />
            )}
        </div>
    );
};

export default Team;
