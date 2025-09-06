import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useProjectContext } from '../hooks/useProjectContext';
import { Task } from '../types';
import TaskModal from '../components/TaskModal'; // Assuming we want to view tasks

const localizer = momentLocalizer(moment);

// Fix: Updated t function prop type to allow for a parameters object.
const CalendarPage: React.FC<{ t: (key: string, params?: Record<string, string>) => string; locale: string }> = ({ t, locale }) => {
    const { currentProject } = useProjectContext();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isModalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        if (!currentProject) return;
        const q = query(collection(db, 'tasks'), where('projectId', '==', currentProject.id));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
            setTasks(tasksData);
        });
        return () => unsubscribe();
    }, [currentProject]);
    
    const events = useMemo(() => tasks.map(task => ({
        id: task.id,
        title: task.title,
        start: task.dueDate.toDate(),
        end: task.dueDate.toDate(),
        resource: task,
    })), [tasks]);
    
    const handleSelectEvent = (event: {resource: Task}) => {
        // For now, let's just log it. A modal could be opened here.
        console.log(event.resource);
        // setSelectedTask(event.resource);
        // setModalOpen(true);
    }
    
    if (!currentProject) return null;

    return (
        <div className="p-6 md:p-8 h-full flex flex-col">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                {t('calendarTitle', { projectName: currentProject.name })}
            </h1>
            <div className="flex-grow">
                 <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    onSelectEvent={handleSelectEvent}
                    className="bg-white dark:bg-dark-secondary p-4 rounded-lg shadow"
                />
            </div>
            {/* Modal can be added here if needed */}
        </div>
    );
};

export default CalendarPage;
