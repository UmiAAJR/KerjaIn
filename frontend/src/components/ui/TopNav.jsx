
import { MapPin, Bell } from 'lucide-react';

const TopNav = ({
  variant = 'location', // 'location' | 'brand'
  locationName = 'Sudirman, Jakarta Selatan',
  brandName = 'KerjaIn',
  hasNotification = false,
  onNotificationClick,
  onLocationClick
}) => {
  return (
    <header className="bg-white border-b border-slate-100 px-5 py-3 flex items-center justify-between shrink-0 w-full select-none">
      {variant === 'location' ? (
        /* Location Variant */
        <div 
          onClick={onLocationClick}
          className={`flex items-center gap-3 cursor-pointer group transition-all`}
        >
          <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-primary-600 border border-slate-100 group-hover:bg-primary-50 transition-colors">
            <MapPin size={18} className="stroke-2" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 tracking-wider">
              Lokasi Saat Ini
            </span>
            <span className="block text-xs font-black text-slate-700 font-heading leading-tight group-hover:text-primary-700 transition-colors">
              {locationName}
            </span>
          </div>
        </div>
      ) : (
        /* Brand Variant */
        <div className="flex items-center gap-2">
          <div className="text-primary-600">
            <MapPin size={22} fill="currentColor" className="text-primary-600 fill-primary-100 stroke-2" />
          </div>
          <h1 className="text-lg font-black text-slate-800 font-heading tracking-tight">
            {brandName}
          </h1>
        </div>
      )}

      {/* Notification Icon */}
      <button
        type="button"
        onClick={onNotificationClick}
        className="p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl relative transition-all active:scale-95 border border-transparent hover:border-slate-100"
      >
        <Bell size={20} className="stroke-2" />
        {hasNotification && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
        )}
      </button>
    </header>
  );
};

export default TopNav;
