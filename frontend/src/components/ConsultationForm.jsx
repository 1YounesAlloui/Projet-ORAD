import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { X, Save, FileText, Activity, BookOpen, AlertCircle } from 'lucide-react';

const ConsultationForm = ({ appointment, consultation, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        symptoms: '',
        diagnosis: '',
        prescription: '',
        notes: '',
        consultation_date: new Date().toISOString().substring(0, 10),
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (consultation) {
            setFormData({
                symptoms: consultation.symptoms || '',
                diagnosis: consultation.diagnosis || '',
                prescription: consultation.prescription || '',
                notes: consultation.notes || '',
                consultation_date: consultation.consultation_date || new Date().toISOString().substring(0, 10),
            });
        }
    }, [consultation]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (consultation) {
                await api.patch(`consultations/${consultation.id}/`, formData);
                toast.success("Consultation updated successfully!");
            } else {
                await api.post('consultations/', {
                    ...formData,
                    appointment: appointment.id,
                });
                toast.success("Consultation recorded successfully!");
            }
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.non_field_errors?.[0] || 
                        error.response?.data?.appointment?.[0] || 
                        "Failed to save consultation.";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-gradient-to-r from-medical-blue to-sky-600 px-6 py-4 flex justify-between items-center text-white">
                    <div className="flex items-center space-x-2">
                        <FileText className="h-6 w-6" />
                        <h3 className="text-lg font-bold">
                            {consultation ? 'Edit Medical Consultation' : 'New Medical Consultation'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors text-white">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Patient Context Summary */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid grid-cols-2 gap-4 text-sm text-slate-700">
                        <div>
                            <span className="font-semibold text-slate-500 block mb-1">PATIENT</span>
                            <span className="font-bold text-slate-900 text-base">
                                {appointment.patient_nom} {appointment.patient_prenom}
                            </span>
                            <span className="block text-xs text-slate-500 mt-0.5">Age: {appointment.patient_age} yrs • State: {appointment.patient_state}</span>
                        </div>
                        <div>
                            <span className="font-semibold text-slate-500 block mb-1">APPOINTMENT INFO</span>
                            <span className="font-medium text-slate-900 block">Date: {appointment.appointment_date}</span>
                            <span className="text-xs text-slate-500 block">Reason: {appointment.reason || 'General checkup'}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center">
                                <Activity className="h-4 w-4 mr-1.5 text-medical-blue" /> Symptoms
                            </label>
                            <textarea
                                name="symptoms" required rows="3"
                                value={formData.symptoms} onChange={handleChange}
                                placeholder="Describe symptoms experienced by patient..."
                                className="w-full rounded-xl border-slate-200 focus:border-medical-blue focus:ring-medical-blue sm:text-sm p-3 border focus:outline-none"
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center">
                                <BookOpen className="h-4 w-4 mr-1.5 text-emerald-500" /> Diagnosis
                            </label>
                            <textarea
                                name="diagnosis" required rows="3"
                                value={formData.diagnosis} onChange={handleChange}
                                placeholder="Enter diagnosis results..."
                                className="w-full rounded-xl border-slate-200 focus:border-medical-blue focus:ring-medical-blue sm:text-sm p-3 border focus:outline-none"
                            ></textarea>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center">
                            <FileText className="h-4 w-4 mr-1.5 text-amber-500" /> Prescription
                        </label>
                        <textarea
                            name="prescription" required rows="3"
                            value={formData.prescription} onChange={handleChange}
                            placeholder="List medications, dosage, frequency..."
                            className="w-full rounded-xl border-slate-200 focus:border-medical-blue focus:ring-medical-blue sm:text-sm p-3 border focus:outline-none"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1.5 text-slate-500" /> Additional Notes & Recommendations
                        </label>
                        <textarea
                            name="notes" rows="2"
                            value={formData.notes} onChange={handleChange}
                            placeholder="Enter any additional advice or recommendations..."
                            className="w-full rounded-xl border-slate-200 focus:border-medical-blue focus:ring-medical-blue sm:text-sm p-3 border focus:outline-none"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Consultation Date</label>
                        <input
                            type="date" name="consultation_date" required
                            value={formData.consultation_date} onChange={handleChange}
                            className="rounded-xl border-slate-200 focus:border-medical-blue focus:ring-medical-blue sm:text-sm p-2.5 border focus:outline-none bg-white w-full md:w-1/2"
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                        <button
                            type="button" onClick={onClose}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit" disabled={submitting}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-medical-blue to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center disabled:opacity-50"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {submitting ? 'Saving...' : 'Save Consultation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConsultationForm;
