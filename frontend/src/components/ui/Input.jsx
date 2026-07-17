import React from 'react';

const Input = ({
  label,
  type = 'text',
  placeholder,
  error,
  icon: Icon,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-600 font-heading">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-slate-400">
            <Icon size={18} />
          </div>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          className={`w-full font-medium text-sm border bg-white rounded-xl py-2.5 transition-all duration-200 focus:outline-none focus:ring-2
            ${Icon ? 'pl-10' : 'pl-4'} pr-4
            ${error 
              ? 'border-accent-500 focus:border-accent-500 focus:ring-accent-100' 
              : 'border-slate-200 focus:border-primary-500 focus:ring-primary-100'
            }`}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs font-medium text-accent-600">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
