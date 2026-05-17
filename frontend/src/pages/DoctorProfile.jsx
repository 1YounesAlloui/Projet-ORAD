import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { User as UserIcon, Calendar as CalendarIcon, Clock, ChevronLeft } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const DoctorProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Patient list for Admin Booking
    const [patientsList, setPatientsList] = useState([]);
    
    const [bookingData, setBookingData] = useState({
        patient: '', // user ID for admins
        patient_nom: '',
        patient_prenom: '',
        patient_age: '',
        patient_phone: '',
        patient_state: '',
        appointment_date: '',
        appointment_time: '',
        reason: ''
    });
    
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [bookingError, setBookingError] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState('');

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const response = await api.get(`doctors/${id}/`);
                setDoctor(response.data);
            } catch (error) {
                console.error("Error fetching doctor", error);
            } finally {
                setLoading(false);
            }
        };
        
        const fetchPatients = async () => {
            if (user?.role === 'ADMIN') {
                try {
                    const response = await api.get('user-management/');
                    setPatientsList(response.data.filter(u => u.role === 'PATIENT'));
                } catch (error) {
                    console.error("Error fetching patients list", error);
                }
            }
        };

        fetchDoctor();
        fetchPatients();
    }, [id, user]);

    // Pre-populate patient details if user is patient
    useEffect(() => {
        if (user && user.role === 'PATIENT') {
            setBookingData(prev => ({
                ...prev,
                patient_nom: user.last_name || '',
                patient_prenom: user.first_name || '',
                patient_phone: user.phone_number || ''
            }));
        }
    }, [user]);

    const handleBookingChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'patient' && value) {
            // Admin selected a patient - prefill their name
            const selectedPatient = patientsList.find(p => p.id === parseInt(value));
            if (selectedPatient) {
                setBookingData(prev => ({
                    ...prev,
                    patient: value,
                    patient_nom: selectedPatient.last_name || '',
                    patient_prenom: selectedPatient.first_name || '',
                    patient_phone: selectedPatient.phone_number || ''
                }));
                return;
            }
        }

        setBookingData(prev => ({ ...prev, [name]: value }));
        
        // If date changes, generate time slots based on availability
        if (name === 'appointment_date' && doctor) {
            generateTimeSlots(value);
        }
    };

    const generateTimeSlots = (dateString) => {
        const selectedDate = new Date(dateString);
        let dayOfWeek = selectedDate.getDay() - 1;
        if (dayOfWeek === -1) dayOfWeek = 6; // Sunday
        
        const availability = doctor.availabilities.find(a => a.day_of_week === dayOfWeek);
        
        if (!availability) {
            setAvailableTimeSlots([]);
            setBookingData(prev => ({ ...prev, appointment_time: '' }));
            return;
        }

        const slots = [];
        let current = new Date(`1970-01-01T${availability.start_time}`);
        const end = new Date(`1970-01-01T${availability.end_time}`);

        while (current < end) {
            slots.push(current.toTimeString().substring(0, 5));
            current.setMinutes(current.getMinutes() + 30);
        }
        
        setAvailableTimeSlots(slots);
        setBookingData(prev => ({ ...prev, appointment_time: '' }));
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        setBookingError('');
        setBookingSuccess('');
        
        try {
            await api.post('appointments/', {
                ...bookingData,
                doctor: doctor.id
            });
            toast.success('Appointment booked successfully!');
            setBookingSuccess('Appointment booked successfully!');
            setBookingData({
                patient: '',
                patient_nom: '',
                patient_prenom: '',
                patient_age: '',
                patient_phone: '',
                patient_state: '',
                appointment_date: '',
                appointment_time: '',
                reason: ''
            });
            setTimeout(() => navigate('/appointments'), 1500);
        } catch (error) {
            const msg = error.response?.data?.non_field_errors?.[0] || 'Failed to book appointment';
            toast.error(msg);
            setBookingError(msg);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-medical-blue"></div></div>;
    if (!doctor) return <div className="text-center py-20 text-gray-500">Doctor not found.</div>;

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <div className="space-y-6">
            <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                <ChevronLeft className="h-4 w-4 mr-1" /> Back to List
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Doctor Bio Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex flex-col items-center">
                        <div className="h-24 w-24 rounded-full bg-medical-blue/10 flex items-center justify-center text-medical-blue mb-4">
                            <UserIcon size={48} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">{doctor.full_name || `Dr. ${doctor.user.first_name || ''} ${doctor.user.last_name || ''}`}</h2>
                        <p className="text-medical-blue font-semibold mt-1 uppercase text-sm tracking-wider">{doctor.specialty}</p>
                        
                        <div className="w-full mt-6 border-t border-slate-100 pt-6 space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Experience</span>
                                <span className="font-bold text-slate-900">{doctor.experience_years} Years</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500 font-medium">Consultation Fee</span>
                                <span className="font-bold text-slate-900">{doctor.consultation_fee} DA</span>
                            </div>
                            {doctor.bio && (
                                <div className="pt-2">
                                    <span className="text-slate-500 font-semibold block mb-1">About</span>
                                    <p className="text-slate-600 italic">"{doctor.bio}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {/* Availability card */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Clock className="mr-2 h-5 w-5 text-medical-blue" />
                            Availability Schedule
                        </h3>
                        {doctor.availabilities.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {doctor.availabilities.map(av => (
                                    <div key={av.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                                        <div className="font-semibold text-slate-950">{daysOfWeek[av.day_of_week]}</div>
                                        <div className="text-sm text-slate-500 mt-1">
                                            {av.start_time.substring(0, 5)} - {av.end_time.substring(0, 5)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500">No schedule set by doctor.</p>
                        )}
                    </div>

                    {/* Booking Form (Available to PATIENTS and ADMINS) */}
                    {(user?.role === 'PATIENT' || user?.role === 'ADMIN') && (
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                <CalendarIcon className="mr-2 h-5 w-5 text-medical-blue" />
                                Book Appointment {user.role === 'ADMIN' && '(Admin Override Mode)'}
                            </h3>
                            
                            {bookingSuccess && (
                                <div className="mb-4 bg-green-50 border border-green-100 text-green-700 p-3 rounded-xl text-sm font-semibold">{bookingSuccess}</div>
                            )}
                            {bookingError && (
                                <div className="mb-4 bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl text-sm font-semibold">{bookingError}</div>
                            )}
                            
                            <form onSubmit={handleBookingSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {user.role === 'ADMIN' && (
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Select Patient User Profile</label>
                                            <select 
                                                name="patient" 
                                                required 
                                                value={bookingData.patient} 
                                                onChange={handleBookingChange} 
                                                className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-medical-blue focus:ring-medical-blue sm:text-sm p-2.5 border bg-white focus:outline-none"
                                            >
                                                <option value="">-- Choose Patient Account --</option>
                                                {patientsList.map(p => (
                                                    <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.username})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700">Nom (Last Name)</label>
                                        <input type="text" name="patient_nom" required value={bookingData.patient_nom} onChange={handleBookingChange} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm p-2.5 border focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700">Prénom (First Name)</label>
                                        <input type="text" name="patient_prenom" required value={bookingData.patient_prenom} onChange={handleBookingChange} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm p-2.5 border focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700">Age</label>
                                        <input type="number" name="patient_age" required min="0" value={bookingData.patient_age} onChange={handleBookingChange} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm p-2.5 border focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700">Phone Number</label>
                                        <input type="tel" name="patient_phone" required value={bookingData.patient_phone} onChange={handleBookingChange} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm p-2.5 border focus:outline-none" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-slate-700">State / Location</label>
                                        <input type="text" name="patient_state" required value={bookingData.patient_state} onChange={handleBookingChange} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm p-2.5 border focus:outline-none" />
                                    </div>
                                </div>
                                
                                <hr className="border-slate-100 my-4" />
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700">Date</label>
                                        <input type="date" name="appointment_date" required value={bookingData.appointment_date} onChange={handleBookingChange} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm p-2.5 border focus:outline-none bg-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700">Time Slot</label>
                                        <select name="appointment_time" required value={bookingData.appointment_time} onChange={handleBookingChange} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm bg-white p-2.5 border focus:outline-none" disabled={!bookingData.appointment_date || availableTimeSlots.length === 0}>
                                            <option value="">Select a time</option>
                                            {availableTimeSlots.map(time => (
                                                <option key={time} value={time}>{time}</option>
                                            ))}
                                        </select>
                                        {bookingData.appointment_date && availableTimeSlots.length === 0 && (
                                            <p className="text-xs text-red-500 mt-1 font-semibold">Doctor is not available on this date.</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700">Reason for visit</label>
                                    <textarea name="reason" rows="3" value={bookingData.reason} onChange={handleBookingChange} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm p-2.5 border focus:outline-none"></textarea>
                                </div>
                                <button 
                                    type="submit" 
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-medical-blue to-sky-600 hover:from-sky-600 hover:to-sky-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-blue"
                                >
                                    Confirm Booking
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;
