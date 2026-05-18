import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Activity } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(username, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-sky-50 border border-sky-100/80 text-medical-blue mb-4">
                    <Activity className="h-7 w-7" />
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                    Welcome to MediBook
                </h2>
                <p className="mt-2 text-sm text-slate-500 font-medium">Sign in to manage appointments & consultations</p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-10 px-8 sm:px-10 border border-slate-100 rounded-3xl shadow-sm shadow-slate-100/50">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="text-red-600 text-xs font-semibold bg-red-50/60 border border-red-100 p-3.5 rounded-xl text-center">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Username</label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                className="appearance-none block w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 hover:border-slate-300 focus:bg-white focus:border-medical-blue focus:ring-1 focus:ring-medical-blue rounded-xl outline-none text-sm text-slate-800 transition-all font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="appearance-none block w-full px-4 py-2.5 bg-slate-50 border border-slate-200/80 hover:border-slate-300 focus:bg-white focus:border-medical-blue focus:ring-1 focus:ring-medical-blue rounded-xl outline-none text-sm text-slate-800 transition-all font-medium"
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-medical-blue hover:bg-sky-600 cursor-pointer shadow-sm transition-all focus:outline-none"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>
                    
                    <div className="mt-6 text-center border-t border-slate-100 pt-5">
                        <Link to="/register" className="text-sm font-semibold text-medical-blue hover:text-sky-600 transition-colors">
                            Don't have an account? Register here
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
