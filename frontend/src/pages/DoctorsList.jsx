import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import DoctorCard from '../components/DoctorCard';
import api from '../services/api';

const DoctorsList = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await api.get('doctors/');
                setDoctors(response.data);
            } catch (error) {
                console.error("Error fetching doctors", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    const filteredDoctors = doctors.filter(doctor => {
        const fullName = `Dr. ${doctor.user.last_name}`.toLowerCase();
        const specialty = doctor.specialty.toLowerCase();
        const search = searchTerm.toLowerCase();
        return fullName.includes(search) || specialty.includes(search);
    });

    if (loading) {
        return <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue"></div></div>;
    }

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Find a Doctor</h1>
                
                <div className="relative w-full md:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-medical-blue focus:border-medical-blue sm:text-sm transition duration-150 ease-in-out"
                        placeholder="Search by name or specialty..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDoctors.map(doctor => (
                    <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
            </div>
            
            {filteredDoctors.length === 0 && (
                <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No doctors found</h3>
                    <p className="mt-1 text-gray-500">Try adjusting your search terms.</p>
                </div>
            )}
        </div>
    );
};

export default DoctorsList;
