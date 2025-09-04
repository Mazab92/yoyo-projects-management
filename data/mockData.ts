import { Project, Design } from '../types';

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Website Redesign',
    description: 'A complete overhaul of the company website to improve user experience and refresh the brand identity.',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    tasks: [
      { id: 'task-1', name: 'Initial research', description: 'Analyze competitor websites', status: 'Done', dueDate: '2024-02-01' },
      { id: 'task-2', name: 'Wireframing', description: 'Create low-fidelity wireframes', status: 'In Progress', dueDate: '2024-03-15' },
      { id: 'task-3', name: 'UI Design', description: 'Design high-fidelity mockups', status: 'To Do', dueDate: '2024-04-10' },
    ],
    team: [
      { id: 'team-1', name: 'Alice Johnson', role: 'Project Manager', email: 'alice@example.com', avatar: '' },
      { id: 'team-2', name: 'Bob Williams', role: 'UX Designer', email: 'bob@example.com', avatar: '' },
    ],
    budget: [
        { id: 'budget-1', category: 'Software', allocated: 5000, spent: 2500 },
        { id: 'budget-2', category: 'Marketing', allocated: 10000, spent: 4000 },
    ],
    risks: [
        { id: 'risk-1', description: 'Scope creep from marketing department', likelihood: 'Medium', impact: 'High', mitigation: 'Weekly scope review meetings' },
    ],
  },
  {
    id: 'proj-2',
    name: 'Mobile App Development',
    description: 'Create a new mobile application for iOS and Android to supplement our web service.',
    startDate: '2024-03-01',
    endDate: '2024-09-30',
    tasks: [],
    team: [],
    budget: [],
    risks: [],
  },
];

export const mockDesigns: Design[] = [
    { id: 'design-1', name: 'Homepage Mockup', imageUrl: 'https://via.placeholder.com/400x300.png/007bff/ffffff?text=Homepage', uploadedAt: '2024-04-01' },
    { id: 'design-2', name: 'Dashboard UI', imageUrl: 'https://via.placeholder.com/400x300.png/28a745/ffffff?text=Dashboard', uploadedAt: '2024-04-05' },
];
