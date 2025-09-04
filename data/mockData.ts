import { Project, TeamMember, Task, UserRole, TaskStatus, BudgetItem, Risk, RiskSeverity } from '../types';

const teamMembers: TeamMember[] = [
  { id: 1, name: 'Eleanor Vance', role: UserRole.ProjectManager, avatarUrl: 'https://picsum.photos/id/1005/200', email: 'eleanor@example.com' },
  { id: 2, name: 'Marcus Holloway', role: UserRole.Developer, avatarUrl: 'https://picsum.photos/id/1011/200', email: 'marcus@example.com' },
  { id: 3, name: 'Clara Oswald', role: UserRole.Designer, avatarUrl: 'https://picsum.photos/id/1012/200', email: 'clara@example.com' },
  { id: 4, name: 'Arthur Pendragon', role: UserRole.Marketing, avatarUrl: 'https://picsum.photos/id/1025/200', email: 'arthur@example.com' },
  { id: 5, name: 'Gwen Stacy', role: UserRole.Developer, avatarUrl: 'https://picsum.photos/id/1027/200', email: 'gwen@example.com' },
  { id: 6, name: 'Leo Fitz', role: UserRole.Production, avatarUrl: 'https://picsum.photos/id/103/200', email: 'leo@example.com' },
];

const tasks: Task[] = [
  { id: 1, name: 'Project Kick-off & Planning', description: 'Initial meeting with stakeholders to define project scope and goals.', assignedTo: 1, status: TaskStatus.Completed, startDate: '2024-08-01', endDate: '2024-08-05' },
  { id: 2, name: 'Initial UI/UX Design Mockups', description: 'Create wireframes and high-fidelity mockups for the main dashboard and task pages.', assignedTo: 3, status: TaskStatus.Completed, startDate: '2024-08-06', endDate: '2024-08-15' },
  { id: 3, name: 'Frontend Architecture Setup', description: 'Set up the React project structure, including state management and routing.', assignedTo: 2, status: TaskStatus.Completed, startDate: '2024-08-10', endDate: '2024-08-18' },
  { id: 4, name: 'Develop Dashboard Component', description: 'Build the main dashboard view with all KPI cards and charts.', assignedTo: 5, status: TaskStatus.InProgress, startDate: '2024-08-19', endDate: '2024-08-28' },
  { id: 5, name: 'Develop Task Management Page', description: 'Create the task list view with filtering and sorting capabilities.', assignedTo: 2, status: TaskStatus.InProgress, startDate: '2024-08-22', endDate: '2024-09-05' },
  { id: 6, name: 'Marketing Strategy Finalization', description: 'Finalize the go-to-market strategy and prepare launch materials.', assignedTo: 4, status: TaskStatus.NotStarted, startDate: '2024-08-25', endDate: '2024-09-02' },
  { id: 7, name: 'API Integration for User Data', description: 'Connect the frontend to the backend API to fetch and update user data.', assignedTo: 5, status: TaskStatus.Postponed, startDate: '2024-09-01', endDate: '2024-09-10' },
  { id: 8, name: 'Final Design System Review', description: 'Review and approve the final design system components before implementation.', assignedTo: 3, status: TaskStatus.NotStarted, startDate: '2024-09-06', endDate: '2024-09-12' },
  { id: 9, name: 'Pre-launch Production Setup', description: 'Configure the production environment and set up deployment pipelines.', assignedTo: 6, status: TaskStatus.NotStarted, startDate: '2024-09-13', endDate: '2024-09-20' },
  { id: 10, name: 'User Acceptance Testing', description: 'Conduct UAT with a select group of users to identify and fix bugs.', assignedTo: 1, status: TaskStatus.NotStarted, startDate: '2024-09-21', endDate: '2024-09-30' },
];

const budgetItems: BudgetItem[] = [
  { id: 1, name: 'Software Licenses', expectedCost: 20000, actualCost: 18500 },
  { id: 2, name: 'Cloud Hosting (3 months)', expectedCost: 45000, actualCost: 45000 },
  { id: 3, name: 'Marketing Campaign', expectedCost: 75000, actualCost: 82000 },
  { id: 4, name: 'UI/UX Design Contract', expectedCost: 60000, actualCost: 0 },
];

const risks: Risk[] = [
  { id: 1, description: 'Key developer leaves the project mid-way.', severity: RiskSeverity.High, solution: 'Document all processes and ensure knowledge sharing within the team. Have a backup developer on standby.' },
  { id: 2, description: 'Scope creep from stakeholder requests.', severity: RiskSeverity.Medium, solution: 'Implement a strict change control process. All new requests must be evaluated for impact on timeline and budget.' },
  { id: 3, description: 'Third-party API becomes unreliable.', severity: RiskSeverity.Medium, solution: 'Develop a fallback mechanism or identify an alternative API provider in advance.' },
];

export const initialProjects: Project[] = [
  {
    id: 1,
    name: 'NextGen CRM Platform',
    goal: 'To build a highly responsive and intuitive CRM application to streamline customer interactions and sales processes.',
    duration: { start: '2024-08-01', end: '2024-09-30' },
    budget: 250000,
    team: teamMembers,
    tasks: tasks,
    budgetItems: budgetItems,
    risks: risks,
  }
];
