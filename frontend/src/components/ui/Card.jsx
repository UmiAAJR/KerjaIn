import React from 'react';

const Card = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-100 rounded-2xl p-4 shadow-xs transition-all duration-200 
        ${hoverable ? 'hover:shadow-md hover:border-slate-200 cursor-pointer active:scale-[0.99]' : ''} 
        ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
