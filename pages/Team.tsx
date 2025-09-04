import React from 'react';
import { Project } from '../types';
import { UserPlus, Mail, Briefcase } from 'lucide-react';
import { useLocalization } from '../hooks/useLocalization';

interface TeamProps {
  project: Project;
}

const Team: React.FC<TeamProps> = ({ project }) => {
  const { t } = useLocalization();
  const { team, tasks } = project;

  const getTaskCountForMember = (memberId: number) => {
    return tasks.filter(task => task.assignedTo === memberId).length;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-dark dark:text-light">{t('teamMembers')}</h2>
        <button className="flex items-center bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors">
          <UserPlus size={18} className="me-2" />
          {t('addMember')}
        </button>
      </div>
      {team.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {team.map(member => (
            <div key={member.id} className="bg-white dark:bg-dark-secondary rounded-xl shadow-md p-6 text-center transform hover:-translate-y-1 transition-transform">
              <img 
                src={member.avatarUrl} 
                alt={member.name}
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-primary/50"
              />
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
  );
};

export default Team;
