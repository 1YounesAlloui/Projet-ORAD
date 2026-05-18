import React from 'react';

const StatCard = ({ name, stat, icon: Icon, color }) => {
    // Get text color class based on background class
    const textColor = color.replace('bg-', 'text-');
    
    return (
        <div className="relative bg-white p-6 border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:shadow-slate-100/30 transition-all duration-200 flex items-center space-x-4">
            <div className={`p-3.5 rounded-2xl ${color} bg-opacity-8/90 ${textColor} shrink-0`}>
                <Icon className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">{name}</p>
                <h4 className="text-2xl font-black text-slate-800 mt-1 leading-none">{stat}</h4>
            </div>
        </div>
    );
};

export default StatCard;
