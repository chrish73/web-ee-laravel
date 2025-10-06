// frontend/src/pages/StaffDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
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

  const userName = localStorage.getItem('userName') || 'Staf';

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/staf/schedules');
      setSchedules(res.data.schedules);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat jadwal.');
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
      setError(err.response?.data?.message || 'Gagal memuat pengumuman.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchData = useCallback(() => {
    if (activeTab === 'schedules') fetchSchedules();
    else fetchPosts();
  }, [activeTab, fetchSchedules, fetchPosts]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    if (newPost.image) formData.append('image', newPost.image);
    formData.append('is_public', 1);

    try {
      await api.post('/staf/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('Pengumuman berhasil diposting.');
      setNewPost({ title: '', content: '', image: null });
      document.getElementById('imageUpload').value = null;
      fetchPosts();
    } catch (err) {
      const errMsg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(" ")
        : (err.response?.data?.message || 'Gagal memposting.');
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
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  const renderSchedules = () => (
    <div className="modern-table table-responsive">
      <table className="table table-hover align-middle">
        <thead>
          <tr>
            <th>Aktivitas</th>
            <th>Mulai</th>
            <th>Selesai</th>
            <th>Lokasi</th>
          </tr>
        </thead>
        <tbody>
          {schedules.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center text-muted">Belum ada jadwal.</td>
            </tr>
          ) : (
            schedules.map(schedule => (
              <tr key={schedule.id}>
                <td>{schedule.activity}</td>
                <td>{new Date(schedule.scheduled_start).toLocaleString()}</td>
                <td>{schedule.scheduled_end ? new Date(schedule.scheduled_end).toLocaleString() : '-'}</td>
                <td>{schedule.location || '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderPosts = () => (
    <>
      <form onSubmit={handleCreatePost} className="content-card p-4 mb-4">
        <h5 className="fw-semibold mb-3"><i className="bi bi-megaphone me-2"></i> Buat Pengumuman</h5>
        <div className="mb-3">
          <label className="form-label">Judul</label>
          <input name="title" type="text" value={newPost.title} onChange={handlePostChange} className="form-control" required />
        </div>
        <div className="mb-3">
          <label className="form-label">Konten</label>
          <textarea name="content" rows="3" value={newPost.content} onChange={handlePostChange} className="form-control" required></textarea>
        </div>
        <div className="mb-3">
          <label className="form-label">Gambar (opsional)</label>
          <input id="imageUpload" name="image" type="file" accept="image/*" onChange={handlePostChange} className="form-control" />
        </div>
        <button type="submit" className="btn btn-schedule-primary w-100">
          <i className="bi bi-send me-2"></i> Posting
        </button>
      </form>

      <div className="content-card p-4">
        <h5 className="fw-semibold mb-3">Pengumuman Saya ({posts.length})</h5>
        {posts.map(post => (
          <div key={post.id} className="list-group-item shadow-sm mb-3 rounded-3 border-0">
            <h6 className="fw-semibold">{post.title}</h6>
            <p className="text-muted">{post.content}</p>
            {post.image_path && (
              <img src={`http://localhost:8000/storage/${post.image_path.replace('public/', '')}`} alt="Post Media" className="img-fluid rounded mb-2" />
            )}
            <div className="d-flex justify-content-between">
              <small className="text-secondary">Komentar: {post.comments.length}</small>
              <button onClick={() => handleDeletePost(post.id)} className="btn btn-sm btn-outline-danger">
                <i className="bi bi-trash"></i> Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="admin-wrapper">
      {/* HEADER */}
      <header className="admin-header">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <h2 className="mb-0"><i className="bi bi-person-badge me-2"></i> Dashboard Staf</h2>
          <button onClick={handleLogout} className="btn btn-outline-light">
            <i className="bi bi-box-arrow-right me-2"></i> Logout
          </button>
        </div>
      </header>

      {/* NAV */}
      <nav className="admin-nav">
        <div className="container-fluid">
          <ul className="nav nav-pills">
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'schedules' ? 'active' : ''}`} onClick={() => setActiveTab('schedules')}>
                <i className="bi bi-calendar-event me-2"></i> Jadwal
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
                <i className="bi bi-megaphone me-2"></i> Pengumuman
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* CONTENT */}
      <main className="admin-content">
        <div className="container-fluid">
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : (
            <>
              {activeTab === 'schedules' && renderSchedules()}
              {activeTab === 'posts' && renderPosts()}
            </>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="admin-footer">
        <div className="container-fluid text-center">
          <small className="text-muted">&copy; 2025 Komunitas EE Lokal Soe</small>
        </div>
      </footer>
    </div>
  );
};

export default StaffDashboard;
