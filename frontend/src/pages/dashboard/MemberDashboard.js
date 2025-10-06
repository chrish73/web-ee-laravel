// frontend/src/pages/MemberDashboard.js
import React, { useState, useEffect } from 'react';
import api from '../../api';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style-admin.css';
import { useNavigate } from 'react-router-dom';

const MemberDashboard = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [commentData, setCommentData] = useState({});

  const currentUserId = localStorage.getItem('userId');
  const  [userName, setUserName]= localStorage.getItem('userName') || 'User';
  const currentUserRole = localStorage.getItem('userRole');

  useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await api.get('/me');
      setUserName(res.data.name);
    } catch (err) {
      console.error("Gagal ambil profil:", err);
    }
  };
  fetchProfile();
}, []);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/posts');
      setPosts(res.data);
      setMessage('Pengumuman berhasil dimuat.');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat pengumuman.');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentChange = (postId, value) => {
    setCommentData(prev => ({ ...prev, [postId]: value }));
  };

  const handlePostComment = async (postId) => {
    const content = commentData[postId];
    if (!content || content.trim() === "") return;
    try {
      await api.post(`/posts/${postId}/comments`, { content });
      setMessage('Komentar berhasil ditambahkan.');
      setCommentData(prev => ({ ...prev, [postId]: '' }));
      fetchPosts();
    } catch (err) {
      const errMsg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(" ")
        : (err.response?.data?.message || 'Gagal memposting komentar.');
      setError(errMsg);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Yakin ingin menghapus komentar ini?")) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setMessage('Komentar berhasil dihapus.');
      fetchPosts();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus komentar.');
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

  return (
    <div className="admin-wrapper">
      {/* HEADER */}
      <header className="admin-header">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <div>
            <h2 className="mb-0">
              <i className="bi bi-person-circle me-2"></i> Dashboard Anggota
            </h2>
            <p className="text-muted mb-0 small">Komunitas EE Lokal Soe</p>
          </div>
          <div>
            <span className="me-3">Halo, {userName}</span>
            <button onClick={handleLogout} className="btn btn-outline-light">
              <i className="bi bi-box-arrow-right me-2"></i> Logout
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="admin-content">
        <div className="container-fluid">
          {message && (
            <div className="alert alert-success alert-dismissible fade show">
              {message}
              <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
            </div>
          )}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show">
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}

          <div className="content-card">
            <div className="card-header">
              <h5>
                <i className="bi bi-megaphone me-2"></i> Pengumuman ({posts.length})
              </h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary"></div>
                </div>
              ) : (
                <>
                  {posts.length === 0 && (
                    <div className="empty-state">
                      <i className="bi bi-inbox"></i>
                      <p>Belum ada pengumuman.</p>
                    </div>
                  )}

                  {posts.map(post => (
                    <div key={post.id} className="list-group-item shadow-sm mb-4 rounded-3 border-0">
                      <h6 className="fw-semibold">{post.title}</h6>
                      <p className="text-muted">{post.content}</p>
                      <small className="text-secondary d-block">
                        Oleh: {post.user.name} ({post.user.role})
                      </small>

                      {/* Komentar */}
                      <div className="comments mt-3 border-top pt-3">
                        <h6>Komentar ({post.comments.length})</h6>
                        <ul className="list-unstyled">
                          {post.comments.map(comment => (
                            <li key={comment.id} className="mb-2 p-2 border rounded bg-light d-flex justify-content-between">
                              <div>
                                <small className="fw-bold text-primary">{comment.user.name}:</small> {comment.content}
                              </div>
                              {(comment.user.id === currentUserId || currentUserRole === 'admin') && (
                                <button onClick={() => handleDeleteComment(comment.id)} className="btn btn-sm btn-outline-danger py-0 px-2">
                                  <i className="bi bi-x"></i>
                                </button>
                              )}
                            </li>
                          ))}
                        </ul>
                        <div className="input-group mt-2">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Tulis komentar..."
                            value={commentData[post.id] || ''}
                            onChange={(e) => handleCommentChange(post.id, e.target.value)}
                          />
                          <button
                            className="btn btn-schedule-primary"
                            onClick={() => handlePostComment(post.id)}
                            disabled={!commentData[post.id] || commentData[post.id].trim() === ""}
                          >
                            Kirim
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
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

export default MemberDashboard;
