import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Project } from '../types';

export const logActivity = async (
  action: string,
  details: { projectId?: string; [key: string]: any } = {}
) => {
  const user = auth.currentUser;
  if (!user) {
    console.error("No user found to log activity");
    return;
  }

  try {
    const logData: any = {
      action,
      userId: user.uid,
      userEmail: user.email,
      timestamp: serverTimestamp(),
      details,
    };
    
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
        logData.userName = userDoc.data().name;
    }

    if (details.projectId) {
      logData.projectId = details.projectId;
      const projectDoc = await getDoc(doc(db, 'projects', details.projectId));
      if (projectDoc.exists()) {
        logData.projectName = (projectDoc.data() as Project).name;
      }
    }

    await addDoc(collection(db, 'activity_logs'), logData);
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};
