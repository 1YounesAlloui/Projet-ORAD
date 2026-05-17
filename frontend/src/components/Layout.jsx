import React, { useContext } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Activity, LogOut, User as UserIcon, Calendar } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Activity className="h-8 w-8 text-medical-blue" />
                                <span className="ml-2 font-bold text-xl text-medical-dark">MediBook</span>
                            </div>
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                <Link to="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    Dashboard
                                </Link>
                                {(user?.role === 'PATIENT' || user?.role === 'ADMIN') && (
                                    <Link to="/doctors" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                        Find Doctors
                                    </Link>
                                )}
                                {user?.role === 'DOCTOR' && (
                                    <Link to="/my-profile" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                        My Profile
                                    </Link>
                                )}
                                <Link to="/appointments" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    Appointments
                                </Link>
                                {user?.role !== 'ASSISTANT' && (
                                    <Link to="/consultations" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                        Consultations
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="flex-shrink-0 relative flex items-center space-x-4">
                                <div className="text-sm font-medium text-gray-700 flex items-center">
                                    <UserIcon className="h-5 w-5 mr-1 text-gray-400" />
                                    {user?.username} ({user?.role})
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 max-w-7xl w-full mx-auto py-6 sm:px-6 lg:px-8">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
