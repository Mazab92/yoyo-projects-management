import React, { useState } from 'react';
import { Project, TeamMember } from '../types';
import { UserPlus, Mail, Briefcase, Pencil, Trash2 } from 'lucide-react';
import { useLocalization } from '../hooks/useLocalization';
import TeamMemberModal from '../components/TeamMemberModal';

interface TeamProps {
  project: Project;
  onUpdate: (action: 'add' | 'update' | 'delete', member: Partial<TeamMember>, memberId?: string) => void;
}

const Team: React.FC<TeamProps> = ({ project, onUpdate }) => {
  const { t } = useLocalization();
  const { team, tasks } = project;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const getTaskCountForMember = (memberId: string) => {
    return tasks.filter(task => task.assignedTo === memberId).length;
  };

  const handleOpenModal = (member: TeamMember | null = null) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setEditingMember(null);
    setIsModalOpen(false);
  };

  const handleSubmitMember = (memberData: Omit<TeamMember, 'id'> & { id?: string }) => {
    if (memberData.id) {
        onUpdate('update', memberData);
    } else {
        onUpdate('add', memberData);
    }
    handleCloseModal();
  };
  
  const handleDeleteMember = (memberId: string) => {
    if (window.confirm("Are you sure you want to remove this team member?")) {
        onUpdate('delete', {}, memberId);
    }
  };

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-dark dark:text-light">{t('teamMembers')}</h2>
          <button onClick={() => handleOpenModal()} className="flex items-center bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors">
            <UserPlus size={18} className="me-2" />
            {t('addMember')}
          </button>
        </div>
        {team.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {team.map(member => (
              <div key={member.id} className="bg-white dark:bg-dark-secondary rounded-xl shadow-md p-6 text-center transform hover:-translate-y-1 transition-transform relative group">
                <img 
                  src={member.avatarUrl} 
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-primary/50"
                />
                <div className="absolute top-4 end-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(member)} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"><Pencil size={14} /></button>
                    <button onClick={() => handleDeleteMember(member.id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"><Trash2 size={14} /></button>
                </div>
                <h3 className="text-lg font-bold text-dark dark:text-light">{member.name}</h3>
                <p className="text-primary font-medium">{member.role}</p>
                <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center justify-center">
                    <Mail size={14} className="me-2" />
                    <span>{member.email}</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Briefcase size={14} className="me-2" />
                    <span>{getTaskCountForMember(member.id)} {t('tasksAssigned')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white dark:bg-dark-secondary p-10 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold">{t('noTeamMembers')}</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">{t('addMembersToProject')}</p>
          </div>
        )}
      </div>
      {isModalOpen && (
          <TeamMemberModal 
            onClose={handleCloseModal}
            onSubmit={handleSubmitMember}
            memberToEdit={editingMember}
          />
      )}
    </>
  );
};

export default Team;
