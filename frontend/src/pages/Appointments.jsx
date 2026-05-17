import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Clock, User as UserIcon, CheckCircle, XCircle, FileText, PlusCircle, Eye, Activity, BookOpen, X, Edit, FileDown } from 'lucide-react';
import toast from 'react-hot-toast';
import ConsultationForm from '../components/ConsultationForm';

const Appointments = () => {
    const { user } = useContext(AuthContext);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');
    const [activeConsultationApt, setActiveConsultationApt] = useState(null);
    const [viewingConsultation, setViewingConsultation] = useState(null);
    const [editingConsultation, setEditingConsultation] = useState(null);
    const [fetchingConsult, setFetchingConsult] = useState(false);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await api.get('appointments/');
            setAppointments(response.data);
        } catch (error) {
            console.error("Error fetching appointments", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async (consultationId) => {
        const loadToast = toast.loading("Generating professional PDF...");
        try {
            const response = await api.get(`consultations/${consultationId}/export-pdf/`, {
                responseType: 'blob'
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `ordonnance_${consultationId}.pdf`;
            link.click();
            toast.success("PDF exported successfully!", { id: loadToast });
        } catch (error) {
            console.error("Error exporting PDF", error);
            toast.error("Failed to export PDF", { id: loadToast });
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.patch(`appointments/${id}/`, { status });
            toast.success(`Appointment ${status.toLowerCase()} successfully`);
            fetchAppointments();
        } catch (error) {
            toast.error("Failed to update appointment status");
            console.error("Error updating status", error);
        }
    };

    const handleViewConsultation = async (consultationId) => {
        setFetchingConsult(true);
        try {
            const response = await api.get(`consultations/${consultationId}/`);
            setViewingConsultation(response.data);
        } catch (error) {
            toast.error("Failed to load consultation details.");
        } finally {
            setFetchingConsult(false);
        }
    };

    if (loading) return <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue"></div></div>;

    const filteredAppointments = appointments.filter(apt => {
        if (activeTab === 'ALL') return true;
        return apt.status === activeTab;
    });

    const getStatusBadge = (status) => {
        switch(status) {
            case 'APPROVED': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Approved</span>;
            case 'PENDING_PATIENT': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending (Patient)</span>;
            case 'EN_ATTENTE': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">En Attente</span>;
            case 'REJECTED': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
            default: return null;
        }
    };

    const tabs = [
        { id: 'ALL', label: 'All Appointments' },
        { id: 'PENDING_PATIENT', label: 'Pending Patient' },
        { id: 'EN_ATTENTE', label: 'En Attente' },
        { id: 'APPROVED', label: 'Approved' },
        { id: 'REJECTED', label: 'Rejected' },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Appointments</h1>
            
            <div className="bg-white border-b border-gray-200 mb-6 rounded-t-lg">
                <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === tab.id 
                                    ? 'border-medical-blue text-medical-blue' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {filteredAppointments.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
                    <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No appointments found</h3>
                    <p className="mt-1 text-gray-500">You don't have any {activeTab !== 'ALL' ? activeTab.toLowerCase() : ''} appointments.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredAppointments.map(apt => (
                        <div key={apt.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row md:items-center">
                                <div className="mb-4 md:mb-0 md:mr-8 flex-shrink-0 bg-slate-50 p-4 rounded-lg text-center min-w-[120px]">
                                    <div className="text-sm font-semibold text-medical-blue mb-1">
                                        <Calendar className="inline h-4 w-4 mr-1 mb-0.5" />
                                        {new Date(apt.appointment_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </div>
                                    <div className="text-sm text-gray-600 font-medium">
                                        <Clock className="inline h-3.5 w-3.5 mr-1 mb-0.5" />
                                        {apt.appointment_time.substring(0, 5)}
                                    </div>
                                </div>
                                
                                <div className="md:pl-4">
                                    <div className="flex items-center text-lg">
                                        <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                                        <span className="font-semibold text-gray-900">
                                            {user.role === 'PATIENT' 
                                                ? (apt.doctor_details?.full_name || `Dr. ${apt.doctor_details?.user?.first_name || ''} ${apt.doctor_details?.user?.last_name || 'Unknown'}`) 
                                                : `${apt.patient_nom || ''} ${apt.patient_prenom || ''} (Doctor: ${apt.doctor_details?.full_name || `Dr. ${apt.doctor_details?.user?.first_name || ''} ${apt.doctor_details?.user?.last_name || 'Unknown'}`})`}
                                        </span>
                                    </div>
                                    {apt.reason && (
                                        <div className="text-sm text-gray-600 mt-2 line-clamp-2 bg-slate-50 p-2 rounded border border-slate-100 inline-block">
                                            <span className="font-medium">Reason: </span> {apt.reason}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="mt-6 md:mt-0 flex flex-col items-start md:items-end space-y-3">
                                {getStatusBadge(apt.status)}
                                
                                {apt.status === 'PENDING_PATIENT' && (user.role === 'ASSISTANT' || user.role === 'ADMIN') && (
                                    <div className="flex space-x-2 mt-2">
                                        <button onClick={() => handleUpdateStatus(apt.id, 'EN_ATTENTE')} className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700 transition-colors">
                                            <CheckCircle className="mr-1.5 h-4 w-4" /> Mark En Attente
                                        </button>
                                        <button onClick={() => handleUpdateStatus(apt.id, 'REJECTED')} className="inline-flex items-center px-3 py-1.5 border border-red-200 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors">
                                            <XCircle className="mr-1.5 h-4 w-4" /> Reject
                                        </button>
                                    </div>
                                )}
                                
                                {apt.status === 'EN_ATTENTE' && (user.role === 'DOCTOR' || user.role === 'ADMIN') && (
                                    <div className="flex space-x-2 mt-2">
                                        <button onClick={() => handleUpdateStatus(apt.id, 'APPROVED')} className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition-colors">
                                            <CheckCircle className="mr-1.5 h-4 w-4" /> Accept
                                        </button>
                                        <button onClick={() => handleUpdateStatus(apt.id, 'REJECTED')} className="inline-flex items-center px-3 py-1.5 border border-red-200 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors">
                                            <XCircle className="mr-1.5 h-4 w-4" /> Reject
                                        </button>
                                    </div>
                                )}

                                {user.role === 'ADMIN' && (
                                    <div className="flex space-x-2 mt-2">
                                        {apt.status !== 'APPROVED' && (
                                            <button onClick={() => handleUpdateStatus(apt.id, 'APPROVED')} className="px-2.5 py-1.5 bg-green-100 text-green-800 rounded-md text-xs font-semibold hover:bg-green-200">Force Approve</button>
                                        )}
                                        {apt.status !== 'REJECTED' && (
                                            <button onClick={() => handleUpdateStatus(apt.id, 'REJECTED')} className="px-2.5 py-1.5 bg-red-100 text-red-800 rounded-md text-xs font-semibold hover:bg-red-200">Force Reject</button>
                                        )}
                                    </div>
                                )}

                                {apt.status === 'APPROVED' && (
                                    <div className="flex space-x-2 mt-2">
                                        {apt.consultation_id ? (
                                            <div className="flex space-x-2">
                                                <button 
                                                    onClick={() => handleViewConsultation(apt.consultation_id)} 
                                                    className="inline-flex items-center px-3 py-1.5 border border-slate-200 hover:border-medical-blue hover:text-medical-blue rounded-xl text-slate-700 bg-white transition-all text-xs font-semibold"
                                                >
                                                    <Eye className="mr-1.5 h-4 w-4 text-medical-blue" /> View Consultation
                                                </button>
                                                {(user.role === 'DOCTOR' || user.role === 'ADMIN') && (
                                                    <button 
                                                        onClick={async () => {
                                                            try {
                                                                const response = await api.get(`consultations/${apt.consultation_id}/`);
                                                                setEditingConsultation(response.data);
                                                            } catch (error) {
                                                                toast.error("Failed to load clinical details for editing.");
                                                            }
                                                        }} 
                                                        className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-xl text-white bg-medical-blue hover:bg-sky-600 transition-all text-xs font-semibold"
                                                    >
                                                        <Edit className="mr-1.5 h-4 w-4" /> Edit
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            (user.role === 'DOCTOR' || user.role === 'ADMIN') ? (
                                                <button 
                                                    onClick={() => setActiveConsultationApt(apt)} 
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-xl shadow-sm text-white bg-gradient-to-r from-medical-blue to-sky-600 hover:from-sky-600 hover:to-sky-700 transition-all text-xs font-bold"
                                                >
                                                    <PlusCircle className="mr-1.5 h-4 w-4" /> Create Consultation
                                                </button>
                                            ) : (
                                                <span className="text-xs text-slate-500 font-semibold italic bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">Waiting for doctor diagnostics</span>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Consultation Modal */}
            {activeConsultationApt && (
                <ConsultationForm 
                    appointment={activeConsultationApt} 
                    onClose={() => setActiveConsultationApt(null)} 
                    onSuccess={fetchAppointments}
                />
            )}

            {/* Edit Consultation Modal */}
            {editingConsultation && (
                <ConsultationForm 
                    appointment={editingConsultation.appointment_details}
                    consultation={editingConsultation}
                    onClose={() => setEditingConsultation(null)} 
                    onSuccess={fetchAppointments}
                />
            )}

            {/* View Consultation Modal */}
            {viewingConsultation && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 animate-fade-in">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <FileText className="h-6 w-6 text-medical-blue" />
                                <h3 className="text-lg font-bold text-slate-900">Consultation File</h3>
                            </div>
                            <button onClick={() => setViewingConsultation(null)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-slate-500 font-semibold uppercase text-xs block">Patient</span>
                                    <span className="text-slate-900 font-bold text-base">{viewingConsultation.appointment_details?.patient_nom} {viewingConsultation.appointment_details?.patient_prenom}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 font-semibold uppercase text-xs block">Doctor</span>
                                    <span className="text-slate-900 font-bold text-base">{viewingConsultation.doctor_details?.full_name || `Dr. ${viewingConsultation.doctor_details?.user?.first_name || ''} ${viewingConsultation.doctor_details?.user?.last_name || ''}`}</span>
                                    <span className="text-xs text-medical-blue font-semibold block">{viewingConsultation.doctor_details?.specialty}</span>
                                </div>
                                <div className="col-span-2 pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
                                    Date: {viewingConsultation.consultation_date}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                                    <h4 className="text-sm font-bold text-blue-900 flex items-center mb-1"><Activity className="h-4 w-4 mr-1.5" /> Symptoms</h4>
                                    <p className="text-sm text-blue-950 font-medium whitespace-pre-wrap">{viewingConsultation.symptoms}</p>
                                </div>
                                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                                    <h4 className="text-sm font-bold text-emerald-900 flex items-center mb-1"><BookOpen className="h-4 w-4 mr-1.5" /> Diagnosis</h4>
                                    <p className="text-sm text-emerald-950 font-medium whitespace-pre-wrap">{viewingConsultation.diagnosis}</p>
                                </div>
                                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl">
                                    <h4 className="text-sm font-bold text-amber-900 flex items-center mb-1"><FileText className="h-4 w-4 mr-1.5" /> Prescription</h4>
                                    <p className="text-sm text-amber-950 font-bold font-mono whitespace-pre-wrap">{viewingConsultation.prescription}</p>
                                </div>
                                {viewingConsultation.notes && (
                                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                        <h4 className="text-sm font-bold text-slate-800 mb-1">Additional Notes</h4>
                                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{viewingConsultation.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end space-x-3">
                            <button
                                onClick={() => handleExportPDF(viewingConsultation.id)}
                                className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center shadow-sm"
                            >
                                <FileDown className="h-4 w-4 mr-1.5" /> Export PDF
                            </button>
                            <button onClick={() => setViewingConsultation(null)} className="px-5 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-900 transition-colors">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Appointments;
