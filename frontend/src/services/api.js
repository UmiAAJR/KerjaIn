import { 
  INITIAL_CATEGORIES, 
  INITIAL_CLIENT_PROFILE, 
  INITIAL_WORKERS, 
  INITIAL_JOBS, 
  INITIAL_NOTIFICATIONS 
} from './mockData';

const initDb = () => {
    if (!localStorage.getItem('ki_categories')) {
        localStorage.setItem('ki_categories', JSON.stringify(INITIAL_CATEGORIES));
    }
    if (!localStorage.getItem('ki_client_profile')) {
        localStorage.setItem('ki_client_profile', JSON.stringify(INITIAL_CLIENT_PROFILE));
    }
    if (!localStorage.getItem('ki_workers')) {
        localStorage.setItem('ki_workers', JSON.stringify(INITIAL_WORKERS));
    }
    if (!localStorage.getItem('ki_jobs')) {
        localStorage.setItem('ki_jobs', JSON.stringify(INITIAL_JOBS));
    }
    if (!localStorage.getItem('ki_notifications')) {
        localStorage.setItem('ki_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
    }
    if (!localStorage.getItem('ki_reports')) {
        localStorage.setItem('ki_reports', JSON.stringify([]));
    }
};

initDb();

export { authApi } from './authService';
export { clientApi } from './clientService';
export { workerApi } from './workerService';
export { adminApi } from './adminService';
