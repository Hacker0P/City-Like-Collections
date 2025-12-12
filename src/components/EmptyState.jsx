import React from 'react';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action,
  actionLabel 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
      {Icon && (
        <div className="mb-6 bg-slate-100 p-4 rounded-full">
          <Icon size={48} className="text-slate-400" strokeWidth={1.5} />
        </div>
      )}
      
      {title && (
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          {title}
        </h3>
      )}
      
      {description && (
        <p className="text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
          {description}
        </p>
      )}
      
      {action && actionLabel && (
        <button
          className="px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          onClick={action}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
