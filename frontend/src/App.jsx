import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SplashScreen from './components/ui/SplashScreen'
import { LocationProvider } from './context/LocationContext'
import { AuthProvider, useAuth } from './context/AuthContext'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Admin Pages
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminJobs from './pages/admin/Jobs'
import AdminEscrow from './pages/admin/Escrow'
import AdminCategories from './pages/admin/Categories'
import AdminVerification from './pages/admin/Verification'
import AdminPanic from './pages/admin/Panic'
import AdminReports from './pages/admin/Reports'
import AdminNotifications from './pages/admin/Notifications'

// Client Pages
import ClientDashboard from './pages/client/Dashboard'
import Search from './pages/client/Search'
import ClientHistory from './pages/client/History'
import ClientProfile from './pages/client/Profile'
import ClientHistoryDetail from './pages/client/HistoryDetail'
import WorkerDetail from './pages/client/WorkerDetail'
import Booking from './pages/client/Booking'
import EscrowPayment from './pages/client/EscrowPayment'
import JobTracking from './pages/client/JobTracking'

// Worker Pages
import WorkerDashboard from './pages/worker/Dashboard'
import WorkerWallet from './pages/worker/Wallet'
import WorkerProfile from './pages/worker/Profile'
import WorkerActivity from './pages/worker/Activity'
import WorkerHistory from './pages/worker/History'
import WorkerNotification from './pages/worker/Notifications'

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
  return (
    <Routes>
      <Route
        path='/'
        element={
          <Navigate to="/login" replace />
        }
      />

      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      {/* <Route path='/admin/login' element={<AdminLogin />} /> */}

      {/* Client */}
      <Route
        path='/client/dashboard'
        element={<ProtectedRoute allowedRoles={['client']}><ClientDashboard /></ProtectedRoute>}
      />

      <Route
        path='/client/search'
        element={<ProtectedRoute allowedRoles={['client']}><Search /></ProtectedRoute>}
      />

      <Route
        path='/client/worker/:id'
        element={<ProtectedRoute allowedRoles={['client']}><WorkerDetail /></ProtectedRoute>}
      />

      <Route
        path='/client/booking/:workerId'
        element={<ProtectedRoute allowedRoles={['client']}><Booking /></ProtectedRoute>}
      />

      <Route
        path='/client/booking/:jobId/payment'
        element={<ProtectedRoute allowedRoles={['client']}><EscrowPayment /></ProtectedRoute>}
      />

      <Route
        path='/client/tracking/:jobId'
        element={<ProtectedRoute allowedRoles={['client']}><JobTracking /></ProtectedRoute>}
      />

      <Route
        path='/client/history'
        element={<ProtectedRoute allowedRoles={['client']}><ClientHistory /></ProtectedRoute>}
      />

      <Route
        path='/client/history/:jobId'
        element={<ProtectedRoute allowedRoles={['client']}><ClientHistoryDetail /></ProtectedRoute>}
      />

      <Route
        path='/client/profile'
        element={<ProtectedRoute allowedRoles={['client']}><ClientProfile /></ProtectedRoute>}
      />

      {/* Worker */}
      <Route
        path="/worker/dashboard"
        element={<ProtectedRoute allowedRoles={['worker']}><WorkerDashboard /></ProtectedRoute>}
      />
      <Route
        path="/worker/wallet"
        element={<ProtectedRoute allowedRoles={['worker']}><WorkerWallet /></ProtectedRoute>}
      />

      <Route
        path="/worker/profile"
        element={<ProtectedRoute allowedRoles={['worker']}><WorkerProfile /></ProtectedRoute>}
      />

      <Route
        path="/worker/activity"
        element={<ProtectedRoute allowedRoles={['worker']}><WorkerActivity /></ProtectedRoute>}
      />

      <Route
        path="/worker/history"
        element={<ProtectedRoute allowedRoles={['worker']}><WorkerHistory /></ProtectedRoute>}
      />

      <Route 
        path="/worker/notification" 
        element={<WorkerNotification/>} 
      />

      {/* <Route 
        path="/worker/dashboard" 
        element={} 
      />

      <Route 
        path="/worker/profile" 
        element={} 
      />

      <Route 
        path="/worker/wallet" 
        element={} 
      />

      <Route 
        path="/worker/activity" 
        element={} 
      />

      <Route 
        path="/worker/history" 
        element={} 
      />

      <Route 
        path="/worker/notifications" 
        element={} 
      /> */}

      {/* Admin */}
      <Route path='/admin/login' element={<AdminLogin />} />
      <Route 
        path="/admin/dashboard" 
        element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} 
      />
      <Route 
        path="/admin/users" 
        element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} 
      />
      <Route 
        path="/admin/jobs" 
        element={<ProtectedRoute allowedRoles={['admin']}><AdminJobs /></ProtectedRoute>} 
      />
      <Route 
        path="/admin/escrow" 
        element={<ProtectedRoute allowedRoles={['admin']}><AdminEscrow /></ProtectedRoute>} 
      />
      <Route 
        path="/admin/categories" 
        element={<ProtectedRoute allowedRoles={['admin']}><AdminCategories /></ProtectedRoute>} 
      />
      <Route 
        path="/admin/verification" 
        element={<ProtectedRoute allowedRoles={['admin']}><AdminVerification /></ProtectedRoute>} 
      />
      <Route 
        path="/admin/panic" 
        element={<ProtectedRoute allowedRoles={['admin']}><AdminPanic /></ProtectedRoute>} 
      />
      <Route 
        path="/admin/reports" 
        element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} 
      />
      <Route 
        path="/admin/notifications" 
        element={<ProtectedRoute allowedRoles={['admin']}><AdminNotifications /></ProtectedRoute>} 
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />





    </Routes>
  )
}

function App() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <LocationProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
        </BrowserRouter>
      </AuthProvider>
    </LocationProvider>
  )
}

export default App
