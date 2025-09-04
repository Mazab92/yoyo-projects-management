import React, { useState } from 'react';
import { BudgetItem } from '../types';
import BudgetModal from '../components/BudgetModal';
import { Plus, TrendingUp, TrendingDown, Landmark } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BudgetProps {
  budget: BudgetItem[];
  onUpdate: (collection: 'budget', action: 'add' | 'update' | 'delete', data: any) => void;
  onDelete: (item: BudgetItem) => void;
}

const Budget: React.FC<BudgetProps> = ({ budget, onUpdate, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState<BudgetItem | null>(null);

    const handleEdit = (item: BudgetItem) => {
        setItemToEdit(item);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setItemToEdit(null);
        setIsModalOpen(true);
    };
    
    const handleSubmit = (itemData: Omit<BudgetItem, 'id'> | BudgetItem) => {
        if ('id' in itemData) {
            onUpdate('budget', 'update', itemData);
        } else {
            onUpdate('budget', 'add', itemData);
        }
        setIsModalOpen(false);
    };

    const totalExpected = budget.reduce((sum, item) => sum + item.expectedCost, 0);
    const totalActual = budget.reduce((sum, item) => sum + item.actualCost, 0);
    const difference = totalExpected - totalActual;

    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <Landmark size={48} className="mb-4" />
            <h2 className="text-2xl font-semibold">No Budget Items Yet</h2>
            <p className="mt-2">Add your first expense or income item to start tracking.</p>
            <button onClick={handleAdd} className="flex items-center mt-4 px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-dark">
                <Plus size={20} className="mr-2" /> Add Item
            </button>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <h1 className="text-3xl font-bold text-dark dark:text-light">Budget</h1>
                <button onClick={handleAdd} className="flex items-center px-4 py-2 text-white rounded-md bg-primary hover:bg-primary-dark">
                    <Plus size={20} className="mr-2" /> Add Item
                </button>
            </div>

            {budget.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="p-6 bg-white rounded-lg shadow-md dark:bg-dark-secondary">
                            <h3 className="text-sm font-medium text-gray-500">Total Expected Cost</h3>
                            <p className="text-2xl font-bold">${totalExpected.toLocaleString()}</p>
                        </div>
                        <div className="p-6 bg-white rounded-lg shadow-md dark:bg-dark-secondary">
                            <h3 className="text-sm font-medium text-gray-500">Total Actual Cost</h3>
                            <p className="text-2xl font-bold">${totalActual.toLocaleString()}</p>
                        </div>
                        <div className={`p-6 bg-white rounded-lg shadow-md dark:bg-dark-secondary`}>
                            <h3 className="text-sm font-medium text-gray-500">Difference</h3>
                            <p className={`text-2xl font-bold flex items-center ${difference >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {difference >= 0 ? <TrendingUp size={20} className="mr-2" /> : <TrendingDown size={20} className="mr-2" />}
                            ${Math.abs(difference).toLocaleString()}
                            </p>
                            <span className="text-xs text-gray-400">{difference >= 0 ? 'Under Budget' : 'Over Budget'}</span>
                        </div>
                    </div>

                    <div className="p-6 bg-white rounded-lg shadow-md dark:bg-dark-secondary">
                        <h2 className="mb-4 text-lg font-semibold text-dark dark:text-light">Cost Breakdown</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={budget} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="expectedCost" fill="#8884d8" name="Expected Cost" />
                                <Bar dataKey="actualCost" fill="#82ca9d" name="Actual Cost" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="p-4 bg-white rounded-lg shadow-md dark:bg-dark-secondary">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Item</th>
                                        <th scope="col" className="px-6 py-3">Expected Cost</th>
                                        <th scope="col" className="px-6 py-3">Actual Cost</th>
                                        <th scope="col" className="px-6 py-3">Difference</th>
                                        <th scope="col" className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {budget.map(item => (
                                        <tr key={item.id} className="bg-white border-b dark:bg-dark-secondary dark:border-gray-700">
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.name}</th>
                                            <td className="px-6 py-4">${item.expectedCost.toLocaleString()}</td>
                                            <td className="px-6 py-4">${item.actualCost.toLocaleString()}</td>
                                            <td className={`px-6 py-4 font-medium ${item.expectedCost >= item.actualCost ? 'text-green-500' : 'text-red-500'}`}>
                                            ${(item.expectedCost - item.actualCost).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex space-x-2">
                                                    <button onClick={() => handleEdit(item)} className="text-yellow-500 hover:text-yellow-700">Edit</button>
                                                    <button onClick={() => onDelete(item)} className="text-red-500 hover:text-red-700">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <EmptyState />
            )}
            
            {isModalOpen && (
                <BudgetModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmit}
                    itemToEdit={itemToEdit}
                />
            )}
        </div>
    );
};

export default Budget;
