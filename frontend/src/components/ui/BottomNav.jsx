import React from 'react';
import { LayoutGrid, ClipboardList, Wallet, User } from 'lucide-react';

const defaultTabsList = [
  { id: 'home', label: 'Home', icon: LayoutGrid },
  { id: 'activity', label: 'Activity', icon: ClipboardList },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'profile', label: 'Profile', icon: User }
];

const BottomNav = ({
  tabs = defaultTabsList,
  activeTab = 'home',
  onTabClick
}) => {
  return (
    <nav className="bg-white border-t border-slate-100 px-4 py-2 flex justify-around items-center z-10 shrink-0 w-full select-none shadow-[0_-4px_16px_rgba(15,23,42,0.02)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabClick && onTabClick(tab.id)}
            className="flex flex-col items-center justify-center py-1 flex-1 transition-all duration-200 cursor-pointer focus:outline-none"
          >
            {/* Active filled circle background for the icon */}
            <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300
              ${isActive 
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20 scale-105' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {Icon && <Icon size={20} className="stroke-2" />}
            </div>
            
            {/* Label below the icon */}
            <span className={`text-[10px] font-extrabold mt-1 tracking-wide transition-colors duration-200
              ${isActive ? 'text-primary-800 font-black' : 'text-slate-400'}`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
export { defaultTabsList };
