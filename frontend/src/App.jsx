import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

import DoctorsList from './pages/DoctorsList';
import DoctorProfile from './pages/DoctorProfile';
import DoctorMyProfile from './pages/DoctorMyProfile';
import Appointments from './pages/Appointments';
import Consultations from './pages/Consultations';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="doctors" element={<DoctorsList />} />
            <Route path="doctors/:id" element={<DoctorProfile />} />
             <Route path="my-profile" element={<DoctorMyProfile />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="consultations" element={<Consultations />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
