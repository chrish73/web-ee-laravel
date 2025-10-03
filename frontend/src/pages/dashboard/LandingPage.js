import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const LandingPage = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const [publicPosts, setPublicPosts] = useState([]);

    // 1. Cek status autentikasi saat komponen dimuat (KODE LAMA, untuk redirect)
    useEffect(() => {
        if (token && userRole) {
            switch (userRole) {
                // ... (logic redirect yang sudah ada) ...
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
                    console.warn('User has token but unrecognized role, staying on landing page.');
            }
        }
    }, [token, userRole, navigate]);
    
    // 2. Fetch Postingan Publik untuk Landing Page
    useEffect(() => {
        const fetchPublicPosts = async () => {
            try {
                const res = await api.get('/posts');
                setPublicPosts(res.data);
            } catch (err) {
                console.error("Failed to fetch public posts:", err);
            }
        };
        // Hanya fetch jika tidak ada token (agar tidak redirect)
        if (!token) { 
            fetchPublicPosts();
        }
    }, [token]);


    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="max-w-md w-full text-center bg-white p-8 rounded-xl shadow-2xl">
                {/* ... (Header dan Tombol Login/Register yang sudah ada) ... */}
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
                
                {/* --- MENAMPILKAN POSTINGAN PUBLIK --- */}
                {publicPosts.length > 0 && (
                    <div className="mt-8 pt-4 border-t border-gray-200">
                        <h4 className="text-xl font-bold text-gray-700 mb-4">Pengumuman Terbaru</h4>
                        {publicPosts.map(post => (
                            <div key={post.id} className="text-left mb-4 p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                                <h6 className="font-semibold text-gray-800">{post.title}</h6>
                                <p className="text-sm text-gray-600 truncate">{post.content}</p>
                                <small className="text-xs text-indigo-500">Oleh: {post.user.name}</small>
                            </div>
                        ))}
                    </div>
                )}
                <p className="mt-8 text-sm text-gray-400">Hubungi Admin jika Anda mengalami masalah akses.</p>
            </div>
        </div>
    );
};

export default LandingPage;