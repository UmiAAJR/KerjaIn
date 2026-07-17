import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobContext';
import { 
  Home, 
  Search, 
  History, 
  User, 
  Briefcase, 
  Wallet, 
  Bell, 
  LogOut,
  RefreshCw
} from 'lucide-react';

const MobileLayout = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, logout, refreshProfile } = useAuth();
  const { unreadCount } = useJobs();

  const handleRoleToggle = () => {
    // Switch to Admin quickly for testing, or logout to switch
    logout();
    navigate('/login');
  };

  const clientTabs = [
    { path: '/client/dashboard', label: 'Beranda', icon: Home },
    { path: '/client/search', label: 'Cari', icon: Search },
    { path: '/client/history', label: 'Riwayat', icon: History },
    { path: '/client/profile', label: 'Profil', icon: User }
  ];

  const workerTabs = [
    { path: '/worker/dashboard', label: 'Dashboard', icon: Home },
    { path: '/worker/activity', label: 'Pekerjaan', icon: Briefcase },
    { path: '/worker/wallet', label: 'Dompet', icon: Wallet },
    { path: '/worker/profile', label: 'Profil', icon: User }
  ];

  const tabs = role === 'worker' ? workerTabs : clientTabs;

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center py-0 sm:py-8 px-0 sm:px-4">
      {/* Simulated iPhone/Android Device Container */}
      <div className="w-full sm:max-w-md h-screen sm:h-[850px] bg-slate-50 sm:rounded-[40px] sm:shadow-2xl sm:border-[8px] sm:border-slate-800 flex flex-col overflow-hidden relative">
        
        {/* Device Top Speaker and Camera Notch for desktop preview */}
        <div className="hidden sm:flex justify-center items-center h-6 bg-slate-800 shrink-0">
          <div className="w-24 h-4 bg-black rounded-b-xl"></div>
        </div>

        {/* App Topbar */}
        <header className="bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-extrabold text-slate-800 font-heading tracking-tight">
              {title || 'KerjaIn'}
            </h1>
            <span className="bg-primary-50 text-primary-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {role}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(role === 'worker' ? '/worker/notifications' : '/client/notifications')}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl relative transition-all"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-accent-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button 
              onClick={handleRoleToggle}
              title="Ganti Akun / Role"
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-grow overflow-y-auto pb-20 bg-slate-50">
          {children}
        </main>

        {/* Bottom Tabbar */}
        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-4 py-2 flex justify-around items-center z-10 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname.startsWith(tab.path);
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center py-1 px-3 rounded-2xl transition-all duration-200"
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-primary-50 text-primary-600' : 'text-slate-400'}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-semibold mt-0.5 transition-colors ${isActive ? 'text-primary-600 font-bold' : 'text-slate-400'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default MobileLayout;
