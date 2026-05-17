import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { UserPlus, Trash2, Edit2, ShieldAlert, ShieldCheck, X, Save } from 'lucide-react';

const AdminUserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    // Create form state
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'PATIENT',
        phone_number: ''
    });

    // Edit Modal state
    const [editingUser, setEditingUser] = useState(null);
    const [editFormData, setEditFormData] = useState({
        username: '',
        email: '',
        role: 'PATIENT',
        phone_number: '',
        is_active: true
    });

    const fetchUsers = async () => {
        try {
            const response = await api.get('user-management/');
            setUsers(response.data);
        } catch (error) {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditChange = (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setEditFormData({ ...editFormData, [e.target.name]: val });
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('user-management/', { ...formData, password_confirm: formData.password });
            toast.success("User created successfully!");
            setFormData({ username: '', email: '', password: '', role: 'PATIENT', phone_number: '' });
            setShowForm(false);
            fetchUsers();
        } catch (error) {
            toast.error("Failed to create user. Ensure username/email are unique.");
        }
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setEditFormData({
            username: user.username,
            email: user.email,
            role: user.role,
            phone_number: user.phone_number || '',
            is_active: user.is_active
        });
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`user-management/${editingUser.id}/`, editFormData);
            toast.success("User updated successfully!");
            setEditingUser(null);
            fetchUsers();
        } catch (error) {
            toast.error("Failed to update user.");
        }
    };

    const toggleUserActive = async (user) => {
        try {
            await api.patch(`user-management/${user.id}/`, { is_active: !user.is_active });
            toast.success(`Account ${user.is_active ? 'deactivated' : 'activated'} successfully!`);
            fetchUsers();
        } catch (error) {
            toast.error("Failed to change user status.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.delete(`user-management/${id}/`);
            toast.success("User deleted");
            fetchUsers();
        } catch (error) {
            toast.error("Failed to delete user");
        }
    };

    if (loading) return <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue"></div></div>;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">User Management</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Provision, edit, or deactivate medical accounts.</p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-medical-blue to-sky-600 text-white rounded-xl text-sm font-medium hover:shadow-md transition-all"
                >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {showForm ? 'Cancel' : 'Create User'}
                </button>
            </div>

            {showForm && (
                <div className="mb-8 p-6 border border-slate-100 rounded-2xl bg-slate-50">
                    <h4 className="font-semibold text-gray-900 mb-4">Add New User</h4>
                    <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">Username</label>
                            <input type="text" name="username" required value={formData.username} onChange={handleChange} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-medical-blue focus:ring-medical-blue sm:text-sm p-2.5 border" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">Email</label>
                            <input type="email" name="email" required value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-medical-blue focus:ring-medical-blue sm:text-sm p-2.5 border" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">Password</label>
                            <input type="password" name="password" required value={formData.password} onChange={handleChange} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-medical-blue focus:ring-medical-blue sm:text-sm p-2.5 border" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">Phone Number (Optional)</label>
                            <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-medical-blue focus:ring-medical-blue sm:text-sm p-2.5 border" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700">Role</label>
                            <select name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full rounded-xl border-slate-200 shadow-sm focus:border-medical-blue focus:ring-medical-blue sm:text-sm p-2.5 border bg-white">
                                <option value="PATIENT">Patient</option>
                                <option value="DOCTOR">Doctor</option>
                                <option value="ASSISTANT">Doctor Assistant</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 flex justify-end mt-2">
                            <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:shadow-md text-sm font-bold">Save User</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Username</th>
                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{u.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 
                                          u.role === 'DOCTOR' ? 'bg-emerald-100 text-emerald-800' : 
                                          u.role === 'ASSISTANT' ? 'bg-amber-100 text-amber-800' : 
                                          'bg-blue-100 text-blue-800'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <button 
                                        onClick={() => toggleUserActive(u)}
                                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold hover:shadow-sm transition-all ${
                                            u.is_active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                                        }`}
                                    >
                                        {u.is_active ? (
                                            <><ShieldCheck className="h-3 w-3 mr-1" /> Active</>
                                        ) : (
                                            <><ShieldAlert className="h-3 w-3 mr-1" /> Inactive</>
                                        )}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold space-x-3">
                                    <button 
                                        onClick={() => handleEditClick(u)} 
                                        className="text-medical-blue hover:text-sky-700 transition-colors inline-flex items-center"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(u.id)} 
                                        className="text-red-500 hover:text-red-700 transition-colors inline-flex items-center"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Edit User Details</h3>
                            <button onClick={() => setEditingUser(null)} className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">Username</label>
                                <input type="text" name="username" required value={editFormData.username} onChange={handleEditChange} className="mt-1 block w-full rounded-xl border-slate-200 p-2.5 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">Email</label>
                                <input type="email" name="email" required value={editFormData.email} onChange={handleEditChange} className="mt-1 block w-full rounded-xl border-slate-200 p-2.5 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
                                <input type="text" name="phone_number" value={editFormData.phone_number} onChange={handleEditChange} className="mt-1 block w-full rounded-xl border-slate-200 p-2.5 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700">Role</label>
                                <select name="role" value={editFormData.role} onChange={handleEditChange} className="mt-1 block w-full rounded-xl border-slate-200 p-2.5 border bg-white">
                                    <option value="PATIENT">Patient</option>
                                    <option value="DOCTOR">Doctor</option>
                                    <option value="ASSISTANT">Doctor Assistant</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            <div className="flex items-center space-x-2 pt-2">
                                <input type="checkbox" name="is_active" id="is_active" checked={editFormData.is_active} onChange={handleEditChange} className="rounded text-medical-blue focus:ring-medical-blue h-4 w-4" />
                                <label htmlFor="is_active" className="text-sm font-semibold text-gray-700">Account Active</label>
                            </div>
                            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 text-sm font-semibold hover:bg-slate-50">Cancel</button>
                                <button type="submit" className="px-5 py-2 bg-medical-blue text-white rounded-xl text-sm font-bold shadow-md flex items-center hover:bg-sky-600"><Save className="h-4 w-4 mr-1.5" /> Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserManagement;
