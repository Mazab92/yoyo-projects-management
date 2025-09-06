import { createContext } from 'react';
import { Project } from '../types';

interface ProjectContextType {
    currentProject: Project | null;
    projects: Project[];
}

export const ProjectContext = createContext<ProjectContextType>({ currentProject: null, projects: [] });
