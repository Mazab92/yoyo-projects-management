import { useContext } from 'react';
import { ProjectContext } from '../context/ProjectContext';

export const useProjectContext = () => useContext(ProjectContext);
