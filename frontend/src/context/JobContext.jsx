import React, { createContext, useContext, useState, useEffect } from 'react';
import { clientApi, workerApi, adminApi } from '../services/api';
import { useAuth } from './AuthContext';

const JobContext = createContext(null);

export const JobProvider = ({ children }) => {
  const { user, role } = useAuth();
  const [activeJobs, setActiveJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [categories, setCategories] = useState([]);

  // Fetch initial notifications and categories
  const fetchGlobalData = async () => {
    try {
      const cats = await adminApi.getCategories();
      setCategories(cats);
      
      if (role === 'client') {
        const notifs = await clientApi.getNotifications();
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.isRead).length);
        const history = await clientApi.getHistory();
        setActiveJobs(history.filter(j => !['Finished', 'Rejected'].includes(j.status)));
      } else if (role === 'worker' && user?.id) {
        const notifs = await workerApi.getNotifications(user.id);
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.isRead).length);
        const active = await workerApi.getActiveJobs(user.id);
        setActiveJobs(active);
      }
    } catch (err) {
      console.error('Error fetching global data:', err);
    }
  };

  useEffect(() => {
    if (role) {
      fetchGlobalData();
      
      // Setup a periodic refetch timer to simulate real-time updates across roles
      const interval = setInterval(() => {
        fetchGlobalData();
      }, 5000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setActiveJobs([]);
    }
  }, [role, user]);

  const markNotifRead = (notifId) => {
    const key = 'ki_notifications';
    const allNotifs = JSON.parse(localStorage.getItem(key)) || [];
    const idx = allNotifs.findIndex(n => n.notificationId === notifId);
    if (idx !== -1) {
      allNotifs[idx].isRead = true;
      localStorage.setItem(key, JSON.stringify(allNotifs));
      fetchGlobalData();
    }
  };

  // CLIENT FUNCTIONS
  const createBooking = async (workerId, tanggal, jam, alamat, deskripsi, estimasiHarga) => {
    const job = await clientApi.createBooking(workerId, tanggal, jam, alamat, deskripsi, estimasiHarga);
    await fetchGlobalData();
    return job;
  };

  const payEscrow = async (jobId, amount, method) => {
    const job = await clientApi.createEscrowPayment(jobId, amount, method);
    await fetchGlobalData();
    return job;
  };

  const submitReview = async (jobId, rating, comment) => {
    const job = await clientApi.submitReview(jobId, rating, comment);
    await fetchGlobalData();
    return job;
  };

  const submitReport = async (jobId, category, description, attachment) => {
    const report = await clientApi.submitReport(jobId, category, description, attachment);
    await fetchGlobalData();
    return report;
  };

  // WORKER FUNCTIONS
  const acceptBooking = async (jobId) => {
    const job = await workerApi.acceptBooking(jobId);
    await fetchGlobalData();
    return job;
  };

  const rejectBooking = async (jobId) => {
    const job = await workerApi.rejectBooking(jobId);
    await fetchGlobalData();
    return job;
  };

  const startJob = async (jobId) => {
    const job = await workerApi.startJob(jobId);
    await fetchGlobalData();
    return job;
  };

  const finishJob = async (jobId) => {
    const job = await workerApi.finishJob(jobId);
    await fetchGlobalData();
    return job;
  };

  const togglePanic = async (jobId, isEnabled) => {
    const job = await workerApi.triggerPanic(jobId, isEnabled);
    await fetchGlobalData();
    return job;
  };

  return (
    <JobContext.Provider value={{
      activeJobs,
      notifications,
      unreadCount,
      categories,
      fetchGlobalData,
      markNotifRead,
      // Client
      createBooking,
      payEscrow,
      submitReview,
      submitReport,
      // Worker
      acceptBooking,
      rejectBooking,
      startJob,
      finishJob,
      togglePanic
    }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};
