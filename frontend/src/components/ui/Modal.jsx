import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    className = ''
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Content Container */}
            <div className={`relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 overflow-hidden transform transition-all duration-300 max-h-[90vh] flex flex-col ${className}`}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    {title && (
                        <h3 className="text-base font-bold text-slate-800 font-heading">
                            {title}
                        </h3>
                    )}
                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="px-6 py-5 overflow-y-auto flex-grow">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
