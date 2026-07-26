import { createSlice } from '@reduxjs/toolkit';

const getInitialJobs = () => {
  const data = localStorage.getItem('ki_jobs');
  return data ? JSON.parse(data) : [];
};

const jobSlice = createSlice({
  name: 'jobs',
  initialState: {
    list: getInitialJobs(),
    currentJob: null,
    loading: false,
    error: null,
  },
  reducers: {
    setJobs: (state, action) => {
      state.list = action.payload;
      localStorage.setItem('ki_jobs', JSON.stringify(action.payload));
    },
    addJob: (state, action) => {
      state.list.unshift(action.payload);
      localStorage.setItem('ki_jobs', JSON.stringify(state.list));
    },
    updateJobStatus: (state, action) => {
      const { jobId, status, escrowStatus } = action.payload;
      const job = state.list.find(j => j.jobId === jobId);
      if (job) {
        job.status = status;
        if (escrowStatus !== undefined) {
          job.escrowStatus = escrowStatus;
        }
        localStorage.setItem('ki_jobs', JSON.stringify(state.list));
      }
      if (state.currentJob && state.currentJob.jobId === jobId) {
        state.currentJob.status = status;
        if (escrowStatus !== undefined) {
          state.currentJob.escrowStatus = escrowStatus;
        }
      }
    },
    setCurrentJob: (state, action) => {
      state.currentJob = action.payload;
    },
  },
});

export const { setJobs, addJob, updateJobStatus, setCurrentJob } = jobSlice.actions;
export default jobSlice.reducer;
