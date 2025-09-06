import { Timestamp } from 'firebase/firestore';

export type Status = 'To Do' | 'In Progress' | 'Done' | 'Archived';
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Task {
  id: string;
  name: string;
  description: string;
  status: Status;
  dueDate: string;
  assigneeId?: string;
  projectId?: string;
  projectName?: string;
  priority: Priority;
  parentId?: string | null;
  progress?: number;
  reminderDate?: string;
}

export interface TeamMember {
  id:string; name:string; role:string; email:string; avatar:string;
}
export interface BudgetItem {
    id:string; category:string; allocated:number; spent:number;
}
export interface Risk {
    id:string; description:string; likelihood:'Low'|'Medium'|'High'; impact:'Low'|'Medium'|'High'; mitigation:string;
}
export interface Project {
  id:string; ownerId:string; name:string; description:string; startDate:string; endDate:string; status?: string; members: string[];
}
export interface ActivityLog {
  id:string; userEmail:string; action:string; timestamp: Timestamp;
}
export type ToastType = 'success' | 'error' | 'info';
export interface ToastMessage { id: number; message: string; type: ToastType; }

export type Locale = 'en' | 'ar';
