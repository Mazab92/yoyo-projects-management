import React, { useState } from 'react';
import { Project, Risk, RiskSeverity } from '../types';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { useLocalization } from '../hooks/useLocalization';
import RiskModal from '../components/RiskModal';

interface RisksProps {
  project: Project;
  onUpdate: (action: 'add' | 'update' | 'delete', risk: Partial<Risk>, riskId?: string) => void;
}

const SeverityBadge: React.FC<{ severity: RiskSeverity }> = ({ severity }) => {
  const baseClasses = "px-3 py-1 text-xs font-semibold rounded-full capitalize";
  const severityClasses = {
    [RiskSeverity.Low]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    [RiskSeverity.Medium]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    [RiskSeverity.High]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return <span className={`${baseClasses} ${severityClasses[severity]}`}>{severity}</span>;
};

const Risks: React.FC<RisksProps> = ({ project, onUpdate }) => {
  const { t } = useLocalization();
  const { risks } = project;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null);

  const handleOpenModal = (risk: Risk | null = null) => {
    setEditingRisk(risk);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingRisk(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (riskData: Omit<Risk, 'id'> & { id?: string }) => {
    if (riskData.id) {
      onUpdate('update', riskData);
    } else {
      onUpdate('add', riskData);
    }
    handleCloseModal();
  };
  
  const handleDelete = (riskId: string) => {
    if (window.confirm(t('deleteRiskConfirmation'))) {
        onUpdate('delete', {}, riskId);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-dark-secondary p-4 sm:p-6 rounded-xl shadow-md">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-dark dark:text-light">{t('riskManagement')}</h2>
          <button onClick={() => handleOpenModal()} className="flex items-center justify-center bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors">
            <PlusCircle size={18} className="me-2" />
            {t('addRisk')}
          </button>
        </div>
        
        {/* Desktop Table View */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3 w-2/5">{t('riskDescription')}</th>
                <th scope="col" className="px-6 py-3">{t('severity')}</th>
                <th scope="col" className="px-6 py-3 w-2/5">{t('mitigationSolution')}</th>
                <th scope="col" className="px-6 py-3">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {risks.length > 0 ? risks.map(risk => (
                <tr key={risk.id} className="bg-white dark:bg-dark-secondary border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4">{risk.description}</td>
                  <td className="px-6 py-4"><SeverityBadge severity={risk.severity} /></td>
                  <td className="px-6 py-4">{risk.solution}</td>
                  <td className="px-6 py-4">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <button onClick={() => handleOpenModal(risk)} className="text-blue-500 hover:text-blue-700" title={t('editRisk')}><Pencil size={18}/></button>
                          <button onClick={() => handleDelete(risk.id)} className="text-red-500 hover:text-red-700" title={t('deleteTask')}><Trash2 size={18}/></button>
                      </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500 dark:text-gray-400">
                    {t('noRisks')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-4">
            {risks.length > 0 ? risks.map(risk => (
                 <div key={risk.id} className="bg-gray-50 dark:bg-dark p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-3">
                        <p className="font-medium text-gray-900 dark:text-white pr-4">{risk.description}</p>
                        <SeverityBadge severity={risk.severity} />
                    </div>
                    <div className="text-sm py-3 border-y border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('mitigationSolution')}</p>
                        <p className="mt-1 text-gray-800 dark:text-gray-200">{risk.solution}</p>
                    </div>
                    <div className="flex justify-end items-center mt-3 space-x-3 rtl:space-x-reverse">
                        <button onClick={() => handleOpenModal(risk)} className="text-blue-500 hover:text-blue-700" title={t('editRisk')}><Pencil size={18}/></button>
                        <button onClick={() => handleDelete(risk.id)} className="text-red-500 hover:text-red-700" title={t('deleteTask')}><Trash2 size={18}/></button>
                    </div>
                </div>
            )) : (
                 <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                    {t('noRisks')}
                  </div>
            )}
        </div>
      </div>
      {isModalOpen && (
        <RiskModal
          riskToEdit={editingRisk}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
};

export default Risks;
