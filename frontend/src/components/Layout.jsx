import React, { useContext, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, Stethoscope, User as UserIcon, Calendar, FileText, LogOut, Activity, Menu, X } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { 
            path: '/doctors', 
            label: 'Find Doctors', 
            icon: Stethoscope, 
            show: user?.role === 'PATIENT' || user?.role === 'ADMIN' 
        },
        { 
            path: '/my-profile', 
            label: 'My Profile', 
            icon: UserIcon, 
            show: !!user 
        },
        { path: '/appointments', label: 'Appointments', icon: Calendar },
        { 
            path: '/consultations', 
            label: 'Consultations', 
            icon: FileText, 
            show: user?.role !== 'ASSISTANT' 
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row">
            {/* Desktop Left Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 h-screen sticky top-0 z-30">
                {/* Logo Section */}
                <div className="h-16 flex items-center px-6 border-b border-slate-100">
                    <Activity className="h-6 w-6 text-medical-blue mr-2" />
                    <span className="font-extrabold text-lg tracking-tight text-slate-900">MediBook</span>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        if (item.show === false) return null;
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                    isActive
                                        ? 'bg-blue-50/80 text-medical-blue'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                            >
                                <Icon className={`h-4.5 w-4.5 mr-3 transition-colors ${isActive ? 'text-medical-blue' : 'text-slate-400 group-hover:text-slate-950'}`} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section at the bottom */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 m-4 rounded-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5 overflow-hidden">
                            <div className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center text-medical-blue font-bold text-sm shrink-0">
                                {user?.username?.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold text-slate-800 truncate leading-none">{user?.username}</p>
                                <span className="text-[10px] font-semibold text-slate-400 uppercase mt-0.5 block">{user?.role}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Log Out"
                            className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                        >
                            <LogOut className="h-4.5 w-4.5" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden bg-white border-b border-slate-100 h-16 px-4 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center">
                    <Activity className="h-6 w-6 text-medical-blue mr-2" />
                    <span className="font-extrabold text-lg text-slate-900">MediBook</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
                >
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </header>

            {/* Mobile Drawer menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 top-16 bg-white z-30 flex flex-col justify-between animate-fade-in">
                    <nav className="p-4 space-y-1.5">
                        {navItems.map((item) => {
                            if (item.show === false) return null;
                            const isActive = location.pathname === item.path;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                                        isActive
                                            ? 'bg-blue-50 text-medical-blue'
                                            : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                                >
                                    <Icon className="h-5 w-5 mr-3" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-medical-blue font-bold text-sm">
                                {user?.username?.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">{user?.username}</p>
                                <span className="text-[11px] font-semibold text-slate-400 uppercase block">{user?.role}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center px-4 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                        >
                            <LogOut className="h-4 w-4 mr-1.5" /> Log Out
                        </button>
                    </div>
                </div>
            )}

            {/* Viewport Content */}
            <main className="flex-1 min-w-0 px-4 py-6 md:py-8 sm:px-6 lg:px-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
