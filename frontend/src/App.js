import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Landing Page
import LandingPage from './pages/dashboard/LandingPage';

// Import existing login/register forms
// Memperbaiki path: diasumsikan file login/register ada di pages/login-register/
import LoginForm from './pages/login-register/login';
import RegisterForm from './pages/login-register/register';

// Import NEW Admin components. 
import AdminPanel from './pages/dashboard/AdminPanel'; 
import ManageStaffSchedule from './pages/dashboard/ManageStaffSchedule'; 

// --- Komponen Dashboard Placeholder ---
const StaffDashboard = () => <h1 className="text-2xl font-bold p-4">Staff Dashboard - Lihat Jadwal</h1>;
const MemberDashboard = () => <h1 className="text-2xl font-bold p-4">Anggota Dashboard - Akses Umum</h1>;

// --- Private Route dengan Otorisasi Role ---
// Jika tidak ada token atau role bermasalah, akan dialihkan ke "/" (LandingPage)
const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    // 1. Jika TIDAK ADA TOKEN, arahkan ke Landing Page (/)
    if (!token) {
        return <Navigate to="/" replace />;
    }
    
    // 2. Jika ada token, tapi role TIDAK diizinkan untuk rute ini
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Redirect ke dashboard default user
        switch (userRole) {
            case 'admin':
                return <Navigate to="/dashboard/admin" replace />;
            case 'staf':
                return <Navigate to="/dashboard/staf" replace />;
            case 'anggota':
                return <Navigate to="/dashboard/anggota" replace />;
            default:
                // 3. Jika token ada tapi role tidak dikenal (Error Role), kembalikan ke Landing Page
                return <Navigate to="/" replace />;
        }
    }

    return children;
};

// Fungsi untuk mengarahkan pengguna ke dashboard yang tepat setelah Login
const RoleBasedRedirect = () => {
    const userRole = localStorage.getItem('userRole');
    
    // Jika tidak ada role (setelah login), arahkan ke Landing Page
    if (!userRole) return <Navigate to="/" replace />;
    
    switch (userRole) {
        case 'admin':
            return <Navigate to="/dashboard/admin" replace />;
        case 'staf':
            return <Navigate to="/dashboard/staf" replace />;
        case 'anggota':
            return <Navigate to="/dashboard/anggota" replace />;
        default:
            // Role tidak dikenal, kembali ke Landing Page
            return <Navigate to="/" replace />;
    }
};

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    
                    {/* --- RUTE PUBLIK / LANDING PAGE (Root) --- */}
                    {/* Rute utama (/) harus selalu LandingPage */}
                    <Route path="/" element={<LandingPage />} />
                    
                    {/* Rute Login dan Register */}
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/register" element={<RegisterForm />} />
                    
                    {/* Rute /dashboard (untuk redirect yang mudah) */}
                    <Route 
                        path="/dashboard" 
                        element={<ProtectedRoute allowedRoles={['admin', 'staf', 'anggota']}><RoleBasedRedirect /></ProtectedRoute>} 
                    />
                    
                    {/* --- Rute DASHBOARD YANG DIPROTEKSI --- */}

                    <Route 
                        path="/dashboard/admin" 
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminPanel /> 
                            </ProtectedRoute>
                        } 
                    />
                    
                    <Route 
                        path="/admin/schedules/manage/:staffId"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <ManageStaffSchedule />
                            </ProtectedRoute>
                        }
                    />

                    <Route 
                        path="/dashboard/staf" 
                        element={
                            <ProtectedRoute allowedRoles={['staf', 'admin']}>
                                <StaffDashboard />
                            </ProtectedRoute>
                        } 
                    />
                    
                    <Route 
                        path="/dashboard/anggota" 
                        element={
                            <ProtectedRoute allowedRoles={['anggota', 'staf', 'admin']}>
                                <MemberDashboard />
                            </ProtectedRoute>
                        } 
                    />
                    
                    {/* Rute fallback untuk 404, kembali ke Landing Page */}
                    <Route path="*" element={<Navigate to="/" replace />} />

                </Routes>
            </div>
        </Router>
    );
}

export default App;
