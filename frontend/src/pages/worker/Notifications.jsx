import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useJobs } from '../../context/JobContext';
import { workerApi } from '../../services/api';
import MobileLayout from '../../components/layout/MobileLayout';
import Card from '../../components/ui/Card';
import { Bell, BellOff } from 'lucide-react';

const WorkerNotifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { markNotifRead } = useJobs();
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    if (user?.id) {
      try {
        const res = await workerApi.getNotifications(user.id);
        setNotifications(res);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [user]);

  const handleNotifClick = (notif) => {
    markNotifRead(notif.notificationId);
    if (notif.actionLink) {
      navigate(notif.actionLink);
    }
  };

  return (
    <MobileLayout title="Notifikasi Worker">
      <div className="px-5 py-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <BellOff size={24} />
            </div>
            <p className="text-sm font-bold text-slate-400">Tidak ada notifikasi baru</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <Card
                key={notif.notificationId}
                hoverable
                onClick={() => handleNotifClick(notif)}
                className={`border p-4 flex gap-3 relative transition-all
                  ${notif.isRead 
                    ? 'bg-white border-slate-100' 
                    : 'bg-primary-50/50 border-primary-100'}`}
              >
                <div className={`p-2 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center
                  ${notif.type === 'payment' ? 'bg-success-100 text-success-600' : 'bg-primary-100 text-primary-600'}`}>
                  <Bell size={18} />
                </div>
                
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start">
                    <h5 className={`text-xs font-extrabold ${notif.isRead ? 'text-slate-700' : 'text-slate-800'}`}>
                      {notif.title}
                    </h5>
                    <span className="text-[9px] text-slate-400 shrink-0 ml-1">{notif.createdAt}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-relaxed">
                    {notif.description}
                  </p>
                </div>

                {!notif.isRead && (
                  <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-accent-500 rounded-full" />
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default WorkerNotifications;
