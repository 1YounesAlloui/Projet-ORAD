import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Activity } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: '',
        role: 'PATIENT'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('register/', formData);
            navigate('/login');
        } catch (err) {
            const data = err.response?.data;
            if (data) {
                const messages = Object.entries(data)
                    .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : val}`)
                    .join(' | ');
                setError(messages || 'Registration failed');
            } else {
                setError('Registration failed: Network or server error.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-sky-50 border border-sky-100/80 text-medical-blue mb-4">
                    <Activity className="h-7 w-7" />
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                    Create an account
                </h2>
                <p className="mt-2 text-sm text-slate-500 font-medium">Join MediBook and book appointment schedules immediately</p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-10 px-8 sm:px-10 border border-slate-100 rounded-3xl shadow-sm shadow-slate-100/50">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="text-red-600 text-xs font-semibold bg-red-50/60 border border-red-100 p-3.5 rounded-xl text-center">
                                {error}
                            </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">First Name</label>
                                <input 
                                    type="text" 
                                    name="first_name" 
                                    required 
                                    onChange={handleChange} 
                                    placeholder="John"
                                    className="appearance-none block w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 hover:border-slate-300 focus:bg-white focus:border-medical-blue focus:ring-1 focus:ring-medical-blue rounded-xl outline-none text-sm text-slate-800 transition-all font-medium" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Last Name</label>
                                <input 
                                    type="text" 
                                    name="last_name" 
                                    required 
                                    onChange={handleChange} 
                                    placeholder="Doe"
                                    className="appearance-none block w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 hover:border-slate-300 focus:bg-white focus:border-medical-blue focus:ring-1 focus:ring-medical-blue rounded-xl outline-none text-sm text-slate-800 transition-all font-medium" 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Username</label>
                            <input 
                                type="text" 
                                name="username" 
                                required 
                                onChange={handleChange} 
                                placeholder="johndoe"
                                className="appearance-none block w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 hover:border-slate-300 focus:bg-white focus:border-medical-blue focus:ring-1 focus:ring-medical-blue rounded-xl outline-none text-sm text-slate-800 transition-all font-medium" 
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Email Address</label>
                            <input 
                                type="email" 
                                name="email" 
                                required 
                                onChange={handleChange} 
                                placeholder="john@example.com"
                                className="appearance-none block w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 hover:border-slate-300 focus:bg-white focus:border-medical-blue focus:ring-1 focus:ring-medical-blue rounded-xl outline-none text-sm text-slate-800 transition-all font-medium" 
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Role</label>
                            <select 
                                name="role" 
                                value={formData.role} 
                                onChange={handleChange} 
                                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 hover:border-slate-300 focus:bg-white focus:border-medical-blue rounded-xl outline-none text-sm text-slate-800 transition-all font-medium cursor-pointer"
                            >
                                <option value="PATIENT">Patient</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Password</label>
                                <input 
                                    type="password" 
                                    name="password" 
                                    required 
                                    onChange={handleChange} 
                                    placeholder="••••••••"
                                    className="appearance-none block w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 hover:border-slate-300 focus:bg-white focus:border-medical-blue focus:ring-1 focus:ring-medical-blue rounded-xl outline-none text-sm text-slate-800 transition-all font-medium" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Confirm Password</label>
                                <input 
                                    type="password" 
                                    name="password_confirm" 
                                    required 
                                    onChange={handleChange} 
                                    placeholder="••••••••"
                                    className="appearance-none block w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 hover:border-slate-300 focus:bg-white focus:border-medical-blue focus:ring-1 focus:ring-medical-blue rounded-xl outline-none text-sm text-slate-800 transition-all font-medium" 
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-medical-blue hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm transition-all focus:outline-none"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Registering...
                                    </>
                                ) : (
                                    'Register'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center border-t border-slate-100 pt-5">
                        <Link to="/login" className="text-sm font-semibold text-medical-blue hover:text-sky-600 transition-colors">
                            Already have an account? Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
