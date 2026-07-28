import React, { useState, useEffect } from 'react';
import { workerApi } from '../../services/api';
import MobileLayout from "../../components/layout/MobileLayout";
import { Link } from 'react-router-dom';
import { Bell, CreditCard, Calendar, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

export default function WorkerNotification() {
  const [notificationTab, setNotificationTab] = useState('Semua');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // ID Worker (bisa diambil dari AuthContext / LocalStorage sesuai sesi login)
  const currentWorkerId = 'worker-1'; 

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await workerApi.getNotifications(currentWorkerId);
      setNotifications(data || []);
    } catch (error) {
      console.error('Gagal mengambil data notifikasi:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper untuk menentukan icon & warna berdasarkan tipe notifikasi
  const getTypeBadge = (type) => {
    switch (type) {
      case 'booking':
        return {
          icon: <Calendar className="w-5 h-5 text-blue-600" />,
          bg: 'bg-blue-100',
          label: 'Pesanan'
        };
      case 'payment':
        return {
          icon: <CreditCard className="w-5 h-5 text-green-600" />,
          bg: 'bg-green-100',
          label: 'Pembayaran'
        };
      case 'panic':
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-600" />,
          bg: 'bg-red-100',
          label: 'Darurat'
        };
      default:
        return {
          icon: <Info className="w-5 h-5 text-gray-600" />,
          bg: 'bg-gray-100',
          label: 'Sistem'
        };
    }
  };

  // Filter notifikasi berdasarkan Tab yang aktif
  const filteredNotifications = notifications.filter((item) => {
    if (notificationTab === 'Semua') return true;
    if (notificationTab === 'Booking') return item.type === 'booking';
    if (notificationTab === 'Payment') return item.type === 'payment';
    if (notificationTab === 'Sistem') return item.type === 'system' || item.type === 'panic';
    return true;
  });

  const tabs = ['Semua', 'Booking', 'Payment', 'Sistem'];

  return (
    <MobileLayout
      topNavProps={{
        variant: "brand",
        hasNotification: true,
      }}
      bottomNavProps={{
        activeTab: "home",
      }}
    >
      <div className="p-4 space-y-4">
        {/* Header Title */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" /> Notifikasi
          </h1>
          <span className="text-xs text-gray-500">
            {notifications.filter(n => !n.isRead).length} Belum dibaca
          </span>
        </div>

        {/* Tab Filtering */}
        <div className="flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setNotificationTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                notificationTab === tab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-500">Tidak ada notifikasi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => {
              const badge = getTypeBadge(notif.type);
              
              return (
                <Link
                  key={notif.notificationId}
                  to={notif.actionLink || '#'}
                  className={`block p-4 rounded-xl border transition-all ${
                    notif.isRead 
                      ? 'bg-white border-gray-100 opacity-80' 
                      : 'bg-blue-50/50 border-blue-100 shadow-sm'
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Icon Type */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${badge.bg}`}>
                      {badge.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400">
                          {badge.label}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {notif.createdAt}
                        </span>
                      </div>

                      <h3 className={`text-sm font-semibold text-gray-900 truncate mb-1 ${!notif.isRead ? 'font-bold' : ''}`}>
                        {notif.title}
                      </h3>

                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {notif.description}
                      </p>
                    </div>

                    {/* Unread Indicator */}
                    {!notif.isRead && (
                      <span className="w-2.5 h-2.5 bg-blue-600 rounded-full shrink-0 self-center"></span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}