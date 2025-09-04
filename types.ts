export enum TaskStatus {
  InProgress = 'In Progress',
  Completed = 'Completed',
  Postponed = 'Postponed',
  NotStarted = 'Not Started'
}

export enum UserRole {
  Designer = 'Designer',
  Production = 'Production',
  Marketing = 'Marketing',
  ProjectManager = 'Project Manager',
  Developer = 'Developer'
}

export enum RiskSeverity {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

export interface TeamMember {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
  email: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  assignedTo: string; // TeamMember ID
  status: TaskStatus;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface BudgetItem {
  id: string;
  name: string;
  expectedCost: number;
  actualCost: number;
}

export interface Risk {
  id: string;
  description: string;
  severity: RiskSeverity;
  solution: string;
}

export interface Project {
  id: string;
  name: string;
  goal: string;
  duration: {
    start: string; // YYYY-MM-DD
    end: string; // YYYY-MM-DD
  };
  budget: number;
  team: TeamMember[];
  tasks: Task[];
  budgetItems: BudgetItem[];
  risks: Risk[];
}

export type Page = 'Dashboard' | 'Team' | 'Tasks' | 'Timeline' | 'Budget' | 'Risks';