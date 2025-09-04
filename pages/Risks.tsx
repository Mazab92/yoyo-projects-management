import React, { useState } from 'react';
import { Risk } from '../types';
import RiskModal from '../components/RiskModal';
import { Plus, ShieldAlert } from 'lucide-react';

interface RisksProps {
  risks: Risk[];
  onUpdate: (collection: 'risks', action: 'add' | 'update' | 'delete', data: any) => void;
  onDelete: (item: Risk) => void;
}

const Risks: React.FC<RisksProps> = ({ risks, onUpdate, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [riskToEdit, setRiskToEdit] = useState<Risk | null>(null);

    const handleEdit = (risk: Risk) => {
        setRiskToEdit(risk);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setRiskToEdit(null);
        setIsModalOpen(true);
    };
    
    const handleSubmit = (riskData: Omit<Risk, 'id'> | Risk) => {
        if ('id' in riskData) {
            onUpdate('risks', 'update', riskData);
        } else {
            onUpdate('risks', 'add', riskData);
        }
        setIsModalOpen(false);
    };

    const getSeverityClass = (severity: Risk['severity']) => {
        switch (severity) {
            case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    }

    const EmptyState = () => (
         <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <ShieldAlert size={48} className="mb-4" />
            <h2 className="text-2xl font-semibold">No Risks Identified</h2>
            <p className="mt-2">It's a good time to identify and add potential project risks.</p>
            <button onClick={handleAdd} className="flex items-center mt-4 px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-dark">
                <Plus size={20} className="mr-2" /> Add Risk
            </button>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <h1 className="text-3xl font-bold text-dark dark:text-light">Risks</h1>
                <button onClick={handleAdd} className="flex items-center px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-dark">
                    <Plus size={20} className="mr-2" /> Add Risk
                </button>
            </div>

            {risks.length > 0 ? (
                <div className="p-4 bg-white rounded-lg shadow-md dark:bg-dark-secondary">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Description</th>
                                    <th scope="col" className="px-6 py-3">Severity</th>
                                    <th scope="col" className="px-6 py-3">Solution</th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {risks.map(risk => (
                                    <tr key={risk.id} className="bg-white border-b dark:bg-dark-secondary dark:border-gray-700">
                                        <td className="px-6 py-4">{risk.description}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityClass(risk.severity)}`}>
                                                {risk.severity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{risk.solution}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex space-x-2">
                                                <button onClick={() => handleEdit(risk)} className="text-yellow-500 hover:text-yellow-700">Edit</button>
                                                <button onClick={() => onDelete(risk)} className="text-red-500 hover:text-red-700">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <EmptyState />
            )}
            
            {isModalOpen && (
                <RiskModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmit}
                    riskToEdit={riskToEdit}
                />
            )}
        </div>
    );
};

export default Risks;
