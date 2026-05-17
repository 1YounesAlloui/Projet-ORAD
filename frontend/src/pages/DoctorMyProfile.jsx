import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User as UserIcon, Clock, Plus, Trash2, Save, Edit2, X } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DoctorMyProfile = () => {
    const { user, setUser } = useContext(AuthContext);

    // ── Doctor profile ──────────────────────────────────────────
    const [doctor, setDoctor] = useState(null);
    const [loadingDoctor, setLoadingDoctor] = useState(true);
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        specialty: '',
        experience_years: 0,
        consultation_fee: 0,
        bio: '',
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        email: user?.email || '',
        phone_number: user?.phone_number || '',
        password: '',
        confirm_password: ''
    });

    // ── User account state ───────────────────────────────────────────
    const [editingUser, setEditingUser] = useState(false);
    const [userForm, setUserForm] = useState({
        first_name: user?.first_name || '',
        last_name: user?.last_name || '',
        username: user?.username || '',
        email: user?.email || '',
        phone_number: user?.phone_number || '',
        password: '',
        password_confirm: '',
        date_of_birth: user?.patient_profile?.date_of_birth || '',
        address: user?.patient_profile?.address || '',
        medical_history: user?.patient_profile?.medical_history || ''
    });

    useEffect(() => {
        if (user) {
            setUserForm({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                username: user.username || '',
                email: user.email || '',
                phone_number: user.phone_number || '',
                password: '',
                password_confirm: '',
                date_of_birth: user.patient_profile?.date_of_birth || '',
                address: user.patient_profile?.address || '',
                medical_history: user.patient_profile?.medical_history || ''
            });
            setProfileForm(pf => ({
                ...pf,
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone_number: user.phone_number || '',
            }));
        }
    }, [user]);

    // ── Availabilities ───────────────────────────────────────────
    const [availabilities, setAvailabilities] = useState([]);
    const [newSlot, setNewSlot] = useState({ day_of_week: 0, start_time: '08:00', end_time: '17:00' });
    const [addingSlot, setAddingSlot] = useState(false);

    // ── Fetch doctor profile ──────────────────────────────────────
    const fetchDoctor = async () => {
        if (user?.role !== 'DOCTOR') {
            setLoadingDoctor(false);
            return;
        }
        try {
            const res = await api.get('doctors/');
            const mine = res.data.find(d => d.user.id === user?.id);
            if (mine) {
                setDoctor(mine);
                setProfileForm({
                    specialty: mine.specialty,
                    experience_years: mine.experience_years,
                    consultation_fee: mine.consultation_fee,
                    bio: mine.bio,
                    first_name: user?.first_name || '',
                    last_name: user?.last_name || '',
                    email: user?.email || '',
                    phone_number: user?.phone_number || '',
                    password: '',
                    confirm_password: ''
                });
                setAvailabilities(mine.availabilities);
            }
        } catch (err) {
            toast.error('Failed to load profile');
        } finally {
            setLoadingDoctor(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchDoctor();
        }
    }, [user]);

    // ── Profile update ────────────────────────────────────────────
    const handleProfileSave = async (e) => {
        e.preventDefault();
        if (profileForm.password && profileForm.password !== profileForm.confirm_password) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            // 1. Update Core User Details
            const userPayload = {
                first_name: profileForm.first_name,
                last_name: profileForm.last_name,
                email: profileForm.email,
                phone_number: profileForm.phone_number,
                username: user?.username,
                password: profileForm.password,
                password_confirm: profileForm.confirm_password,
            };
            if (profileForm.password) {
                userPayload.password = profileForm.password;
                userPayload.password_confirm = profileForm.confirm_password;
            }
            const userRes = await api.patch('me/', userPayload);
            setUser(userRes.data);

            // 2. Update Doctor Clinical Details
            const doctorPayload = {
                user: {
                    first_name: profileForm.first_name,
                    last_name: profileForm.last_name,
                    email: profileForm.email,
                    phone_number: profileForm.phone_number,
                    username: user?.username,
                    password: profileForm.password,
                    password_confirm: profileForm.confirm_password
                },
                specialty: profileForm.specialty,
                experience_years: profileForm.experience_years,
                consultation_fee: profileForm.consultation_fee,
                bio: profileForm.bio,
            };
            await api.patch(`doctors/${doctor.id}/`, doctorPayload);

            toast.success('Clinical profile updated!');
            setEditingProfile(false);
            fetchDoctor();
        } catch (err) {
            const data = err.response?.data;
            if (data) {
                const messages = Object.entries(data)
                    .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : val}`)
                    .join(' | ');
                toast.error(messages);
            } else {
                toast.error('Failed to update profile details');
            }
        }
    };

    // ── Core User Account update ──────────────────────────────────
    const handleUserSave = async (e) => {
        e.preventDefault();
        if (userForm.password && userForm.password !== userForm.password_confirm) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            const payload = { ...userForm };
            if (!payload.password) {
                delete payload.password;
                delete payload.password_confirm;
            }

            // Clean up empty Patient fields if they are sent for a non-patient
            if (user?.role !== 'PATIENT') {
                delete payload.date_of_birth;
                delete payload.address;
                delete payload.medical_history;
            }

            const res = await api.patch('me/', payload);
            toast.success('Account details updated!');
            setUser(res.data);
            setEditingUser(false);
        } catch (err) {
            const data = err.response?.data;
            if (data) {
                const messages = Object.entries(data)
                    .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : val}`)
                    .join(' | ');
                toast.error(messages);
            } else {
                toast.error('Failed to update account details');
            }
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

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* ── Header ── */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            </div>

            {/* ── Core Account Info Card ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 rounded-full bg-medical-blue/10 flex items-center justify-center text-medical-blue">
                            <UserIcon size={32} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                {user?.first_name} {user?.last_name}
                            </h2>
                            <p className="text-slate-500 text-sm">Role: <span className="font-semibold text-medical-blue">{user?.role}</span></p>
                        </div>
                    </div>
                    <button
                        onClick={() => setEditingUser(!editingUser)}
                        className="flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-slate-50 transition-colors"
                    >
                        {editingUser ? (
                            <><X className="h-4 w-4 mr-2" /> Cancel</>
                        ) : (
                            <><Edit2 className="h-4 w-4 mr-2" /> Edit Profile</>
                        )}
                    </button>
                </div>

                {editingUser ? (
                    <form onSubmit={handleUserSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <input
                                type="text" required
                                value={userForm.first_name}
                                onChange={e => setUserForm(p => ({ ...p, first_name: e.target.value }))}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <input
                                type="text" required
                                value={userForm.last_name}
                                onChange={e => setUserForm(p => ({ ...p, last_name: e.target.value }))}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <input
                                type="text" required
                                value={userForm.username}
                                onChange={e => setUserForm(p => ({ ...p, username: e.target.value }))}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input
                                type="email" required
                                value={userForm.email}
                                onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input
                                type="text"
                                value={userForm.phone_number}
                                onChange={e => setUserForm(p => ({ ...p, phone_number: e.target.value }))}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm"
                            />
                        </div>

                        {/* Patient-specific fields */}
                        {user?.role === 'PATIENT' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={userForm.date_of_birth}
                                        onChange={e => setUserForm(p => ({ ...p, date_of_birth: e.target.value }))}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Address</label>
                                    <input
                                        type="text"
                                        value={userForm.address}
                                        onChange={e => setUserForm(p => ({ ...p, address: e.target.value }))}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Medical History</label>
                                    <textarea
                                        rows="3"
                                        value={userForm.medical_history}
                                        onChange={e => setUserForm(p => ({ ...p, medical_history: e.target.value }))}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm"
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Password (leave blank to keep current)</label>
                            <input
                                type="password"
                                value={userForm.password}
                                onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                            <input
                                type="password"
                                value={userForm.password_confirm}
                                onChange={e => setUserForm(p => ({ ...p, password_confirm: e.target.value }))}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-slate-50 rounded-lg p-4">
                            <p className="text-gray-500 mb-1">First Name</p>
                            <p className="font-semibold text-gray-900">{user?.first_name || 'N/A'}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <p className="text-gray-500 mb-1">Last Name</p>
                            <p className="font-semibold text-gray-900">{user?.last_name || 'N/A'}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <p className="text-gray-500 mb-1">Username</p>
                            <p className="font-semibold text-gray-900">{user?.username}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <p className="text-gray-500 mb-1">Email Address</p>
                            <p className="font-semibold text-gray-900">{user?.email}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 md:col-span-2">
                            <p className="text-gray-500 mb-1">Phone Number</p>
                            <p className="font-semibold text-gray-900">{user?.phone_number || 'N/A'}</p>
                        </div>

                        {/* Patient-specific details */}
                        {user?.role === 'PATIENT' && (
                            <>
                                <div className="bg-slate-50 rounded-lg p-4">
                                    <p className="text-gray-500 mb-1">Date of Birth</p>
                                    <p className="font-semibold text-gray-900">{user?.patient_profile?.date_of_birth || 'N/A'}</p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-4">
                                    <p className="text-gray-500 mb-1">Address</p>
                                    <p className="font-semibold text-gray-900">{user?.patient_profile?.address || 'N/A'}</p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-4 md:col-span-2">
                                    <p className="text-gray-500 mb-1">Medical History</p>
                                    <p className="font-semibold text-gray-700 whitespace-pre-line">{user?.patient_profile?.medical_history || 'No medical history recorded.'}</p>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* ── Doctor Clinical Info Card (DOCTOR ONLY) ── */}
            {user?.role === 'DOCTOR' && (
                doctor ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Clinical Profile</h3>
                            <button
                                onClick={() => setEditingProfile(!editingProfile)}
                                className="flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-slate-50 transition-colors"
                            >
                                {editingProfile ? (
                                    <><X className="h-4 w-4 mr-2" /> Cancel</>
                                ) : (
                                    <><Edit2 className="h-4 w-4 mr-2" /> Edit Details</>
                                )}
                            </button>
                        </div>

                        {editingProfile ? (
                            <form onSubmit={handleProfileSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                                    <input
                                        type="text" required
                                        value={profileForm.first_name}
                                        onChange={e => setProfileForm(p => ({ ...p, first_name: e.target.value }))}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input
                                        type="text" required
                                        value={profileForm.last_name}
                                        onChange={e => setProfileForm(p => ({ ...p, last_name: e.target.value }))}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email" required
                                        value={profileForm.email}
                                        onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <input
                                        type="text" required
                                        value={profileForm.phone_number}
                                        onChange={e => setProfileForm(p => ({ ...p, phone_number: e.target.value }))}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <input
                                        type="password"
                                        value={profileForm.password}
                                        onChange={e => setProfileForm(p => ({ ...p, password: e.target.value }))}
                                        placeholder="Leave blank to keep current"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={profileForm.confirm_password}
                                        onChange={e => setProfileForm(p => ({ ...p, confirm_password: e.target.value }))}
                                        placeholder="Confirm new password"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-medical-blue focus:border-medical-blue sm:text-sm"
                                    />
                                </div>

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
                                    <label className="block text-sm font-medium text-gray-700">Consultation Fee (DA)</label>
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
                                        <Save className="h-4 w-4 mr-2" /> Save Clinical Details
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
                                    <p className="font-semibold text-gray-900">{doctor.consultation_fee} DA</p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-4">
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
                ) : (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 text-center text-amber-800">
                        <p className="font-bold text-lg mb-1">Clinical Profile Not Seeded</p>
                        <p className="text-sm">Please ask your system administrator to assign a doctor specialty record for you.</p>
                    </div>
                )
            )}

            {/* ── Availability Management (DOCTOR ONLY) ── */}
            {user?.role === 'DOCTOR' && doctor && (
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
            )}
        </div>
    );
};

export default DoctorMyProfile;
