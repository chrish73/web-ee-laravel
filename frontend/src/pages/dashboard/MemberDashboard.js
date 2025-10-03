import React, { useState, useEffect } from 'react';
import api from '../../api';
import 'bootstrap/dist/css/bootstrap.min.css';
// Menggunakan style-admin.css untuk tampilan dasar, atau buat style-member.css jika Anda mau gaya unik
import './style-admin.css'; 
import { useNavigate } from 'react-router-dom';

const MemberDashboard = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [commentData, setCommentData] = useState({}); 

    // Ambil info user yang login dari localStorage
    const currentUserId = localStorage.getItem('userId');
    const currentUserRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName') || 'Anggota';

    useEffect(() => {
        fetchPosts();
    }, []);

    // --- Fungsi Pengambilan Data ---
    const fetchPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            // Mengambil semua post publik, termasuk user dan komentar (rute publik)
            const res = await api.get('/posts'); 
            setPosts(res.data);
            setMessage('Pengumuman berhasil dimuat.');
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal memuat pengumuman.');
        } finally {
            setLoading(false);
        }
    };
    
    // --- Manajemen Komentar ---
    const handleCommentChange = (postId, value) => {
        setCommentData(prev => ({ ...prev, [postId]: value }));
    };

    const handlePostComment = async (postId) => {
        const content = commentData[postId];
        if (!content || content.trim() === "") return;

        try {
            await api.post(`/posts/${postId}/comments`, { content });
            setMessage('Komentar berhasil ditambahkan.');
            
            // Bersihkan input dan perbarui data posts
            setCommentData(prev => ({ ...prev, [postId]: '' }));
            fetchPosts(); // Refetch data untuk melihat komentar baru
            
        } catch (err) {
            const errMsg = err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(" ") : (err.response?.data?.message || 'Gagal memposting komentar.');
            setError(errMsg);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Yakin ingin menghapus komentar ini?")) return;
        
        try {
            await api.delete(`/comments/${commentId}`);
            setMessage('Komentar berhasil dihapus.');
            fetchPosts(); // Refetch data
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menghapus komentar. Anda mungkin tidak memiliki izin.');
        }
    };

    const handleLogout = async () => {
        try {
            await api.post('/logout');
            localStorage.clear();
            navigate('/login');
        } catch (err) {
            console.error("Logout failed:", err);
            localStorage.clear();
            navigate('/login');
        }
    };

    // --- Render Component ---
    return (
        <div className="member-dashboard bg-light min-vh-100">
            <header className="header-bar bg-success text-white p-3 shadow-md d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Dashboard Anggota</h4>
                <div className="d-flex align-items-center">
                    <span className='me-3'>Halo, {userName} ({currentUserRole})</span>
                    <button 
                        onClick={handleLogout}
                        className="btn btn-outline-light btn-sm"
                    >
                        <i className="bi bi-box-arrow-right me-2"></i> Logout
                    </button>
                </div>
            </header>

            <main className="container p-4">
                
                {message && <div className="alert alert-success alert-dismissible fade show" role="alert">{message}
                    <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
                </div>}
                {error && <div className="alert alert-danger alert-dismissible fade show" role="alert">{error}
                    <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                </div>}

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-success" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-success">Memuat pengumuman...</p>
                    </div>
                ) : (
                    <>
                        <h3 className="mb-4 text-secondary">Pengumuman & Postingan Staf ({posts.length})</h3>
                        {posts.length === 0 && <div className="alert alert-info">Belum ada pengumuman yang diposting oleh Staf.</div>}

                        {posts.map(post => (
                            <div key={post.id} className="card shadow-sm mb-4">
                                <div className="card-body">
                                    <h5 className="card-title text-success">{post.title}</h5>
                                    <p className="card-text">{post.content}</p>
                                    
                                    {post.image_path && (
                                        <img 
                                            // ASUMSI LARAVEL PUBLIC STORAGE SUDAH DILINK
                                            src={`http://localhost:8000/storage/${post.image_path.replace('public/', '')}`} 
                                            className="img-fluid rounded mb-3" 
                                            alt="Post Media"
                                        />
                                    )}

                                    <small className="text-muted d-block border-top pt-2">
                                        Diposting oleh **{post.user.name}** ({post.user.role}) pada {new Date(post.created_at).toLocaleString()}
                                    </small>

                                    {/* Kolom Komentar */}
                                    <div className="comments mt-3 border-top pt-3">
                                        <h6>Komentar ({post.comments.length})</h6>
                                        <ul className="list-unstyled">
                                            {post.comments.map(comment => (
                                                <li key={comment.id} className="mb-2 p-2 border-bottom d-flex justify-content-between align-items-start bg-light rounded">
                                                    <div>
                                                        <small className="fw-bold d-block text-primary">
                                                            {comment.user.name} ({comment.user.role}):
                                                        </small>
                                                        {comment.content}
                                                    </div>
                                                    
                                                    {/* Tombol Hapus: Hanya jika pembuat komen, Staf pembuat Post, atau Admin */}
                                                    {(comment.user.id === currentUserId || post.user.id === currentUserId || currentUserRole === 'admin') && (
                                                        <button 
                                                            onClick={() => handleDeleteComment(comment.id)}
                                                            className="btn btn-sm btn-outline-danger py-0 px-1 ms-2"
                                                        >
                                                            <i className="bi bi-x"></i>
                                                        </button>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Form Tambah Komentar */}
                                        <div className="input-group mt-3">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Tulis komentar..."
                                                value={commentData[post.id] || ''}
                                                onChange={(e) => handleCommentChange(post.id, e.target.value)}
                                            />
                                            <button 
                                                className="btn btn-success" 
                                                type="button"
                                                onClick={() => handlePostComment(post.id)}
                                                disabled={!commentData[post.id] || commentData[post.id].trim() === ""}
                                            >
                                                Kirim
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </main>
        </div>
    );
};

export default MemberDashboard;
