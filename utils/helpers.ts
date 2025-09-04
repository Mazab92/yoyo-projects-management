export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'To Do':
      return 'bg-gray-500';
    case 'In Progress':
      return 'bg-blue-500';
    case 'Done':
      return 'bg-green-500';
    case 'Archived':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};
