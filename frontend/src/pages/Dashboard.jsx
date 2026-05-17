import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Users, Calendar, Activity, Clock, ShieldCheck, Stethoscope, CheckCircle, XCircle, FileText, ArrowRight, PlusCircle, User, RefreshCw, X, TrendingUp, Info, Eye, Clipboard, Edit } from 'lucide-react';
import StatCard from '../components/StatCard';
import api from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import AdminUserManagement from '../components/AdminUserManagement';
import ConsultationForm from '../components/ConsultationForm';
import toast from 'react-hot-toast';

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
};

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await api.get('admin/stats/');
            setStats(response.data);
        } catch (error) {
            console.error("Failed to fetch admin stats", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-medical-blue"></div>
        </div>
    );

    const appointmentData = [
        { name: 'Pending (Patient)', value: stats.appointments.pending_patient || 0, color: '#f59e0b' },
        { name: 'En Attente', value: stats.appointments.en_attente || 0, color: '#3b82f6' },
        { name: 'Approved', value: stats.appointments.approved || 0, color: '#10b981' },
        { name: 'Rejected', value: stats.appointments.rejected || 0, color: '#ef4444' },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header section with refresh button */}
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">System Activity Overview</h2>
                    <p className="text-sm text-slate-500">Real-time database tracking and metrics analysis.</p>
                </div>
                <button 
                    onClick={fetchStats}
                    className="flex items-center text-xs font-bold text-slate-600 hover:text-medical-blue transition-colors bg-slate-50 hover:bg-blue-50 px-4 py-2 rounded-xl border border-slate-100"
                >
                    <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin-hover" /> Refresh Stats
                </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard name="Total Accounts" stat={stats.total_users} icon={Users} color="bg-indigo-500" />
                <StatCard name="Registered Patients" stat={stats.total_patients} icon={Activity} color="bg-medical-blue" />
                <StatCard name="Specialist Doctors" stat={stats.total_doctors} icon={Stethoscope} color="bg-emerald-500" />
                <StatCard name="Total Consultations" stat={stats.total_consultations || 0} icon={FileText} color="bg-rose-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recharts BarChart container */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Appointment Metrics</h3>
                            <p className="text-xs text-slate-500">Breakdown by current workflow status.</p>
                        </div>
                        <span className="flex items-center text-xs text-slate-400 font-semibold bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                            <TrendingUp className="h-3.5 w-3.5 mr-1 text-emerald-500" /> Total Bookings: {stats.appointments.total}
                        </span>
                    </div>
                    <div className="h-68">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={appointmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis allowDecimals={false} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9' }} />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={42}>
                                    {appointmentData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                {/* Premium interactive quick actions */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Administrative Commands</h3>
                        <p className="text-xs text-slate-500 mb-6">Direct access to primary administrative views.</p>
                        
                        <div className="space-y-3.5">
                            <button 
                                onClick={() => {
                                    const element = document.getElementById('user-management-section');
                                    if(element) element.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="w-full p-4 border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-indigo-50/50 hover:border-indigo-100 hover:text-indigo-950 transition-all text-left group"
                            >
                                <div className="flex items-center space-x-3.5">
                                    <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-900 block text-sm">Security Controls</span>
                                        <span className="text-xs text-slate-400">Suspend, activate, or edit accounts</span>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                            </button>

                            <button 
                                onClick={() => navigate('/doctors')}
                                className="w-full p-4 border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-emerald-50/50 hover:border-emerald-100 hover:text-emerald-950 transition-all text-left group"
                            >
                                <div className="flex items-center space-x-3.5">
                                    <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                                        <Stethoscope className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-900 block text-sm">Manage Practitioners</span>
                                        <span className="text-xs text-slate-400">Review doctors and bio schedules</span>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                            </button>

                            <button 
                                onClick={() => navigate('/consultations')}
                                className="w-full p-4 border border-slate-100 rounded-2xl flex items-center justify-between hover:bg-rose-50/50 hover:border-rose-100 hover:text-rose-950 transition-all text-left group"
                            >
                                <div className="flex items-center space-x-3.5">
                                    <div className="bg-rose-50 p-2 rounded-xl text-rose-600 group-hover:bg-rose-100 transition-colors">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-900 block text-sm">Clinical Records</span>
                                        <span className="text-xs text-slate-400">Monitor diagnostics and history</span>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                        <span className="flex items-center"><Info className="h-3.5 w-3.5 mr-1.5 text-medical-blue" /> Admin Mode Active</span>
                        <span>v1.2.0</span>
                    </div>
                </div>
            </div>

            {/* User Management Section */}
            <div id="user-management-section" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">User & Security Management</h3>
                    <p className="text-sm text-slate-500">Edit core user profiles, update permissions, or toggle account status indicators.</p>
                </div>
                <AdminUserManagement />
            </div>
        </div>
    );
};

const AssistantDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const response = await api.get('appointments/');
            setAppointments(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.patch(`appointments/${id}/`, { status });
            toast.success(`Appointment marked as ${status}`);
            fetchAppointments();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-medical-blue"></div>
        </div>
    );

    const pendingAppointments = appointments.filter(a => a.status === 'PENDING_PATIENT');
    const enAttenteAppointments = appointments.filter(a => a.status === 'EN_ATTENTE');

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Quick Stats overview for assistant */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
                    <div className="bg-amber-50 p-3 rounded-2xl text-amber-500">
                        <Clock className="h-8 w-8" />
                    </div>
                    <div>
                        <span className="text-slate-400 font-semibold text-xs uppercase block">New Requests</span>
                        <span className="text-3xl font-extrabold text-slate-900">{pendingAppointments.length}</span>
                        <span className="text-xs text-slate-500 mt-1 block">Awaiting medical screening</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
                    <div className="bg-blue-50 p-3 rounded-2xl text-medical-blue">
                        <Calendar className="h-8 w-8" />
                    </div>
                    <div>
                        <span className="text-slate-400 font-semibold text-xs uppercase block">In Doctor Queue</span>
                        <span className="text-3xl font-extrabold text-slate-900">{enAttenteAppointments.length}</span>
                        <span className="text-xs text-slate-500 mt-1 block">Awaiting doctor review</span>
                    </div>
                </div>
            </div>

            {/* Split layout for screening workflows */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Patient requests screening */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">New Patient Requests</h3>
                        <p className="text-xs text-slate-500">Verify dates and click to route to doctor waiting queue.</p>
                    </div>
                    
                    {pendingAppointments.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                            <CheckCircle className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-slate-500 text-sm font-medium">All clear! No pending patient requests.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingAppointments.map(apt => (
                                <div key={apt.id} className="p-4 border border-amber-100 bg-amber-50/20 rounded-2xl flex flex-col justify-between hover:bg-amber-50/30 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-slate-900">{apt.patient_nom} {apt.patient_prenom}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Assigned to: Dr. {apt.doctor_details?.user?.last_name} ({apt.doctor_details?.specialty})</p>
                                            {apt.reason && <p className="text-xs text-slate-600 mt-2 bg-white/80 p-2 rounded-lg border border-amber-100/50 italic">"{apt.reason}"</p>}
                                        </div>
                                        <div className="text-right text-xs">
                                            <p className="font-bold text-slate-900">{apt.appointment_date}</p>
                                            <p className="text-slate-500 font-semibold mt-0.5">{apt.appointment_time.substring(0, 5)}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <button 
                                            onClick={() => handleStatusUpdate(apt.id, 'EN_ATTENTE')} 
                                            className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1"
                                        >
                                            <CheckCircle className="h-3.5 w-3.5" /> Route to Doctor
                                        </button>
                                        <button 
                                            onClick={() => handleStatusUpdate(apt.id, 'REJECTED')} 
                                            className="px-4.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. Doctor Waiting List */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Awaiting Doctor Approvals</h3>
                        <p className="text-xs text-slate-500">Currently in the medical practitioner queue for review.</p>
                    </div>
                    
                    {enAttenteAppointments.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                            <Clock className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-slate-500 text-sm font-medium">Practitioner queue is empty.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {enAttenteAppointments.map(apt => (
                                <div key={apt.id} className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-slate-900">{apt.patient_nom} {apt.patient_prenom}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">Doctor: Dr. {apt.doctor_details?.user?.last_name} ({apt.doctor_details?.specialty})</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-slate-800">{apt.appointment_date}</p>
                                        <p className="text-xs text-slate-400 font-semibold mt-0.5">{apt.appointment_time.substring(0, 5)}</p>
                                        <span className="inline-block mt-2 px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-blue-50 text-medical-blue rounded-full border border-blue-100">In Queue</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const DoctorDashboard = () => {
    const [stats, setStats] = useState({ upcoming: 0, completed: 0, pending: 0 });
    const [appointments, setAppointments] = useState([]);
    const [activeConsultationApt, setActiveConsultationApt] = useState(null);
    const [editingConsultation, setEditingConsultation] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAppointments = async () => {
        try {
            const response = await api.get('appointments/');
            const data = response.data;
            setAppointments(data);
            setStats({
                upcoming: data.filter(a => a.status === 'APPROVED').length,
                completed: data.filter(a => a.status === 'COMPLETED').length,
                pending: data.filter(a => a.status === 'EN_ATTENTE').length,
            });
        } catch (e) {
            console.error("Failed to load appointments", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleAcceptApt = async (id) => {
        try {
            await api.patch(`appointments/${id}/`, { status: 'APPROVED' });
            toast.success("Appointment approved!");
            fetchAppointments();
        } catch (error) {
            toast.error("Failed to approve appointment.");
        }
    };

    const handleRejectApt = async (id) => {
        try {
            await api.patch(`appointments/${id}/`, { status: 'REJECTED' });
            toast.success("Appointment rejected.");
            fetchAppointments();
        } catch (error) {
            toast.error("Failed to reject appointment.");
        }
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-medical-blue"></div>
        </div>
    );

    const pendingRequests = appointments.filter(a => a.status === 'EN_ATTENTE');
    const upcomingSchedule = appointments.filter(a => a.status === 'APPROVED');

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <StatCard name="Pending Requests" stat={stats.pending} icon={Clock} color="bg-amber-500" />
                <StatCard name="Upcoming Appointments" stat={stats.upcoming} icon={Calendar} color="bg-medical-blue" />
                <StatCard name="Completed Consultations" stat={stats.completed || 0} icon={CheckCircle} color="bg-emerald-500" />
            </div>

            {/* Split Schedule Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 1. Requests Awaiting Doctor Action */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center">
                            <Clock className="mr-2 h-5 w-5 text-amber-500 animate-pulse" /> Pending Approvals ({pendingRequests.length})
                        </h3>
                        <p className="text-xs text-slate-500">Appointments routed from screeners awaiting your clinical review.</p>
                    </div>

                    {pendingRequests.length === 0 ? (
                        <div className="text-center py-16 border border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                            <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
                            <p className="text-slate-500 text-sm font-semibold">Your schedule is fully approved!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingRequests.map(apt => (
                                <div key={apt.id} className="p-4 border border-slate-100 rounded-2xl hover:bg-slate-50/50 transition-all flex flex-col justify-between">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-slate-900">{apt.patient_nom} {apt.patient_prenom}</p>
                                            <p className="text-xs text-slate-500 mt-1"><span className="font-semibold text-slate-700">Reason:</span> {apt.reason}</p>
                                        </div>
                                        <div className="text-right text-xs">
                                            <p className="font-bold text-slate-900">{apt.appointment_date}</p>
                                            <p className="text-slate-500 font-semibold mt-0.5">{apt.appointment_time.substring(0, 5)}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 mt-4">
                                        <button 
                                            onClick={() => handleAcceptApt(apt.id)} 
                                            className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            onClick={() => handleRejectApt(apt.id)} 
                                            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. Doctor Upcoming Schedule */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center">
                            <Calendar className="mr-2 h-5 w-5 text-medical-blue" /> Today's Schedule ({upcomingSchedule.length})
                        </h3>
                        <p className="text-xs text-slate-500">Record diagnostic consultations for patients directly upon schedule completion.</p>
                    </div>

                    {upcomingSchedule.length === 0 ? (
                        <div className="text-center py-16 border border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                            <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-slate-500 text-sm font-medium">No approved appointments listed today.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {upcomingSchedule.map(apt => (
                                <div key={apt.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50/50 transition-colors">
                                    <div>
                                        <p className="font-bold text-slate-900">{apt.patient_nom} {apt.patient_prenom}</p>
                                        <p className="text-xs text-slate-500 mt-1">{apt.appointment_date} @ {apt.appointment_time.substring(0, 5)} - {apt.reason}</p>
                                    </div>
                                    
                                    {apt.consultation_id ? (
                                        <div className="flex items-center space-x-2">
                                            <span className="inline-flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100">
                                                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Diagnostic Filed
                                            </span>
                                            <button 
                                                onClick={async () => {
                                                    try {
                                                        const response = await api.get(`consultations/${apt.consultation_id}/`);
                                                        setEditingConsultation(response.data);
                                                    } catch (error) {
                                                        toast.error("Failed to load details for editing.");
                                                    }
                                                }}
                                                className="inline-flex items-center p-1.5 border border-slate-200 hover:border-medical-blue hover:text-medical-blue rounded-xl text-slate-500 bg-white transition-all text-xs font-bold"
                                                title="Edit Diagnostic Record"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setActiveConsultationApt(apt)}
                                            className="inline-flex items-center px-3.5 py-1.5 bg-gradient-to-r from-medical-blue to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                                        >
                                            <PlusCircle className="h-3.5 w-3.5 mr-1" /> Consultation
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for file consultation details */}
            {activeConsultationApt && (
                <ConsultationForm 
                    appointment={activeConsultationApt} 
                    onClose={() => setActiveConsultationApt(null)} 
                    onSuccess={fetchAppointments}
                />
            )}

            {/* Modal for edit consultation details */}
            {editingConsultation && (
                <ConsultationForm 
                    appointment={editingConsultation.appointment_details}
                    consultation={editingConsultation}
                    onClose={() => setEditingConsultation(null)} 
                    onSuccess={fetchAppointments}
                />
            )}
        </div>
    );
};

const PatientDashboard = () => {
    const [upcoming, setUpcoming] = useState([]);
    const [recentConsultations, setRecentConsultations] = useState([]);
    const [viewingConsultation, setViewingConsultation] = useState(null);
    const [fetchingConsult, setFetchingConsult] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch appointments
                const aptResponse = await api.get('appointments/');
                const upcomingApts = aptResponse.data.filter(a => a.status === 'APPROVED' || a.status === 'PENDING_PATIENT' || a.status === 'EN_ATTENTE');
                setUpcoming(upcomingApts.slice(0, 3));

                // Fetch consultations
                const consultResponse = await api.get('consultations/');
                setRecentConsultations(consultResponse.data.slice(0, 2));
            } catch (e) {
                console.error("Error loading patient dashboard data", e);
            }
        };
        fetchDashboardData();
    }, []);

    const handleViewConsultation = async (consultationId) => {
        setFetchingConsult(true);
        try {
            const response = await api.get(`consultations/${consultationId}/`);
            setViewingConsultation(response.data);
        } catch (error) {
            toast.error("Failed to load clinical details.");
        } finally {
            setFetchingConsult(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Vivid Patient Banner card */}
            <div className="bg-gradient-to-r from-medical-blue to-sky-600 rounded-3xl p-8 text-white shadow-md flex justify-between items-center flex-wrap gap-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-12">
                    <Clipboard size={220} />
                </div>
                <div className="space-y-2.5 z-10 relative">
                    <h2 className="text-2xl font-bold">Need specialist medical care?</h2>
                    <p className="opacity-90 max-w-md text-sm leading-relaxed">Search through our verified specialist doctors directory, choose a day, and secure your schedule immediately.</p>
                </div>
                <Link to="/doctors" className="bg-white text-medical-blue font-bold py-3.5 px-7 rounded-xl shadow-md hover:bg-slate-50 hover:-translate-y-0.5 transition-all text-sm z-10 relative">
                    Find Doctors
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Upcoming Appointments grid */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-slate-900">Your Appointment Schedules</h3>
                    
                    {upcoming.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
                            <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">You have no scheduled appointments.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {upcoming.map(apt => (
                                <div key={apt.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col justify-between h-48">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-blue-50 p-2.5 rounded-xl text-medical-blue">
                                            <Stethoscope className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">Dr. {apt.doctor_details?.user?.last_name}</h4>
                                            <p className="text-[11px] text-medical-blue font-semibold uppercase">{apt.doctor_details?.specialty}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 text-xs text-slate-500 my-3">
                                        <div className="flex items-center font-medium"><Calendar className="h-3.5 w-3.5 mr-2 text-slate-400" /> {apt.appointment_date}</div>
                                        <div className="flex items-center font-medium"><Clock className="h-3.5 w-3.5 mr-2 text-slate-400" /> {apt.appointment_time.substring(0, 5)}</div>
                                    </div>
                                    <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                                        {apt.status === 'PENDING_PATIENT' || apt.status === 'EN_ATTENTE' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-800 border border-yellow-100">Pending Review</span>
                                        ) : apt.status === 'APPROVED' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-800 border border-green-100">Approved</span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-800 border border-red-100">Rejected</span>
                                        )}
                                        {apt.consultation_id && (
                                            <button 
                                                onClick={() => handleViewConsultation(apt.consultation_id)} 
                                                className="text-xs font-bold text-medical-blue hover:text-sky-700 flex items-center"
                                            >
                                                View Diagnostics &rarr;
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. Top specialties / Recent reports sidebar */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900">Clinical Reports</h3>
                    {recentConsultations.length === 0 ? (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center text-slate-400 text-xs py-10 font-semibold italic">
                            No medical logs recorded yet.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentConsultations.map(con => (
                                <div key={con.id} className="bg-white p-4 border border-slate-100 rounded-2xl flex flex-col justify-between hover:bg-slate-50 transition-colors">
                                    <div>
                                        <div className="flex justify-between text-xs text-slate-400 font-semibold mb-1">
                                            <span>Date: {con.consultation_date}</span>
                                            <span className="text-medical-blue uppercase">Dr. {con.doctor_details?.user?.last_name}</span>
                                        </div>
                                        <p className="font-bold text-slate-900 text-sm truncate">{con.diagnosis}</p>
                                    </div>
                                    <button 
                                        onClick={() => handleViewConsultation(con.id)} 
                                        className="text-xs font-bold text-slate-500 hover:text-medical-blue transition-colors self-start mt-3 flex items-center"
                                    >
                                        <Eye className="h-3.5 w-3.5 mr-1" /> View Prescription File
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Read-only Detailed Consultation Modal */}
            {viewingConsultation && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 animate-fade-in">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <FileText className="h-6 w-6 text-medical-blue" />
                                <h3 className="text-lg font-bold text-slate-900">Clinical Consultation Details</h3>
                            </div>
                            <button onClick={() => setViewingConsultation(null)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-slate-500 font-semibold uppercase text-xs block">Patient Account</span>
                                    <span className="text-slate-900 font-bold text-base">{viewingConsultation.appointment_details?.patient_nom} {viewingConsultation.appointment_details?.patient_prenom}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 font-semibold uppercase text-xs block">Consulting Doctor</span>
                                    <span className="text-slate-900 font-bold text-base">Dr. {viewingConsultation.doctor_details?.user?.first_name} {viewingConsultation.doctor_details?.user?.last_name}</span>
                                    <span className="text-xs text-medical-blue font-semibold block">{viewingConsultation.doctor_details?.specialty}</span>
                                </div>
                                <div className="col-span-2 pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
                                    Consultation Date: {viewingConsultation.consultation_date}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                                    <h4 className="text-sm font-bold text-blue-900 flex items-center mb-1"><Activity className="h-4 w-4 mr-1.5" /> Symptoms</h4>
                                    <p className="text-sm text-blue-950 font-medium whitespace-pre-wrap">{viewingConsultation.symptoms}</p>
                                </div>
                                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                                    <h4 className="text-sm font-bold text-emerald-900 flex items-center mb-1"><Clipboard className="h-4 w-4 mr-1.5" /> Diagnosis</h4>
                                    <p className="text-sm text-emerald-950 font-medium whitespace-pre-wrap">{viewingConsultation.diagnosis}</p>
                                </div>
                                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
                                    <h4 className="text-sm font-bold text-amber-900 flex items-center mb-1"><FileText className="h-4 w-4 mr-1.5" /> Prescription Details</h4>
                                    <p className="text-sm text-amber-950 font-bold font-mono whitespace-pre-wrap">{viewingConsultation.prescription}</p>
                                </div>
                                {viewingConsultation.notes && (
                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                        <h4 className="text-sm font-bold text-slate-800 mb-1">Doctor's Clinical Notes</h4>
                                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{viewingConsultation.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
                            <button onClick={() => setViewingConsultation(null)} className="px-5 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-900 transition-colors">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="space-y-6">
            {/* Dynamic visual welcome greeting widget */}
            <div className="relative overflow-hidden bg-white p-6.5 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="absolute right-0 top-0 opacity-5 pointer-events-none transform translate-x-8 -translate-y-8">
                    <User size={150} />
                </div>
                <div className="relative z-10">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-medical-blue bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                        {user?.role} Portal
                    </span>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2.5">
                        {getGreeting()}, {user?.first_name || user?.username}!
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Here is what is happening across your medical center schedules today.</p>
                </div>

                <div className="relative z-10 bg-slate-50/80 backdrop-blur-md px-5 py-3 border border-slate-100 rounded-2xl text-right md:min-w-[180px]">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Today's Date</span>
                    <span className="font-bold text-slate-900 block text-base mt-0.5">
                        {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                </div>
            </div>

            {user?.role === 'ADMIN' && <AdminDashboard />}
            {user?.role === 'DOCTOR' && <DoctorDashboard />}
            {user?.role === 'ASSISTANT' && <AssistantDashboard />}
            {user?.role === 'PATIENT' && <PatientDashboard />}
        </div>
    );
};

export default Dashboard;
