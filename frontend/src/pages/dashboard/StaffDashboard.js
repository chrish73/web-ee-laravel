import React, { useState, useEffect, useCallback } from 'react'; // Tambahkan useCallback
import api from '../../api';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style-admin.css';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
    const navigate = useNavigate();
    const [schedules, setSchedules] = useState([]);
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ title: '', content: '', image: null });
    const [activeTab, setActiveTab] = useState('schedules');
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Ambil data staf dari localStorage saat login
    const userName = localStorage.getItem('userName') || 'Staf';

    // --- Fungsi Fetching dibungkus dengan useCallback ---
    const fetchSchedules = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/staf/schedules');
            setSchedules(res.data.schedules);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal memuat jadwal pribadi.');
        } finally {
            setLoading(false);
        }
    }, []); 

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/staf/posts');
            setPosts(res.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal memuat pengumuman saya.');
        } finally {
            setLoading(false);
        }
    }, []); 

    const fetchData = useCallback(() => {
        setLoading(true);
        setError(null);
        if (activeTab === 'schedules') {
            fetchSchedules();
        } else {
            fetchPosts();
        }
    }, [activeTab, fetchSchedules, fetchPosts]); 
    // Dependency list yang benar: activeTab, fetchSchedules, fetchPosts

    // --- useEffect yang Diperbaiki ---
    useEffect(() => {
        // Panggil fetchData setiap kali komponen dimuat atau activeTab berubah
        fetchData();
    }, [fetchData]); // PERBAIKAN: fetchData ditambahkan sebagai dependency

    
    const handlePostChange = (e) => {
        if (e.target.name === 'image') {
            setNewPost({ ...newPost, image: e.target.files[0] });
        } else {
            setNewPost({ ...newPost, [e.target.name]: e.target.value });
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        
        const formData = new FormData();
        formData.append('title', newPost.title);
        formData.append('content', newPost.content);
        if (newPost.image) {
            formData.append('image', newPost.image);
        }
        formData.append('is_public', 1);

        try {
            await api.post('/staf/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage('Pengumuman berhasil diposting dan tampil di Landing Page.');
            setNewPost({ title: '', content: '', image: null });
            document.getElementById('imageUpload').value = null;
            fetchPosts(); 
        } catch (err) {
            const errMsg = err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(" ") : (err.response?.data?.message || 'Gagal memposting pengumuman.');
            setError(errMsg);
        }
    };
    
    const handleDeletePost = async (id) => {
        if (!window.confirm("Yakin ingin menghapus pengumuman ini?")) return;
        try {
            await api.delete(`/staf/posts/${id}`);
            setMessage('Pengumuman berhasil dihapus.');
            fetchPosts();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menghapus pengumuman.');
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

    const renderSchedules = () => (
        <div className="table-responsive bg-white p-3 rounded-lg shadow-sm">
            <h5 className='mb-3 text-primary'>Jadwal Tugas Anda</h5>
            <table className="table table-striped table-hover align-middle">
                <thead>
                    <tr>
                        <th scope="col">Aktivitas</th>
                        <th scope="col">Mulai</th>
                        <th scope="col">Selesai</th>
                        <th scope="col">Lokasi</th>
                    </tr>
                </thead>
                <tbody>
                    {schedules.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="text-center text-muted">Belum ada jadwal yang ditetapkan oleh Admin.</td>
                        </tr>
                    ) : (
                        schedules.map(schedule => (
                            <tr key={schedule.id}>
                                <td className="font-weight-bold">{schedule.activity}</td>
                                <td>{new Date(schedule.scheduled_start).toLocaleString()}</td>
                                <td>{schedule.scheduled_end ? new Date(schedule.scheduled_end).toLocaleString() : '-'}</td>
                                <td>{schedule.location || 'Tidak Ditentukan'}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderPosts = () => (
        <>
            <div className="mb-4">
                <form onSubmit={handleCreatePost} className="p-4 border rounded-lg bg-white shadow-sm">
                    <h5 className='mb-3 text-primary'>Buat Pengumuman Baru</h5>
                    <div className="mb-3">
                        <label className="form-label">Judul:</label>
                        <input 
                            name="title" 
                            type="text" 
                            value={newPost.title} 
                            onChange={handlePostChange} 
                            placeholder="Judul Pengumuman" 
                            required 
                            className="form-control"
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Konten:</label>
                        <textarea 
                            name="content" 
                            rows="4"
                            value={newPost.content} 
                            onChange={handlePostChange} 
                            placeholder="Isi pengumuman / kata-kata untuk Landing Page..." 
                            required 
                            className="form-control"
                        ></textarea>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="imageUpload" className="form-label">Foto (Opsional):</label>
                        <input 
                            id="imageUpload"
                            name="image" 
                            type="file" 
                            onChange={handlePostChange} 
                            accept="image/*"
                            className="form-control"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                        <i className="bi bi-send me-2"></i>
                        Posting Pengumuman
                    </button>
                </form>
            </div>

            <h5 className="mt-4 text-secondary">Pengumuman Saya ({posts.length})</h5>
            <div className="list-group">
                {posts.map(post => (
                    <div key={post.id} className="list-group-item list-group-item-action mb-3 rounded-lg shadow-sm">
                        <div className="d-flex w-100 justify-content-between">
                            <h6 className="mb-1 fw-bold text-dark">{post.title}</h6>
                            <small className="text-muted">Diposting: {new Date(post.created_at).toLocaleDateString()}</small>
                        </div>
                        <p className="mb-1">{post.content}</p>
                        {post.image_path && (
                            // ASUMSI LARAVEL PUBLIC STORAGE SUDAH DILINK (php artisan storage:link)
                            <img 
                                src={`http://localhost:8000/storage/${post.image_path.replace('public/', '')}`}
                                alt="Post Media"
                                className="img-fluid rounded my-2"
                                style={{ maxHeight: '200px', width: 'auto' }}
                            />
                        )}
                        <div className="d-flex justify-content-between align-items-center mt-2">
                            <small className="text-info">Komentar: {post.comments.length}</small>
                            <button 
                                onClick={() => handleDeletePost(post.id)}
                                className="btn btn-sm btn-outline-danger"
                            >
                                <i className="bi bi-trash"></i> Hapus
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );

    return (
        <div className="staff-dashboard">
            <header className="header-bar bg-primary text-white p-3 shadow-md d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Selamat Datang, Staf {userName}</h4>
                <button 
                    onClick={handleLogout}
                    className="btn btn-outline-light"
                >
                    <i className="bi bi-box-arrow-right me-2"></i> Logout
                </button>
            </header>
            
            <main className="container-fluid p-4">
                
                {/* Tabs Navigation */}
                <ul className="nav nav-pills mb-4 bg-light p-2 rounded-lg shadow-sm">
                    <li className="nav-item">
                        <button className={`nav-link ${activeTab === 'schedules' ? 'active bg-primary text-white' : 'text-primary'}`} onClick={() => setActiveTab('schedules')}>
                            <i className="bi bi-calendar-event me-2"></i> Jadwal Tugas
                        </button>
                    </li>
                    <li className="nav-item">
                        <button className={`nav-link ${activeTab === 'posts' ? 'active bg-primary text-white' : 'text-primary'}`} onClick={() => setActiveTab('posts')}>
                            <i className="bi bi-megaphone me-2"></i> Kelola Pengumuman
                        </button>
                    </li>
                </ul>

                {message && <div className="alert alert-success alert-dismissible fade show" role="alert">{message}
                    <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
                </div>}
                {error && <div className="alert alert-danger alert-dismissible fade show" role="alert">{error}
                    <button type="button" className="btn-close" onClick={() => setError(null)}></button>
                </div>}

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-primary">Memuat data...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'schedules' && renderSchedules()}
                        {activeTab === 'posts' && renderPosts()}
                    </>
                )}
            </main>
        </div>
    );
};

export default StaffDashboard;
