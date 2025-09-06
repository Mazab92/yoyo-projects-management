import { Priority, Locale } from '../types';

export const formatDate = (dateString: string, locale: Locale): string => {
  if (!dateString) return '';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', options);
};

export const formatDateTime = (timestamp: any, locale: Locale): string => {
  if (!timestamp?.toDate) return '';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return timestamp.toDate().toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US', options);
};

export const getStatusColor = (status: string): string => {
  switch(status){case 'To Do':return 'bg-gray-400'; case 'In Progress':return 'bg-blue-500'; case 'Done':return 'bg-emerald-500'; default:return 'bg-gray-400';}
};

export const getPriorityStyles = (priority: Priority): { color: string, text: string } => {
    switch (priority) {
        case 'Urgent': return { color: 'bg-red-500', text: 'text-red-800 dark:text-red-200' };
        case 'High': return { color: 'bg-yellow-500', text: 'text-yellow-800 dark:text-yellow-200' };
        case 'Medium': return { color: 'bg-blue-500', text: 'text-blue-800 dark:text-blue-200' };
        case 'Low': return { color: 'bg-gray-400', text: 'text-gray-800 dark:text-gray-200' };
        default: return { color: 'bg-gray-400', text: 'text-gray-800 dark:text-gray-200' };
    }
};

export const getPriorityTagColor = (priority: Priority): string => {
    switch (priority) {
        case 'Urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        case 'High': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        case 'Medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case 'Low': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
};


export const formatCurrencyEGP = (amount: number, locale: Locale): string => new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {style:'currency', currency:'EGP', minimumFractionDigits:0}).format(amount).replace('EGP', 'E£');
