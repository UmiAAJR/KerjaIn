import React from 'react';

const AuthTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="w-full bg-indigo-50/70 p-1.5 rounded-2xl flex items-center justify-between border border-indigo-100/50">
      <button
        type="button"
        onClick={() => onTabChange('login')}
        className={`flex-1 py-3 text-center text-sm font-bold rounded-xl transition-all duration-200 ${
          activeTab === 'login'
            ? 'bg-white text-primary-700 shadow-sm shadow-indigo-100/50'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        Masuk
      </button>
      <button
        type="button"
        onClick={() => onTabChange('register')}
        className={`flex-1 py-3 text-center text-sm font-bold rounded-xl transition-all duration-200 ${
          activeTab === 'register'
            ? 'bg-white text-primary-700 shadow-sm shadow-indigo-100/50'
            : 'text-slate-500 hover:text-slate-800'
        }`}
      >
        Daftar
      </button>
    </div>
  );
};

export default AuthTabs;
