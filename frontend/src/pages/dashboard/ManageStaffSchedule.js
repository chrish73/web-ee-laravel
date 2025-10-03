// frontend/src/pages/ManageStaffSchedule.js

import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style-admin.css';

const ManageStaffSchedule = () => {
    const { staffId } = useParams();
    const navigate = useNavigate();
    const [schedules, setSchedules] = useState([]);
    const [staff, setStaff] = useState({});
    const [newSchedule, setNewSchedule] = useState({
        activity: '',
        scheduled_start: '',
        scheduled_end: '',
        location: '',
    });
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await api.get(`/admin/staff/${staffId}/schedules`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setStaff(res.data.staff);
            setSchedules(res.data.schedules);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch staff schedules.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, [staffId]);

    const handleChange = (e) => {
        setNewSchedule({ ...newSchedule, [e.target.name]: e.target.value });
    };

    const handleAddSchedule = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            await api.post(`/admin/staff/${staffId}/schedules`, newSchedule, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessage('Jadwal berhasil ditambahkan.');
            setNewSchedule({ activity: '', scheduled_start: '', scheduled_end: '', location: '' });
            fetchSchedules(); 
        } catch (err) {
            const errMsg = err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join(" ") : (err.response?.data?.message || 'Gagal menambahkan jadwal.');
            setError(errMsg);
        }
    };

    const handleEditSchedule = (schedule) => {
        setEditingSchedule({
            ...schedule,
            scheduled_start: new Date(schedule.scheduled_start).toISOString().slice(0, 16),
            scheduled_end: schedule.scheduled_end ? new Date(schedule.scheduled_end).toISOString().slice(0, 16) : '',
        });
        setShowEditModal(true);
    };

    const handleUpdateSchedule = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            await api.put(
                `/admin/schedules/${editingSchedule.id}`,
                {
                    activity: editingSchedule.activity,
                    scheduled_start: editingSchedule.scheduled_start,
                    scheduled_end: editingSchedule.scheduled_end || null,
                    location: editingSchedule.location,
                },
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            setMessage('Jadwal berhasil diupdate!');
            setShowEditModal(false);
            fetchSchedules();
        } catch (err) {
            const errMsg = err.response?.data?.errors 
                ? Object.values(err.response.data.errors).flat().join(" ") 
                : (err.response?.data?.message || 'Gagal mengupdate jadwal.');
            setError(errMsg);
        }
    };
    
    const handleDeleteSchedule = async (id) => {
        if (!window.confirm("Yakin ingin menghapus jadwal ini?")) return;
        try {
            const token = localStorage.getItem('token');
            await api.delete(`/admin/schedules/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessage('Jadwal berhasil dihapus.');
            fetchSchedules();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menghapus jadwal.');
        }
    };

    const getRoleBadge = (role) => {
        const badges = {
            admin: "badge bg-danger",
            staf: "badge bg-primary",
            anggota: "badge bg-success"
        };
        return badges[role] || "badge bg-secondary";
    };

    return (
        <div className="admin-wrapper">
            {/* FIXED HEADER */}
            <header className="admin-header">
                <div className="container-fluid">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="header-left">
                            <h2 className="mb-0">
                                <i className="bi bi-calendar-week me-2"></i>
                                Kelola Jadwal Staf
                            </h2>
                            <p className="text-muted mb-0 small">Manajemen Jadwal {staff.name}</p>
                        </div>
                        <div className="header-right">
                            <button 
                                onClick={() => navigate('/dashboard/admin')} 
                                className="btn btn-outline-light me-2"
                            >
                                <i className="bi bi-arrow-left me-2"></i>
                                Kembali
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="admin-content">
                <div className="container-fluid">
                    {/* STAFF INFO CARD */}
                    <div className="content-card mb-4">
                        <div className="card-body">
                            <div className="d-flex align-items-center">
                                <div className="user-avatar me-3" style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
                                    {staff.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="mb-1">{staff.name}</h4>
                                    <span className={getRoleBadge(staff.role)}>
                                        {staff.role?.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

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

                    {/* FORM TAMBAH JADWAL */}
                    <div className="content-card mb-4">
                        <div className="card-header">
                            <h5 className="mb-0">
                                <i className="bi bi-plus-circle me-2"></i>
                                Tambah Jadwal Baru
                            </h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleAddSchedule}>
                                <div className="row g-3">
                                    <div className="col-md-12">
                                        <label htmlFor="activity" className="form-label fw-semibold">
                                            <i className="bi bi-card-text me-2"></i>
                                            Kegiatan
                                        </label>
                                        <input 
                                            id="activity"
                                            name="activity" 
                                            type="text"
                                            value={newSchedule.activity} 
                                            onChange={handleChange} 
                                            placeholder="Contoh: Rapat Bulanan, Workshop, dll" 
                                            required 
                                            className="form-control"
                                        />
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <label htmlFor="scheduled_start" className="form-label fw-semibold">
                                            <i className="bi bi-calendar-event me-2"></i>
                                            Waktu Mulai
                                        </label>
                                        <input 
                                            id="scheduled_start"
                                            name="scheduled_start" 
                                            type="datetime-local" 
                                            value={newSchedule.scheduled_start} 
                                            onChange={handleChange} 
                                            required 
                                            className="form-control"
                                        />
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <label htmlFor="scheduled_end" className="form-label fw-semibold">
                                            <i className="bi bi-calendar-check me-2"></i>
                                            Waktu Selesai (Opsional)
                                        </label>
                                        <input 
                                            id="scheduled_end"
                                            name="scheduled_end" 
                                            type="datetime-local" 
                                            value={newSchedule.scheduled_end} 
                                            onChange={handleChange} 
                                            className="form-control"
                                        />
                                    </div>
                                    
                                    <div className="col-md-12">
                                        <label htmlFor="location" className="form-label fw-semibold">
                                            <i className="bi bi-geo-alt me-2"></i>
                                            Lokasi
                                        </label>
                                        <input 
                                            id="location"
                                            name="location" 
                                            type="text"
                                            value={newSchedule.location} 
                                            onChange={handleChange} 
                                            placeholder="Contoh: Ruang Rapat, Zoom Meeting, dll (Opsional)" 
                                            className="form-control"
                                        />
                                    </div>
                                    
                                    <div className="col-md-12">
                                        <button type="submit" className="btn btn-schedule-primary">
                                            <i className="bi bi-save me-2"></i>
                                            Simpan Jadwal
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* DAFTAR JADWAL */}
                    <div className="content-card">
                        <div className="card-header">
                            <h5 className="mb-0">
                                <i className="bi bi-list-task me-2"></i>
                                Daftar Jadwal ({schedules.length})
                            </h5>
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : schedules.length === 0 ? (
                                <div className="empty-state">
                                    <i className="bi bi-calendar-x"></i>
                                    <p>Belum ada jadwal untuk staf ini</p>
                                    <small className="text-muted">Tambahkan jadwal baru menggunakan form di atas</small>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle modern-table">
                                        <thead>
                                            <tr>
                                                <th>Kegiatan</th>
                                                <th>Waktu Mulai</th>
                                                <th>Waktu Selesai</th>
                                                <th>Lokasi</th>
                                                <th className="text-end">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {schedules.map((schedule) => (
                                                <tr key={schedule.id}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            <i className="bi bi-circle-fill text-primary me-2" style={{ fontSize: '0.5rem' }}></i>
                                                            <span className="fw-semibold">{schedule.activity}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <small className="text-muted">
                                                            <i className="bi bi-calendar-event me-1"></i>
                                                            {new Date(schedule.scheduled_start).toLocaleString('id-ID', {
                                                                dateStyle: 'medium',
                                                                timeStyle: 'short'
                                                            })}
                                                        </small>
                                                    </td>
                                                    <td>
                                                        <small className="text-muted">
                                                            {schedule.scheduled_end ? (
                                                                <>
                                                                    <i className="bi bi-calendar-check me-1"></i>
                                                                    {new Date(schedule.scheduled_end).toLocaleString('id-ID', {
                                                                        dateStyle: 'medium',
                                                                        timeStyle: 'short'
                                                                    })}
                                                                </>
                                                            ) : (
                                                                <span className="text-secondary">-</span>
                                                            )}
                                                        </small>
                                                    </td>
                                                    <td>
                                                        <small className="text-muted">
                                                            {schedule.location ? (
                                                                <>
                                                                    <i className="bi bi-geo-alt me-1"></i>
                                                                    {schedule.location}
                                                                </>
                                                            ) : (
                                                                <span className="text-secondary">-</span>
                                                            )}
                                                        </small>
                                                    </td>
                                                    <td className="text-end">
                                                        <div className="btn-group" role="group">
                                                            <button 
                                                                onClick={() => handleEditSchedule(schedule)}
                                                                className="btn btn-sm btn-outline-info"
                                                                title="Edit Jadwal"
                                                            >
                                                                <i className="bi bi-pencil"></i>
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteSchedule(schedule.id)}
                                                                className="btn btn-sm btn-outline-danger"
                                                                title="Hapus Jadwal"
                                                            >
                                                                <i className="bi bi-trash"></i>
                                                            </button>
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

            {/* MODAL EDIT SCHEDULE */}
            {showEditModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="bi bi-pencil-square me-2"></i>
                                    Edit Jadwal
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                            </div>
                            <form onSubmit={handleUpdateSchedule}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label htmlFor="edit-activity" className="form-label fw-semibold">
                                            <i className="bi bi-card-text me-2"></i>
                                            Kegiatan
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="edit-activity"
                                            value={editingSchedule?.activity || ''}
                                            onChange={(e) => setEditingSchedule({ ...editingSchedule, activity: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="edit-start" className="form-label fw-semibold">
                                                <i className="bi bi-calendar-event me-2"></i>
                                                Waktu Mulai
                                            </label>
                                            <input
                                                type="datetime-local"
                                                className="form-control"
                                                id="edit-start"
                                                value={editingSchedule?.scheduled_start || ''}
                                                onChange={(e) => setEditingSchedule({ ...editingSchedule, scheduled_start: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="edit-end" className="form-label fw-semibold">
                                                <i className="bi bi-calendar-check me-2"></i>
                                                Waktu Selesai (Opsional)
                                            </label>
                                            <input
                                                type="datetime-local"
                                                className="form-control"
                                                id="edit-end"
                                                value={editingSchedule?.scheduled_end || ''}
                                                onChange={(e) => setEditingSchedule({ ...editingSchedule, scheduled_end: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="edit-location" className="form-label fw-semibold">
                                            <i className="bi bi-geo-alt me-2"></i>
                                            Lokasi
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="edit-location"
                                            value={editingSchedule?.location || ''}
                                            onChange={(e) => setEditingSchedule({ ...editingSchedule, location: e.target.value })}
                                            placeholder="Opsional"
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                                        Batal
                                    </button>
                                    <button type="submit" className="btn btn-schedule-primary">
                                        <i className="bi bi-save me-2"></i>
                                        Simpan Perubahan
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

export default ManageStaffSchedule;