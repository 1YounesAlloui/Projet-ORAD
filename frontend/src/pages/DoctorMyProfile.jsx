import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User as UserIcon, Clock, Plus, Trash2, Save, Edit2, X } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DoctorMyProfile = () => {
    const { user } = useContext(AuthContext);

    // ── Doctor profile ──────────────────────────────────────────
    const [doctor, setDoctor] = useState(null);
    const [loadingDoctor, setLoadingDoctor] = useState(true);
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        specialty: '',
        experience_years: 0,
        consultation_fee: 0,
        bio: '',
    });

    // ── Availabilities ───────────────────────────────────────────
    const [availabilities, setAvailabilities] = useState([]);
    const [newSlot, setNewSlot] = useState({ day_of_week: 0, start_time: '08:00', end_time: '17:00' });
    const [addingSlot, setAddingSlot] = useState(false);

    // ── Fetch doctor profile ──────────────────────────────────────
    const fetchDoctor = async () => {
        try {
            const res = await api.get('doctors/');
            // find the doctor whose user.id matches logged-in user
            const mine = res.data.find(d => d.user.id === user?.id);
            if (mine) {
                setDoctor(mine);
                setProfileForm({
                    specialty: mine.specialty,
                    experience_years: mine.experience_years,
                    consultation_fee: mine.consultation_fee,
                    bio: mine.bio,
                });
                setAvailabilities(mine.availabilities);
            }
        } catch (err) {
            toast.error('Failed to load profile');
        } finally {
            setLoadingDoctor(false);
        }
    };

    useEffect(() => { fetchDoctor(); }, []);

    // ── Profile update ────────────────────────────────────────────
    const handleProfileSave = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`doctors/${doctor.id}/`, profileForm);
            toast.success('Profile updated!');
            setEditingProfile(false);
            fetchDoctor();
        } catch (err) {
            toast.error('Failed to update profile');
        }
    };

    // ── Availability CRUD ─────────────────────────────────────────
    const handleAddSlot = async (e) => {
        e.preventDefault();
        try {
            await api.post('availabilities/', { ...newSlot, doctor: doctor.id });
            toast.success('Availability added!');
            setNewSlot({ day_of_week: 0, start_time: '08:00', end_time: '17:00' });
            setAddingSlot(false);
            fetchDoctor();
        } catch (err) {
            const errMsg = err.response?.data?.non_field_errors?.[0]
                || err.response?.data?.detail
                || 'Failed to add slot (check for duplicates)';
            toast.error(errMsg);
        }
    };

    const handleDeleteSlot = async (id) => {
        if (!window.confirm('Remove this availability slot?')) return;
        try {
            await api.delete(`availabilities/${id}/`);
            toast.success('Slot removed');
            fetchDoctor();
        } catch (err) {
            toast.error('Failed to remove slot');
        }
    };

    if (loadingDoctor) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-medical-blue"></div>
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="text-center py-20 text-gray-500">
                <p className="text-lg font-medium">Doctor profile not found.</p>
                <p className="text-sm mt-1">Please contact an administrator to set up your account.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            </div>

            {/* ── Doctor Info Card ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 rounded-full bg-medical-blue/10 flex items-center justify-center text-medical-blue">
                            <UserIcon size={32} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Dr. {user?.first_name} {user?.last_name}
                            </h2>
                            <p className="text-medical-blue font-medium text-sm">{doctor.specialty}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setEditingProfile(!editingProfile)}
                        className="flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-slate-50 transition-colors"
                    >
                        {editingProfile ? (
                            <><X className="h-4 w-4 mr-2" /> Cancel</>
                        ) : (
                            <><Edit2 className="h-4 w-4 mr-2" /> Edit Profile</>
                        )}
                    </button>
                </div>

                {editingProfile ? (
                    <form onSubmit={handleProfileSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Specialty</label>
                            <input
                                type="text" required
                                value={profileForm.specialty}
                                onChange={e => setProfileForm(p => ({ ...p, specialty: e.target.value }))}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                            <input
                                type="number" min="0" required
                                value={profileForm.experience_years}
                                onChange={e => setProfileForm(p => ({ ...p, experience_years: e.target.value }))}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Consultation Fee ($)</label>
                            <input
                                type="number" min="0" step="0.01" required
                                value={profileForm.consultation_fee}
                                onChange={e => setProfileForm(p => ({ ...p, consultation_fee: e.target.value }))}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Bio</label>
                            <textarea
                                rows="3"
                                value={profileForm.bio}
                                onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm"
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <button
                                type="submit"
                                className="flex items-center px-5 py-2 bg-medical-blue text-white text-sm font-medium rounded-lg hover:bg-sky-600 transition-colors"
                            >
                                <Save className="h-4 w-4 mr-2" /> Save Changes
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-slate-50 rounded-lg p-4">
                            <p className="text-gray-500 mb-1">Experience</p>
                            <p className="font-semibold text-gray-900">{doctor.experience_years} years</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <p className="text-gray-500 mb-1">Consultation Fee</p>
                            <p className="font-semibold text-gray-900">${doctor.consultation_fee}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 md:col-span-1">
                            <p className="text-gray-500 mb-1">Specialty</p>
                            <p className="font-semibold text-gray-900">{doctor.specialty}</p>
                        </div>
                        {doctor.bio && (
                            <div className="bg-slate-50 rounded-lg p-4 md:col-span-3">
                                <p className="text-gray-500 mb-1">Bio</p>
                                <p className="text-gray-700">{doctor.bio}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Availability Management ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-medical-blue" />
                        Weekly Availability
                    </h3>
                    <button
                        onClick={() => setAddingSlot(!addingSlot)}
                        className="flex items-center px-4 py-2 bg-medical-blue text-white text-sm font-medium rounded-lg hover:bg-sky-600 transition-colors"
                    >
                        {addingSlot ? (
                            <><X className="h-4 w-4 mr-2" /> Cancel</>
                        ) : (
                            <><Plus className="h-4 w-4 mr-2" /> Add Slot</>
                        )}
                    </button>
                </div>

                {/* Add slot form */}
                {addingSlot && (
                    <form onSubmit={handleAddSlot} className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-4 text-sm">New Availability Slot</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Day</label>
                                <select
                                    value={newSlot.day_of_week}
                                    onChange={e => setNewSlot(s => ({ ...s, day_of_week: parseInt(e.target.value) }))}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm bg-white"
                                >
                                    {DAYS.map((day, i) => (
                                        <option key={i} value={i}>{day}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                                <input
                                    type="time" required
                                    value={newSlot.start_time}
                                    onChange={e => setNewSlot(s => ({ ...s, start_time: e.target.value }))}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">End Time</label>
                                <input
                                    type="time" required
                                    value={newSlot.end_time}
                                    onChange={e => setNewSlot(s => ({ ...s, end_time: e.target.value }))}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                type="submit"
                                className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Plus className="h-4 w-4 mr-2" /> Add Slot
                            </button>
                        </div>
                    </form>
                )}

                {/* Current availability grid */}
                {availabilities.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                        <Clock className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">No availability set</p>
                        <p className="text-gray-400 text-sm mt-1">Click "Add Slot" to define when you're available.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {/* Group by day for clarity */}
                        {DAYS.map((day, dayIndex) => {
                            const daySlots = availabilities.filter(a => a.day_of_week === dayIndex);
                            if (daySlots.length === 0) return null;
                            return (
                                <div key={dayIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-medical-blue/5 px-4 py-2 border-b border-gray-200">
                                        <p className="font-semibold text-gray-900 text-sm">{day}</p>
                                    </div>
                                    {daySlots.map(slot => (
                                        <div key={slot.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center text-sm text-gray-700">
                                                <Clock className="h-3.5 w-3.5 mr-2 text-gray-400" />
                                                <span>{slot.start_time.substring(0, 5)}</span>
                                                <span className="mx-1 text-gray-400">–</span>
                                                <span>{slot.end_time.substring(0, 5)}</span>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteSlot(slot.id)}
                                                className="text-red-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                                                title="Remove slot"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorMyProfile;
