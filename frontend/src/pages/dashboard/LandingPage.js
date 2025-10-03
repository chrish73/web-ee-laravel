import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    // Cek status autentikasi saat komponen dimuat
    useEffect(() => {
        // Jika token dan role ada, redirect langsung ke dashboard
        if (token && userRole) {
            switch (userRole) {
                case 'admin':
                    navigate('/dashboard/admin', { replace: true });
                    break;
                case 'staf':
                    navigate('/dashboard/staf', { replace: true });
                    break;
                case 'anggota':
                    navigate('/dashboard/anggota', { replace: true });
                    break;
                default:
                    // Jika role tidak dikenal, tetap di Landing Page
                    console.warn('User has token but unrecognized role, staying on landing page.');
            }
        }
    }, [token, userRole, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="max-w-md w-full text-center bg-white p-8 rounded-xl shadow-2xl">
                <h1 className="text-4xl font-extrabold text-indigo-700 mb-4">Sistem Manajemen Organisasi</h1>
                <p className="text-lg text-gray-600 mb-8">
                    Silakan masuk untuk mengelola data anggota, staf, dan jadwal kegiatan.
                </p>
                <div className="flex flex-col space-y-4">
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md transform hover:scale-105"
                    >
                        Masuk (Login)
                    </button>
                    <button
                        onClick={() => navigate('/register')}
                        className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md transform hover:scale-105"
                    >
                        Daftar (Register)
                    </button>
                </div>
                <p className="mt-8 text-sm text-gray-400">Hubungi Admin jika Anda mengalami masalah akses.</p>
            </div>
        </div>
    );
};

export default LandingPage;
