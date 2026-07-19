import React from 'react';

const Button = ({
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    onClick,
    ...props
}) => {
    const baseStyle = 'inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
        primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/20 focus:ring-primary-500',
        secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-800 focus:ring-slate-400',
        danger: 'bg-accent-600 hover:bg-accent-700 text-white shadow-lg shadow-accent-500/20 focus:ring-accent-500',
        success: 'bg-success-600 hover:bg-success-700 text-white shadow-lg shadow-success-500/20 focus:ring-success-500',
        warning: 'bg-warning-500 hover:bg-warning-600 text-white shadow-lg shadow-warning-500/20 focus:ring-warning-500',
        outline: 'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 focus:ring-primary-500'
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2.5 text-sm',
        lg: 'px-6 py-3.5 text-base'
    };

    return (
        <button
            type={type}
            className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
