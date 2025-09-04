export type Status = 'To Do' | 'In Progress' | 'Done' | 'Archived';

export interface Task {
  id: string;
  name: string;
  description: string;
  status: Status;
  dueDate: string;
  assigneeId?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
}

export interface Budget {
    id: string;
    category: string;
    allocated: number;
    spent: number;
}

export interface Risk {
    id: string;
    description: string;
    likelihood: 'Low' | 'Medium' | 'High';
    impact: 'Low' | 'Medium' | 'High';
    mitigation: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  tasks: Task[];
  team: TeamMember[];
  budget: Budget[];
  risks: Risk[];
}

export interface Design {
  id: string;
  name: string;
  imageUrl: string;
  uploadedAt: string;
}
