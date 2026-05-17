import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FileText, Search, Calendar, User, UserCheck, Stethoscope, Eye, X, BookOpen, Clock, Activity, Edit } from 'lucide-react';
import ConsultationForm from '../components/ConsultationForm';

const Consultations = () => {
    const { user } = useContext(AuthContext);
    const [consultations, setConsultations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedConsultation, setSelectedConsultation] = useState(null);
    const [editingConsultation, setEditingConsultation] = useState(null);

    const fetchConsultations = async () => {
        try {
            const response = await api.get('consultations/');
            setConsultations(response.data);
        } catch (error) {
            toast.error("Failed to fetch consultations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConsultations();
    }, []);

    const filteredConsultations = consultations.filter(item => {
        const patientName = `${item.patient_details?.user?.first_name || ''} ${item.patient_details?.user?.last_name || ''}`.toLowerCase();
        const patientFormName = `${item.appointment_details?.patient_nom || ''} ${item.appointment_details?.patient_prenom || ''}`.toLowerCase();
        const doctorName = (item.doctor_details?.full_name || `Dr. ${item.doctor_details?.user?.first_name || ''} ${item.doctor_details?.user?.last_name || ''}`).toLowerCase();
        const diagnosis = item.diagnosis.toLowerCase();
        const search = searchTerm.toLowerCase();

        return patientName.includes(search) || 
               patientFormName.includes(search) || 
               doctorName.includes(search) || 
               diagnosis.includes(search);
    });

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-medical-blue"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Consultation History</h1>
                    <p className="text-gray-500 mt-1">Review medical files, diagnoses, and prescriptions.</p>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name, doctor, diagnosis..."
                        className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-medical-blue focus:border-medical-blue sm:text-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List/Table */}
            {filteredConsultations.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">No consultations found</h3>
                    <p className="text-slate-500 mt-1">There are no consultations recorded matching your request.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                    {user?.role !== 'PATIENT' && (
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                                    )}
                                    {user?.role !== 'DOCTOR' && (
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
                                    )}
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Diagnosis</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Prescription</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {filteredConsultations.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="h-4 w-4 text-slate-400" />
                                                <span>{item.consultation_date}</span>
                                            </div>
                                        </td>
                                        {user?.role !== 'PATIENT' && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                                <div className="flex items-center space-x-2">
                                                    <User className="h-4 w-4 text-slate-400" />
                                                    <span>
                                                        {item.appointment_details?.patient_nom} {item.appointment_details?.patient_prenom}
                                                    </span>
                                                </div>
                                            </td>
                                        )}
                                        {user?.role !== 'DOCTOR' && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <Stethoscope className="h-4 w-4 text-medical-blue" />
                                                     <span>{item.doctor_details?.full_name || `Dr. ${item.doctor_details?.user?.first_name || ''} ${item.doctor_details?.user?.last_name || ''}`}</span>
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate font-medium">
                                            {item.diagnosis}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                                            {item.prescription}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => setSelectedConsultation(item)}
                                                className="inline-flex items-center px-3 py-1.5 border border-slate-200 hover:border-medical-blue hover:text-medical-blue rounded-xl text-slate-600 bg-white transition-all text-xs font-semibold"
                                            >
                                                <Eye className="h-3.5 w-3.5 mr-1" /> View Details
                                            </button>
                                            {(user?.role === 'DOCTOR' || user?.role === 'ADMIN') && (
                                                <button
                                                    onClick={() => setEditingConsultation(item)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-xl text-white bg-medical-blue hover:bg-sky-600 transition-all text-xs font-semibold"
                                                >
                                                    <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {selectedConsultation && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100">
                        {/* Modal Header */}
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <FileText className="h-6 w-6 text-medical-blue" />
                                <h3 className="text-lg font-bold text-slate-900">Consultation Details</h3>
                            </div>
                            <button
                                onClick={() => setSelectedConsultation(null)}
                                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm">
                                <div className="space-y-1">
                                    <span className="text-slate-500 font-semibold uppercase text-xs block">Patient</span>
                                    <span className="text-slate-900 font-bold text-base flex items-center">
                                        <UserCheck className="h-4 w-4 mr-1 text-slate-400" />
                                        {selectedConsultation.appointment_details?.patient_nom} {selectedConsultation.appointment_details?.patient_prenom}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-slate-500 font-semibold uppercase text-xs block">Doctor</span>
                                    <span className="text-slate-900 font-bold text-base flex items-center">
                                        <Stethoscope className="h-4 w-4 mr-1 text-medical-blue" />
                                         {selectedConsultation.doctor_details?.full_name || `Dr. ${selectedConsultation.doctor_details?.user?.first_name || ''} ${selectedConsultation.doctor_details?.user?.last_name || ''}`}
                                    </span>
                                    <span className="text-xs text-medical-blue font-semibold">{selectedConsultation.doctor_details?.specialty}</span>
                                </div>
                                <div className="col-span-2 pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-4 text-xs text-slate-500 font-medium">
                                    <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1" /> Consultation Date: {selectedConsultation.consultation_date}</span>
                                    <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1" /> Recorded At: {new Date(selectedConsultation.created_at).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Medical Information Sections */}
                            <div className="space-y-4">
                                <div className="space-y-1 bg-blue-50/50 p-4 rounded-xl border border-blue-100/60">
                                    <h4 className="text-sm font-bold text-blue-900 flex items-center">
                                        <Activity className="h-4 w-4 mr-1.5" /> Symptoms
                                    </h4>
                                    <p className="text-sm text-blue-950 font-medium whitespace-pre-wrap">{selectedConsultation.symptoms}</p>
                                </div>

                                <div className="space-y-1 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/60">
                                    <h4 className="text-sm font-bold text-emerald-900 flex items-center">
                                        <BookOpen className="h-4 w-4 mr-1.5" /> Diagnosis
                                    </h4>
                                    <p className="text-sm text-emerald-950 font-medium whitespace-pre-wrap">{selectedConsultation.diagnosis}</p>
                                </div>

                                <div className="space-y-1 bg-amber-50/50 p-4 rounded-xl border border-amber-100/60">
                                    <h4 className="text-sm font-bold text-amber-900 flex items-center">
                                        <FileText className="h-4 w-4 mr-1.5" /> Prescription
                                    </h4>
                                    <p className="text-sm text-amber-950 font-bold whitespace-pre-wrap font-mono">{selectedConsultation.prescription}</p>
                                </div>

                                {selectedConsultation.notes && (
                                    <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <h4 className="text-sm font-bold text-slate-800">Additional Notes & Recommendations</h4>
                                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{selectedConsultation.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center">
                            {(user?.role === 'DOCTOR' || user?.role === 'ADMIN') ? (
                                <button
                                    onClick={() => {
                                        setEditingConsultation(selectedConsultation);
                                        setSelectedConsultation(null);
                                    }}
                                    className="px-5 py-2 rounded-xl bg-medical-blue text-white text-sm font-semibold hover:bg-sky-600 transition-colors flex items-center"
                                >
                                    <Edit className="h-4 w-4 mr-1.5" /> Edit Consultation
                                </button>
                            ) : <div></div>}
                            <button
                                onClick={() => setSelectedConsultation(null)}
                                className="px-5 py-2 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-900 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editingConsultation && (
                <ConsultationForm 
                    appointment={editingConsultation.appointment_details}
                    consultation={editingConsultation}
                    onClose={() => setEditingConsultation(null)}
                    onSuccess={fetchConsultations}
                />
            )}
        </div>
    );
};

export default Consultations;
