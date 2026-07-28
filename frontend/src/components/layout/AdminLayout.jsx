import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CreditCard,
  Layers,
  LogOut,
  ShieldCheck,
  AlertOctagon,
  FileText,
  Bell
} from 'lucide-react';
import logoNoText from '../../assets/logo-notext.png';

const AdminLayout = ({ children, activeMenu = 'dashboard' }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Manajemen Pengguna', path: '/admin/users', icon: Users },
    { id: 'jobs', label: 'Manajemen Pekerjaan', path: '/admin/jobs', icon: Briefcase },
    { id: 'escrow', label: 'Escrow & Keuangan', path: '/admin/escrow', icon: CreditCard },
    { id: 'categories', label: 'Kategori & Keahlian', path: '/admin/categories', icon: Layers },
    { id: 'verification', label: 'Verifikasi Pekerja', path: '/admin/verification', icon: ShieldCheck },
    { id: 'panic', label: 'Peringatan Panic', path: '/admin/panic', icon: AlertOctagon },
    { id: 'reports', label: 'Laporan Kendala', path: '/admin/reports', icon: FileText },
    { id: 'notifications', label: 'Kirim Notifikasi', path: '/admin/notifications', icon: Bell }
  ];

  return (
    <div className="min-h-screen bg-primary-50 flex font-sans antialiased text-slate-800">

      {/* Sidebar */}
      <aside className="w-64 bg-primary-900 text-white flex flex-col shrink-0 border-r border-primary-800">

        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-primary-800 gap-3">
          <img
            src={logoNoText}
            alt="Logo KerjaIn"
            className="w-10 object-contain"
          />
          <span className="font-heading font-black tracking-wide text-2xl">
            KerjaIn
          </span>
        </div>

        {/* Navigation Menus */}
        <nav className="flex-grow py-6 px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Check if current path matches or activeMenu matches
            const isActive = activeMenu === item.id || location.pathname === item.path;

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 group
                  ${isActive
                    ? 'bg-secondary-500 text-white shadow-lg shadow-secondary-500/10'
                    : 'text-primary-300 hover:text-white hover:bg-primary-800/60'
                  }`}
              >
                <Icon size={18} className={`shrink-0 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-white' : 'text-primary-400 group-hover:text-white'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer / User Info */}
        <div className="p-4 border-t border-primary-800 space-y-3 bg-primary-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary-500/10 border border-secondary-500/20 flex items-center justify-center text-secondary-400 font-bold text-sm shrink-0">
              A
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate leading-tight">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-[10px] font-semibold text-primary-400 truncate mt-0.5">
                {user?.email || 'admin@kerjain.com'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-primary-800 hover:bg-rose-600/20 hover:text-rose-400 hover:border-rose-500/30 border border-primary-700/60 text-primary-200 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer active:scale-[0.98]"
          >
            <LogOut size={14} />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 h-screen overflow-hidden">

        {/* Header */}
        <header className="h-16 bg-white border-b border-primary-100 flex items-center justify-between px-8 shrink-0">
          <div>
            <h2 className="text-lg font-black text-primary-900 uppercase tracking-wider font-heading leading-tight">
              {menuItems.find(item => item.id === activeMenu)?.label || 'Admin Panel'}
            </h2>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-secondary-50 text-secondary-800 px-3 py-1 rounded-full text-xs font-black tracking-wider border border-secondary-100 uppercase">
              <ShieldCheck size={14} className="stroke-[2.5]" />
              <span>Sistem Terverifikasi</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-grow overflow-y-auto p-8">
          {children}
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;
