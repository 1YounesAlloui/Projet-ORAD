import React, { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { Toaster } from 'react-hot-toast';

// Lazy loaded clinical pages for premium lightweight startup
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DoctorsList = lazy(() => import('./pages/DoctorsList'));
const DoctorProfile = lazy(() => import('./pages/DoctorProfile'));
const DoctorMyProfile = lazy(() => import('./pages/DoctorMyProfile'));
const Appointments = lazy(() => import('./pages/Appointments'));
const Consultations = lazy(() => import('./pages/Consultations'));

// Sleek fallback screen loader
const PageLoader = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-slate-50/50">
    <div className="flex flex-col items-center space-y-3">
      <div className="h-9 w-9 animate-spin rounded-full border-3 border-sky-500 border-t-transparent"></div>
      <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">Chargement...</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Router>
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
