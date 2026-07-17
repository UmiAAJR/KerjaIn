import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  AlertOctagon, 
  Skull, 
  ShieldAlert,
  Wallet2, 
  Tags, 
  LogOut 
} from 'lucide-react';

const AdminLayout = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/clients', label: 'Daftar Client', icon: Users },
    { path: '/admin/workers', label: 'Daftar Worker', icon: Users },
    { path: '/admin/workers/verification', label: 'Verifikasi KTP', icon: UserCheck },
    { path: '/admin/reports', label: 'Laporan Aduan', icon: AlertOctagon },
    { path: '/admin/panic', label: 'Pemberitahuan Panik', icon: ShieldAlert },
    { path: '/admin/escrow', label: 'Dana Escrow', icon: Wallet2 },
    { path: '/admin/categories', label: 'Kategori Jasa', icon: Tags }
  ];

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white font-heading tracking-wider">
              KerjaIn
            </h2>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              Admin Portal
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                  ${isActive 
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' 
                    : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-accent-400 hover:bg-slate-800/50 hover:text-accent-300 transition-colors"
          >
            <LogOut size={18} />
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 font-heading">
            {title || 'Halaman Admin'}
          </h2>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-800">Administrator</p>
              <p className="text-[10px] text-slate-400 font-medium">admin@kerjain.com</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
              AD
            </div>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-grow p-8 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
