import { Timestamp } from 'firebase/firestore';

// Main Firestore Collection Interfaces
export interface User {
  id: string; // Firebase Auth UID
  name: string;
  email: string;
  role: string;
  avatar?: string;
  projects: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdBy: string; // User ID
  team: string[]; // Array of User IDs
  createdAt: Timestamp;
  startDate: string; // Kept for UI consistency
  endDate: string; // Kept for UI consistency
}

export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

// Fix: Added missing Priority type.
export type Priority = 'Urgent' | 'High' | 'Medium' | 'Low';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  assignedTo: string | null; // User ID
  status: TaskStatus;
  dueDate: Timestamp;
}

export type RiskSeverity = 'Low' | 'Medium' | 'High';

export interface Risk {
  id: string;
  projectId: string;
  description: string;
  severity: RiskSeverity;
  mitigation: string;
}

export interface BudgetItem {
  id: string;
  projectId: string;
  category: string;
  planned: number;
  actual: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  projectId?: string;
  projectName?: string;
  timestamp: Timestamp;
  details?: Record<string, any>;
}

// UI-related types
export type ToastType = 'success' | 'error' | 'info';
export interface ToastMessage { id: number; message: string; type: ToastType; }
export type Locale = 'en' | 'ar';
