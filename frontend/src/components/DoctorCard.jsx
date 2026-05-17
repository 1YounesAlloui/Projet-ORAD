import React from 'react';
import { Link } from 'react-router-dom';
import { User as UserIcon, Star, Calendar } from 'lucide-react';

const DoctorCard = ({ doctor }) => {
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="p-6">
                <div className="flex items-center">
                    <div className="h-16 w-16 rounded-full bg-medical-blue/10 flex items-center justify-center text-medical-blue">
                        <UserIcon size={32} />
                    </div>
                    <div className="ml-4">
                        <h2 className="text-xl font-semibold text-gray-900">{doctor.full_name || `Dr. ${doctor.user.first_name || ''} ${doctor.user.last_name || ''}`}</h2>
                        <p className="text-sm text-medical-blue font-medium">{doctor.specialty}</p>
                    </div>
                </div>
                
                <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                        <Star className="h-4 w-4 mr-2 text-amber-400" />
                        {doctor.experience_years} years experience
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                        <span className="font-semibold text-gray-700 mr-2">Fee:</span> 
                        {doctor.consultation_fee} DA
                    </div>
                </div>
                
                <div className="mt-6">
                    <Link 
                        to={`/doctors/${doctor.id}`}
                        className="w-full flex items-center justify-center px-4 py-2 border border-medical-blue rounded-md shadow-sm text-sm font-medium text-medical-blue bg-white hover:bg-medical-blue hover:text-white transition-colors duration-300"
                    >
                        <Calendar className="mr-2 h-4 w-4" />
                        View Profile & Book
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DoctorCard;
