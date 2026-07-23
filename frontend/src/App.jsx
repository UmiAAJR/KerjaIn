import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MobileLayout from './components/layout/MobileLayout'
import SplashScreen from './components/ui/SplashScreen'
import { LocationProvider } from './context/LocationContext'

// Auth Pages
import Login from './pages/auth/Login'

// Client Pages
import ClientDashboard from './pages/client/Dashboard'
import Register from './pages/auth/Register'
import Search from './pages/client/Search'
import WorkerDashboard from './pages/worker/Dashboard'
import WorkerWallet from './pages/worker/Wallet'
import WorkerProfile from './pages/worker/Profile'
import WorkerActivity from './pages/worker/Activity'
import WorkerHistory from './pages/worker/History'

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
      {/* Root */}
      {/* <Route 
        path='/'
        element={}
      /> */}

      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />

      {/* Client */}
      <Route
        path='/client/dashboard'
        element={<ClientDashboard />}
      />

      <Route
        path='/client/search'
        element={<Search />}
      />
      
      {/*
      <Route 
        path='/client/worker/:id' 
        element={}
      />

      <Route 
        path='/client/booking/:workerId' 
        element={}
      />

      <Route 
        path='/client/booking/:id/payment' 
        element={}
      />

      <Route 
        path='/client/tracking/:jobId' 
        element={}
      />

      <Route 
        path='/client/history' 
        element={}
      />

      <Route 
        path='/client/notifications' 
        element={}
      />

      <Route 
        path='/client/profile' 
        element={}
      /> */}

      {/* Worker */}
      {/* <Route 
        path="/worker/dashboard" 
        element={<WorkerDashboard/>} 
      /> */}

      <Route 
        path="/worker/dashboard" 
        element={<WorkerDashboard/>} 
      />
      <Route 
        path="/worker/wallet" 
        element={<WorkerWallet/>} 
      />

      <Route 
        path="/worker/profile" 
        element={<WorkerProfile/>} 
      />

        <Route 
        path="/worker/activity" 
        element={<WorkerActivity/>} 
      />

        <Route 
        path="/worker/history" 
        element={<WorkerHistory/>} 
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
      {/* <Route 
        path="/admin/dashboard" 
        element={} 
      />

      <Route 
        path="/admin/clients" 
        element={} 
      />

      <Route 
        path="/admin/workers" 
        element={} 
      />

      <Route 
        path="/admin/workers/verification" 
        element={} 
      />

      <Route 
        path="/admin/reports" 
        element={} 
      />

      <Route 
        path="/admin/panic" 
        element={} 
      />

      <Route 
        path="/admin/escrow" 
        element={} 
      />

      <Route 
        path="/admin/categories" 
        element={} 
      /> */}

      {/* Fallback */}
      {/* <Route path="*" element={<Navigate to="/" replace />} /> */}





    </Routes>
  )
}

function App() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <LocationProvider>
      <BrowserRouter>
        <AppRoutes />
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      </BrowserRouter>
    </LocationProvider>
  )
}

export default App
