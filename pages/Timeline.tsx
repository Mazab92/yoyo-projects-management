import React from 'react';
import { Task, TeamMember } from '../types';

interface TimelineProps {
  tasks: Task[];
  team: TeamMember[];
}

const memberColors = [
    '#4f46e5', '#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'
];

const getMemberColor = (memberId: string, members: TeamMember[]) => {
    const index = members.findIndex(m => m.id === memberId);
    return memberColors[index % memberColors.length];
};

const Timeline: React.FC<TimelineProps> = ({ tasks, team }) => {
    if (tasks.length === 0) {
        return (
            <div className="space-y-6">
                 <h1 className="text-3xl font-bold text-dark dark:text-light">Timeline</h1>
                 <p className="text-center text-gray-500">No tasks to display on the timeline.</p>
            </div>
        );
    }
    
    const sortedTasks = [...tasks].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    const projectStartDate = new Date(sortedTasks[0].startDate);
    const projectEndDate = new Date(Math.max(...sortedTasks.map(t => new Date(t.endDate).getTime())));
    
    const totalDays = Math.ceil((projectEndDate.getTime() - projectStartDate.getTime()) / (1000 * 3600 * 24)) + 1;
    
    const getDaysOffset = (date: Date) => {
        return Math.floor((date.getTime() - projectStartDate.getTime()) / (1000 * 3600 * 24));
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-dark dark:text-light">Timeline</h1>

            <div className="p-4 overflow-x-auto bg-white rounded-lg shadow-md dark:bg-dark-secondary">
                <div className="relative" style={{ width: `${totalDays * 40}px` }}>
                    {/* Header */}
                    <div className="flex">
                        {Array.from({ length: totalDays }).map((_, i) => {
                            const date = new Date(projectStartDate);
                            date.setDate(date.getDate() + i);
                            return (
                                <div key={i} className="flex-shrink-0 w-10 text-xs text-center text-gray-500 border-r dark:border-gray-700">
                                    <div className="pb-1">{date.getDate()}</div>
                                    <div className="text-gray-400">{date.toLocaleDateString('en-US', { month: 'short' })}</div>
                                </div>
                            );
                        })}
                    </div>
                    {/* Task Rows */}
                    <div className="mt-2 space-y-2">
                        {sortedTasks.map(task => {
                            const startDate = new Date(task.startDate);
                            const endDate = new Date(task.endDate);
                            const startOffset = getDaysOffset(startDate);
                            const duration = getDaysOffset(endDate) - startOffset + 1;
                            const member = team.find(m => m.id === task.assignedTo);
                            const color = member ? getMemberColor(member.id, team) : '#a1a1aa';
                            
                            return (
                                <div key={task.id} className="relative h-8 group">
                                    <div 
                                        className="absolute h-full rounded"
                                        style={{
                                            left: `${startOffset * 40}px`,
                                            width: `${duration * 40}px`,
                                            backgroundColor: color,
                                        }}
                                    >
                                        <span className="absolute inset-0 z-10 hidden p-2 text-xs text-white bg-gray-800 rounded-md -top-10 group-hover:block">
                                            <strong>{task.name}</strong><br/>
                                            {member?.name || 'Unassigned'}<br/>
                                            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                                        </span>
                                    </div>
                                    <span className="absolute z-0 flex items-center h-full pl-2 text-xs font-medium text-white truncate" style={{ left: `${startOffset * 40}px` }}>{task.name}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Timeline;
