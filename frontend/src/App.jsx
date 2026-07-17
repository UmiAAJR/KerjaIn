import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { JobProvider } from './context/JobContext';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Client Pages
import ClientDashboard from './pages/client/Dashboard';
import Search from './pages/client/Search';
import WorkerDetail from './pages/client/WorkerDetail';
import Booking from './pages/client/Booking';
import EscrowPayment from './pages/client/EscrowPayment';
import JobTracking from './pages/client/JobTracking';
import ClientHistory from './pages/client/History';
import ClientNotifications from './pages/client/Notifications';
import ClientProfile from './pages/client/Profile';

// Worker Pages
import WorkerDashboard from './pages/worker/Dashboard';
import WorkerProfile from './pages/worker/Profile';
import WorkerWallet from './pages/worker/Wallet';
import WorkerActivity from './pages/worker/Activity';
import WorkerHistory from './pages/worker/History';
import WorkerNotifications from './pages/worker/Notifications';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminClients from './pages/admin/Clients';
import AdminWorkers from './pages/admin/Workers';
import AdminVerification from './pages/admin/Verification';
import AdminReports from './pages/admin/Reports';
import AdminPanic from './pages/admin/Panic';
import AdminEscrow from './pages/admin/Escrow';
import AdminCategories from './pages/admin/Categories';

// Route guards
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={role === 'worker' ? '/worker/dashboard' : role === 'admin' ? '/admin/dashboard' : '/client/dashboard'} replace />;
  }

  return children;
};

function AppRoutes() {
  const { isAuthenticated, role } = useAuth();
  
  return (
    <Routes>
      {/* Root redirect */}
      <Route 
        path="/" 
        element={
          isAuthenticated 
            ? <Navigate to={role === 'worker' ? '/worker/dashboard' : role === 'admin' ? '/admin/dashboard' : '/client/dashboard'} replace />
            : <Navigate to="/login" replace />
        } 
      />

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Client Protected Routes */}
      <Route 
        path="/client/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/client/search" 
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <Search />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/client/worker/:id" 
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <WorkerDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/client/booking/:workerId" 
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <Booking />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/client/booking/:id/payment" 
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <EscrowPayment />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/client/tracking/:jobId" 
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <JobTracking />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/client/history" 
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientHistory />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/client/notifications" 
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientNotifications />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/client/profile" 
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientProfile />
          </ProtectedRoute>
        } 
      />

      {/* Worker Protected Routes */}
      <Route 
        path="/worker/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <WorkerDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/worker/profile" 
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <WorkerProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/worker/wallet" 
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <WorkerWallet />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/worker/activity" 
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <WorkerActivity />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/worker/history" 
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <WorkerHistory />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/worker/notifications" 
        element={
          <ProtectedRoute allowedRoles={['worker']}>
            <WorkerNotifications />
          </ProtectedRoute>
        } 
      />

      {/* Admin Protected Routes */}
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/clients" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminClients />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/workers" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminWorkers />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/workers/verification" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminVerification />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/reports" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminReports />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/panic" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminPanic />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/escrow" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminEscrow />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/categories" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminCategories />
          </ProtectedRoute>
        } 
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <JobProvider>
          <AppRoutes />
        </JobProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
