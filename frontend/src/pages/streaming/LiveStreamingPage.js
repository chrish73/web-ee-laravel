import React, { useState, useEffect, useRef } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './streaming-style.css';

const LiveStreamingPage = () => {
  const navigate = useNavigate();
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStream, setSelectedStream] = useState(null);
  const [newStream, setNewStream] = useState({
    title: '',
    description: '',
    scheduled_at: ''
  });

  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName') || 'User';
  const canCreateStream = userRole === 'admin' || userRole === 'staf';

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    setLoading(true);
    try {
      const res = await api.get('/streams?status=all');
      setStreams(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat live streams.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStream = async (e) => {
    e.preventDefault();
    try {
      await api.post('/streams', newStream);
      setMessage('Live stream berhasil dibuat!');
      setShowCreateModal(false);
      setNewStream({ title: '', description: '', scheduled_at: '' });
      fetchStreams();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat stream.');
    }
  };

  const handleStartStream = async (streamId) => {
    try {
      await api.post(`/streams/${streamId}/start`);
      setMessage('Live stream dimulai!');
      fetchStreams();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memulai stream.');
    }
  };

  const handleEndStream = async (streamId) => {
    if (!window.confirm('Yakin ingin mengakhiri stream ini?')) return;
    try {
      await api.post(`/streams/${streamId}/end`);
      setMessage('Live stream berakhir.');
      fetchStreams();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengakhiri stream.');
    }
  };

  const handleDeleteStream = async (streamId) => {
    if (!window.confirm('Yakin ingin menghapus stream ini?')) return;
    try {
      await api.delete(`/streams/${streamId}`);
      setMessage('Stream berhasil dihapus.');
      fetchStreams();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus stream.');
    }
  };

  const handleWatchStream = (stream) => {
    setSelectedStream(stream);
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: 'badge bg-warning',
      live: 'badge bg-danger blink',
      ended: 'badge bg-secondary'
    };
    return badges[status] || 'badge bg-secondary';
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  return (
    <div className="admin-wrapper">
      {/* HEADER */}
      <header className="admin-header">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center">
            <div className="header-left">
              <h2 className="mb-0">
                <i className="bi bi-broadcast me-2"></i>
                Live Streaming
              </h2>
              <p className="text-muted mb-0 small">Komunitas EE Lokal Soe</p>
            </div>
            <div className="header-right d-flex align-items-center gap-3">
              <button onClick={() => navigate(-1)} className="btn btn-outline-light">
                <i className="bi bi-arrow-left me-2"></i>
                Kembali
              </button>
              <span className="text-white fw-semibold">
                <i className="bi bi-person-circle me-2"></i>
                {userName}
              </span>
              <button onClick={handleLogout} className="btn btn-outline-danger">
                <i className="bi bi-box-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="admin-content" style={{ marginTop: '100px' }}>
        <div className="container-fluid">
          {/* ALERTS */}
          {message && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="bi bi-check-circle me-2"></i>
              {message}
              <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
            </div>
          )}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}

          {/* CREATE BUTTON */}
          {canCreateStream && (
            <div className="mb-4">
              <button 
                onClick={() => setShowCreateModal(true)} 
                className="btn btn-schedule-primary"
              >
                <i className="bi bi-plus-circle me-2"></i>
                Buat Live Stream
              </button>
            </div>
          )}

          {/* STREAMS LIST */}
          <div className="content-card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-camera-video me-2"></i>
                Daftar Live Stream ({streams.length})
              </h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : streams.length === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-camera-video-off"></i>
                  <p>Belum ada live stream</p>
                </div>
              ) : (
                <div className="row g-3">
                  {streams.map(stream => (
                    <div key={stream.id} className="col-md-6 col-lg-4">
                      <div className="stream-card">
                        <div className="stream-thumbnail">
                          {stream.status === 'live' && (
                            <div className="live-indicator">
                              <i className="bi bi-circle-fill me-1"></i>
                              LIVE
                            </div>
                          )}
                          <div className="viewers-count">
                            <i className="bi bi-eye-fill me-1"></i>
                            {stream.viewers_count}
                          </div>
                        </div>
                        
                        <div className="stream-info p-3">
                          <h6 className="fw-bold mb-2">{stream.title}</h6>
                          <p className="text-muted small mb-2">{stream.description || 'Tidak ada deskripsi'}</p>
                          
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <small className="text-muted">
                              <i className="bi bi-person-circle me-1"></i>
                              {stream.user.name}
                            </small>
                            <span className={getStatusBadge(stream.status)}>
                              {stream.status.toUpperCase()}
                            </span>
                          </div>

                          {stream.scheduled_at && (
                            <small className="text-muted d-block mb-2">
                              <i className="bi bi-calendar-event me-1"></i>
                              {new Date(stream.scheduled_at).toLocaleString('id-ID')}
                            </small>
                          )}

                          <div className="d-flex gap-2">
                            {stream.status === 'live' && (
                              <button 
                                onClick={() => handleWatchStream(stream)}
                                className="btn btn-sm btn-primary flex-grow-1"
                              >
                                <i className="bi bi-play-circle me-1"></i>
                                Tonton
                              </button>
                            )}

                            {canCreateStream && stream.user.id === parseInt(localStorage.getItem('userId')) && (
                              <>
                                {stream.status === 'scheduled' && (
                                  <button 
                                    onClick={() => handleStartStream(stream.id)}
                                    className="btn btn-sm btn-success"
                                  >
                                    <i className="bi bi-broadcast"></i>
                                    Mulai
                                  </button>
                                )}
                                {stream.status === 'live' && (
                                  <button 
                                    onClick={() => handleEndStream(stream.id)}
                                    className="btn btn-sm btn-warning"
                                  >
                                    <i className="bi bi-stop-circle"></i>
                                    Akhiri
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleDeleteStream(stream.id)}
                                  className="btn btn-sm btn-outline-danger"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-broadcast me-2"></i>
                  Buat Live Stream Baru
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateStream}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Judul Stream</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newStream.title}
                      onChange={(e) => setNewStream({ ...newStream, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Deskripsi</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={newStream.description}
                      onChange={(e) => setNewStream({ ...newStream, description: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Jadwal (Opsional)</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={newStream.scheduled_at}
                      onChange={(e) => setNewStream({ ...newStream, scheduled_at: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                    Batal
                  </button>
                  <button type="submit" className="btn btn-schedule-primary">
                    <i className="bi bi-save me-2"></i>
                    Buat Stream
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* STREAM VIEWER MODAL */}
      {selectedStream && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
          <div className="modal-dialog modal-fullscreen">
            <div className="modal-content bg-dark">
              <div className="modal-header border-0">
                <h5 className="modal-title text-white">
                  <span className="badge bg-danger me-2">
                    <i className="bi bi-circle-fill me-1"></i>
                    LIVE
                  </span>
                  {selectedStream.title}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setSelectedStream(null)}
                ></button>
              </div>
              <div className="modal-body d-flex align-items-center justify-content-center">
                <div className="text-center text-white">
                  <i className="bi bi-play-circle" style={{ fontSize: '5rem' }}></i>
                  <h4 className="mt-3">Video Player</h4>
                  <p className="text-muted">
                    Integrasi dengan WebRTC atau streaming service seperti Agora, Twilio, atau custom RTMP server
                  </p>
                  <p className="small">Stream Key: {selectedStream.stream_key}</p>
                  <p className="small">Viewers: {selectedStream.viewers_count}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="admin-footer">
        <div className="container-fluid">
          <div className="text-center">
            <small className="text-muted">
              &copy; 2025 Komunitas EE Lokal Soe. All rights reserved.
            </small>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LiveStreamingPage;