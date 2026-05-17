import React from 'react';

const StatCard = ({ name, stat, icon: Icon, color }) => {
    return (
        <div className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow-sm rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <dt>
                <div className={`absolute rounded-xl p-3 ${color} bg-opacity-10`}>
                    <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} aria-hidden="true" />
                </div>
                <p className="ml-16 text-sm font-medium text-gray-500 truncate">{name}</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                <p className="text-3xl font-bold text-gray-900">{stat}</p>
            </dd>
        </div>
    );
};

export default StatCard;
