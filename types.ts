export interface Project {
  id: string;
  name: string;
  goal: string;
  duration: string;
  budget: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string; // URL or path to avatar image
  email: string;
}

export interface Task {
  id: string;
  name: string;
  status: 'Completed' | 'In Progress' | 'Postponed';
  assignedTo: string; // TeamMember ID
  startDate: string; // ISO 8601 format string
  endDate: string; // ISO 8601 format string
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
    severity: 'Low' | 'Medium' | 'High';
    solution: string;
}
