// frontend/src/pages/meeting/MeetingPage.js
import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../dashboard/style-admin.css';

const MeetingPage = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    scheduled_at: '',
    duration: 60,
    participant_ids: []
  });

  const userRole = localStorage.getItem('userRole');
  const userName = localStorage.getItem('userName') || 'User';
  const canCreateMeeting = userRole === 'admin' || userRole === 'staf';

  useEffect(() => {
    fetchMeetings();
    if (canCreateMeeting) {
      fetchUsers();
    }
  }, []);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/meetings');
      setMeetings(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat meetings.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Gagal memuat users:', err);
    }
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    try {
      await api.post('/meetings', newMeeting);
      setMessage('Meeting berhasil dibuat!');
      setShowCreateModal(false);
      setNewMeeting({
        title: '',
        description: '',
        scheduled_at: '',
        duration: 60,
        participant_ids: []
      });
      fetchMeetings();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat meeting.');
    }
  };

  const handleJoinMeeting = async (meetingId) => {
    try {
      await api.post(`/meetings/${meetingId}/join`);
      setMessage('Berhasil join meeting!');
      // Redirect ke meeting room (implementasi WebRTC)
      window.open(`/meeting-room/${meetingId}`, '_blank');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal join meeting.');
    }
  };

  const handleStartMeeting = async (meetingId) => {
    try {
      await api.post(`/meetings/${meetingId}/start`);
      setMessage('Meeting dimulai!');
      fetchMeetings();
      window.open(`/meeting-room/${meetingId}`, '_blank');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memulai meeting.');
    }
  };

  const handleEndMeeting = async (meetingId) => {
    if (!window.confirm('Yakin ingin mengakhiri meeting ini?')) return;
    try {
      await api.post(`/meetings/${meetingId}/end`);
      setMessage('Meeting berakhir.');
      fetchMeetings();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengakhiri meeting.');
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    if (!window.confirm('Yakin ingin menghapus meeting ini?')) return;
    try {
      await api.delete(`/meetings/${meetingId}`);
      setMessage('Meeting berhasil dihapus.');
      fetchMeetings();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus meeting.');
    }
  };

  const handleParticipantToggle = (userId) => {
    setNewMeeting(prev => ({
      ...prev,
      participant_ids: prev.participant_ids.includes(userId)
        ? prev.participant_ids.filter(id => id !== userId)
        : [...prev.participant_ids, userId]
    }));
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: 'badge bg-info',
      ongoing: 'badge bg-success',
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
                <i className="bi bi-camera-video me-2"></i>
                Video Meetings
              </h2>
              <p className="text-muted mb-0 small">Komunitas EE Lokal Soe</p>
            </div>
            <div className="header-right d-flex align-items-center gap-3">
              <button onClick={() => navigate(-1)} className="btn btn-outline-light">
                <i className="bi bi-arrow-left me-2"></i>
                Kembali
              </button>
              <span className="text-white fw-semibold d-none d-md-inline">
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
            <div className="alert alert-success alert-dismissible fade show">
              <i className="bi bi-check-circle me-2"></i>
              {message}
              <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
            </div>
          )}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}

          {/* CREATE BUTTON */}
          {canCreateMeeting && (
            <div className="mb-4">
              <button 
                onClick={() => setShowCreateModal(true)} 
                className="btn btn-schedule-primary"
              >
                <i className="bi bi-plus-circle me-2"></i>
                Buat Meeting Baru
              </button>
            </div>
          )}

          {/* MEETINGS LIST */}
          <div className="content-card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-calendar-event me-2"></i>
                Daftar Meeting ({meetings.length})
              </h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : meetings.length === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-camera-video-off"></i>
                  <p>Belum ada meeting terjadwal</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle modern-table">
                    <thead>
                      <tr>
                        <th>Meeting</th>
                        <th>Host</th>
                        <th>Jadwal</th>
                        <th>Durasi</th>
                        <th>Status</th>
                        <th className="text-end">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meetings.map(meeting => (
                        <tr key={meeting.id}>
                          <td>
                            <div>
                              <div className="fw-semibold">{meeting.title}</div>
                              <small className="text-muted">{meeting.description}</small>
                            </div>
                          </td>
                          <td>
                            <small>{meeting.host.name}</small>
                          </td>
                          <td>
                            <small className="text-muted">
                              <i className="bi bi-calendar-event me-1"></i>
                              {new Date(meeting.scheduled_at).toLocaleString('id-ID')}
                            </small>
                          </td>
                          <td>
                            <small>{meeting.duration} menit</small>
                          </td>
                          <td>
                            <span className={getStatusBadge(meeting.status)}>
                              {meeting.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="text-end">
                            <div className="btn-group">
                              {meeting.status === 'scheduled' && (
                                <>
                                  {canCreateMeeting && meeting.host_id === parseInt(localStorage.getItem('userId')) && (
                                    <button 
                                      onClick={() => handleStartMeeting(meeting.id)}
                                      className="btn btn-sm btn-success"
                                      title="Mulai Meeting"
                                    >
                                      <i className="bi bi-play-circle"></i>
                                    </button>
                                  )}
                                </>
                              )}
                              {meeting.status === 'ongoing' && (
                                <button 
                                  onClick={() => handleJoinMeeting(meeting.id)}
                                  className="btn btn-sm btn-primary"
                                  title="Join Meeting"
                                >
                                  <i className="bi bi-box-arrow-in-right"></i> Join
                                </button>
                              )}
                              {canCreateMeeting && meeting.host_id === parseInt(localStorage.getItem('userId')) && (
                                <>
                                  {meeting.status === 'ongoing' && (
                                    <button 
                                      onClick={() => handleEndMeeting(meeting.id)}
                                      className="btn btn-sm btn-warning"
                                      title="Akhiri Meeting"
                                    >
                                      <i className="bi bi-stop-circle"></i>
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => handleDeleteMeeting(meeting.id)}
                                    className="btn btn-sm btn-outline-danger"
                                    title="Hapus Meeting"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-camera-video me-2"></i>
                  Buat Meeting Baru
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateMeeting}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Judul Meeting</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newMeeting.title}
                      onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Deskripsi</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={newMeeting.description}
                      onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Jadwal</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={newMeeting.scheduled_at}
                        onChange={(e) => setNewMeeting({ ...newMeeting, scheduled_at: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-semibold">Durasi (menit)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={newMeeting.duration}
                        onChange={(e) => setNewMeeting({ ...newMeeting, duration: parseInt(e.target.value) })}
                        min="15"
                        max="480"
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Participants</label>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' }}>
                      {users.map(user => (
                        <div key={user.id} className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={newMeeting.participant_ids.includes(user.id)}
                            onChange={() => handleParticipantToggle(user.id)}
                            id={`user-${user.id}`}
                          />
                          <label className="form-check-label" htmlFor={`user-${user.id}`}>
                            {user.name} ({user.email}) - <span className="badge bg-primary">{user.role}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                    Batal
                  </button>
                  <button type="submit" className="btn btn-schedule-primary">
                    <i className="bi bi-save me-2"></i>
                    Buat Meeting
                  </button>
                </div>
              </form>
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

export default MeetingPage;