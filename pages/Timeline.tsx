import React, { useState, useMemo } from 'react';
import { getDaysDifference } from '../utils/helpers';
import { Project, Task, UserRole, TaskStatus, TeamMember } from '../types';
import { useLocalization } from '../hooks/useLocalization';

// This badge component is specific to the timeline tooltip, so keeping it local is fine.
const TaskStatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
    const baseClasses = "px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap";
    const statusClasses = {
      [TaskStatus.Completed]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      [TaskStatus.InProgress]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      [TaskStatus.Postponed]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      [TaskStatus.NotStarted]: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

interface TimelineProps {
    project: Project;
}

type ZoomLevel = 'Day' | 'Week' | 'Month';

// Augment Task type with lane information for rendering
interface PositionedTask extends Task {
    lane: number;
    style: React.CSSProperties;
}

const Timeline: React.FC<TimelineProps> = ({ project }) => {
    const { t } = useLocalization();
    const { tasks, team, duration } = project;

    const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('Week');
    const [hoveredTask, setHoveredTask] = useState<{ task: Task; element: HTMLElement } | null>(null);

    const zoomConfig: Record<ZoomLevel, { columnWidth: number, showDayNumbers: boolean }> = {
        Day: { columnWidth: 60, showDayNumbers: true },
        Week: { columnWidth: 30, showDayNumbers: true },
        Month: { columnWidth: 15, showDayNumbers: false },
    };
    const { columnWidth, showDayNumbers } = zoomConfig[zoomLevel];

    const { projectStartDate, projectEndDate, totalDays, months, todayOffset } = useMemo(() => {
        if (!duration.start || !duration.end) return { projectStartDate: null, projectEndDate: null, totalDays: 0, months: [], todayOffset: -1 };

        const start = new Date(duration.start);
        const end = new Date(duration.end);
        const days = getDaysDifference(duration.start, duration.end) + 1;

        const calculatedMonths: { name: string, startCol: number, endCol: number }[] = [];
        const tempDate = new Date(start);
        while (tempDate <= end) {
            const monthName = tempDate.toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!calculatedMonths.some(m => m.name === monthName)) {
                const firstDayOfMonth = new Date(tempDate.getFullYear(), tempDate.getMonth(), 1);
                const lastDayOfMonth = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0);

                const startCol = Math.max(getDaysDifference(duration.start, firstDayOfMonth.toISOString().split('T')[0]), 0) + 1;
                const endColDate = new Date(Math.min(end.getTime(), lastDayOfMonth.getTime()));
                const endCol = getDaysDifference(duration.start, endColDate.toISOString().split('T')[0]) + 2;
                
                calculatedMonths.push({ name: monthName, startCol, endCol });
            }
            tempDate.setMonth(tempDate.getMonth() + 1);
            tempDate.setDate(1); // Ensure we start from the 1st of next month
        }

        const offset = getDaysDifference(duration.start, new Date().toISOString().split('T')[0]);

        return { projectStartDate: start, projectEndDate: end, totalDays: days, months: calculatedMonths, todayOffset: offset };
    }, [duration.start, duration.end]);

    const { positionedTasks, laneCount } = useMemo(() => {
        if (!projectStartDate || !totalDays) return { positionedTasks: [], laneCount: 0 };
        
        const sortedTasks = [...tasks].sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        
        const lanes: Date[] = []; // Stores the end date of the last task in each lane
        const taskPositions: PositionedTask[] = [];

        sortedTasks.forEach(task => {
            const taskStart = new Date(task.startDate);
            const taskEnd = new Date(task.endDate);

            // Clamp dates to project duration for positioning
            const clampedStart = new Date(Math.max(taskStart.getTime(), projectStartDate.getTime()));
            const clampedEnd = new Date(Math.min(taskEnd.getTime(), projectEndDate!.getTime()));

            if (clampedEnd < clampedStart) { // Task is completely outside the project duration
                taskPositions.push({ ...task, lane: -1, style: { display: 'none' } });
                return;
            }

            const startOffset = getDaysDifference(projectStartDate.toISOString().split('T')[0], clampedStart.toISOString().split('T')[0]);
            const taskDurationDays = getDaysDifference(clampedStart.toISOString().split('T')[0], clampedEnd.toISOString().split('T')[0]) + 1;
            
            // Find a lane for the task
            let assignedLane = lanes.findIndex(laneEndDate => taskStart > laneEndDate);
            if (assignedLane === -1) {
                assignedLane = lanes.length;
                lanes.push(taskEnd);
            } else {
                lanes[assignedLane] = taskEnd;
            }

            taskPositions.push({
                ...task,
                lane: assignedLane,
                style: {
                    top: `${assignedLane * 48}px`, // 48px = h-10 (40px) + space (8px)
                    left: `${(startOffset / totalDays) * 100}%`,
                    width: `${(taskDurationDays / totalDays) * 100}%`,
                },
            });
        });
        
        return { positionedTasks: taskPositions, laneCount: lanes.length };
    }, [tasks, projectStartDate, totalDays]);

    const handleTaskMouseEnter = (e: React.MouseEvent<HTMLDivElement>, task: Task) => setHoveredTask({ task, element: e.currentTarget });
    const handleTaskMouseLeave = () => setHoveredTask(null);

    const roleColors: Record<UserRole, string> = {
        [UserRole.ProjectManager]: 'bg-red-500',
        [UserRole.Developer]: 'bg-blue-500',
        [UserRole.Designer]: 'bg-purple-500',
        [UserRole.Marketing]: 'bg-amber-500',
        [UserRole.Production]: 'bg-teal-500',
    };
    
    const getRoleColor = (memberId: number, team: TeamMember[]) => {
        const member = team.find(m => m.id === memberId);
        return member ? roleColors[member.role] : 'bg-gray-500';
    };

    if (!projectStartDate) {
        return ( <div className="bg-white dark:bg-dark-secondary p-6 rounded-xl shadow-md"><h2 className="text-2xl font-bold text-dark dark:text-light mb-6">{t('projectTimeline')}</h2><p className="text-gray-500">{t('noProjectDuration')}</p></div> );
    }
    if (tasks.length === 0) {
        return ( <div className="bg-white dark:bg-dark-secondary p-6 rounded-xl shadow-md"><h2 className="text-2xl font-bold text-dark dark:text-light mb-6">{t('projectTimeline')}</h2><p className="text-gray-500">{t('noTasksForTimeline')}</p></div> );
    }
    
    const assignee = hoveredTask ? team.find(m => m.id === hoveredTask.task.assignedTo) : null;
    
    return (
        <div className="bg-white dark:bg-dark-secondary p-6 rounded-xl shadow-md">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-dark dark:text-light">{t('projectTimeline')}</h2>
                <div className="flex items-center space-x-2 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                    {(['Day', 'Week', 'Month'] as ZoomLevel[]).map(level => (
                        <button key={level} onClick={() => setZoomLevel(level)} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${ zoomLevel === level ? 'bg-primary text-white shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' }`}>
                            {t(level.toLowerCase() as any)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="relative" style={{ minWidth: `${totalDays * columnWidth}px` }}>
                    {/* Month Headers */}
                    <div className="grid" style={{ gridTemplateColumns: `repeat(${totalDays}, 1fr)` }}>
                        {months.map(month => (
                            <div key={month.name} className="text-center font-semibold text-sm py-2 border-b-2 border-primary dark:border-primary-dark" style={{ gridColumn: `${month.startCol} / ${month.endCol}` }}>
                                {month.name}
                            </div>
                        ))}
                    </div>
                    {/* Day Numbers */}
                    {showDayNumbers && (
                        <div className="grid border-s border-gray-200 dark:border-gray-700 mt-2" style={{ gridTemplateColumns: `repeat(${totalDays}, minmax(${columnWidth}px, 1fr))` }}>
                            {Array.from({ length: totalDays }).map((_, i) => (
                                <div key={i} className="h-6 border-e border-gray-200 dark:border-gray-700 text-center text-xs text-gray-400 flex items-center justify-center">
                                   {new Date(new Date(projectStartDate).setDate(projectStartDate.getDate() + i)).getDate()}
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Tasks Container */}
                    <div className="mt-4 relative" style={{ height: `${laneCount * 48}px` }}>
                         {/* Today Marker */}
                        {todayOffset >= 0 && todayOffset < totalDays && (
                            <div className="absolute top-0 bottom-0 z-0" style={{ left: `${(todayOffset / totalDays) * 100}%` }}>
                                <div className="w-0.5 h-full bg-red-500 opacity-70"></div>
                                <div className="absolute -top-5 -translate-x-1/2 px-1.5 py-0.5 text-xs text-white bg-red-500 rounded-full">Today</div>
                            </div>
                        )}
                        {positionedTasks.map(task => (
                             <div
                                key={task.id}
                                className={`absolute h-10 flex items-center rounded-lg text-white text-xs font-semibold px-2 shadow-sm transition-all duration-300 cursor-pointer z-10 ${getRoleColor(task.assignedTo, team)}`}
                                style={task.style}
                                onMouseEnter={(e) => handleTaskMouseEnter(e, task)}
                                onMouseLeave={handleTaskMouseLeave}
                            >
                                <span className="truncate">{task.name}</span>
                            </div>
                        ))}
                         {/* Tooltip */}
                         {hoveredTask && (
                            <div
                                className="absolute z-20 w-64 bg-white dark:bg-dark-secondary p-4 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 pointer-events-none transition-opacity duration-200"
                                style={{
                                    top: `${hoveredTask.element.offsetTop - 12}px`,
                                    left: `${hoveredTask.element.offsetLeft + hoveredTask.element.offsetWidth / 2}px`,
                                    transform: 'translate(-50%, -100%)',
                                }}
                            >
                                <h4 className="font-bold text-dark dark:text-light mb-2">{hoveredTask.task.name}</h4>
                                <div className="flex items-center mb-2">
                                    {assignee ? (
                                        <>
                                            <img src={assignee.avatarUrl} alt={assignee.name} className="w-6 h-6 rounded-full me-2" />
                                            <span className="text-sm text-gray-600 dark:text-gray-300">{assignee.name}</span>
                                        </>
                                    ) : (
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{t('unassigned')}</span>
                                    )}
                                </div>
                                <div className="mb-2"> <TaskStatusBadge status={hoveredTask.task.status} /> </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 max-h-20 overflow-y-auto">{hoveredTask.task.description}</p>
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white dark:border-t-dark-secondary"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timeline;