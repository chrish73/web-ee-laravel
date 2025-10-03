// frontend/src/pages/AdminPanel.js

import React, { useState, useEffect } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style-admin.css";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [activeTab, setActiveTab] = useState("users");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showEditScheduleModal, setShowEditScheduleModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/admin/schedules", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchedules(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch schedules.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    else if (activeTab === "schedules") fetchSchedules();
  }, [activeTab]);

  const handlePromote = async (id) => {
    if (!window.confirm("Yakin ingin mengangkat user ini sebagai Staf?"))
      return;
    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/admin/users/${id}/promote`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("User berhasil diangkat menjadi Staf!");
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal mengangkat staf.");
    }
  };

  const handleDemote = async (id) => {
    if (!window.confirm("Yakin ingin menurunkan Staf ini menjadi Anggota?"))
      return;
    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/admin/users/${id}/demote`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Staf berhasil diturunkan menjadi Anggota!");
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menurunkan staf.");
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Yakin ingin menghapus user ini?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("User berhasil dihapus.");
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus user.");
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm("Yakin ingin menghapus jadwal ini?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/admin/schedules/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Jadwal berhasil dihapus.");
      fetchSchedules();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal menghapus jadwal.");
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
    setShowEditUserModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/admin/users/${editingUser.id}`,
        {
          name: editingUser.name,
          email: editingUser.email,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("User berhasil diupdate!");
      setShowEditUserModal(false);
      fetchUsers();
    } catch (err) {
      const errMsg = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join(" ") 
        : (err.response?.data?.message || "Gagal mengupdate user.");
      alert(errMsg);
    }
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule({
      ...schedule,
      scheduled_start: new Date(schedule.scheduled_start).toISOString().slice(0, 16),
      scheduled_end: schedule.scheduled_end ? new Date(schedule.scheduled_end).toISOString().slice(0, 16) : '',
    });
    setShowEditScheduleModal(true);
  };

  const handleUpdateSchedule = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/admin/schedules/${editingSchedule.id}`,
        {
          activity: editingSchedule.activity,
          scheduled_start: editingSchedule.scheduled_start,
          scheduled_end: editingSchedule.scheduled_end || null,
          location: editingSchedule.location,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Jadwal berhasil diupdate!");
      setShowEditScheduleModal(false);
      fetchSchedules();
    } catch (err) {
      const errMsg = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join(" ") 
        : (err.response?.data?.message || "Gagal mengupdate jadwal.");
      alert(errMsg);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: "badge bg-danger",
      staf: "badge bg-primary",
      anggota: "badge bg-success"
    };
    return badges[role] || "badge bg-secondary";
  };

  const UserTable = () => (
    <div className="table-responsive">
      <table className="table table-hover align-middle modern-table">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Email</th>
            <th>Role</th>
            <th className="text-end">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <div className="d-flex align-items-center">
                  <div className="user-avatar me-3">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="fw-semibold">{user.name}</span>
                </div>
              </td>
              <td className="text-muted">{user.email}</td>
              <td>
                <span className={getRoleBadge(user.role)}>
                  {user.role.toUpperCase()}
                </span>
              </td>
              <td className="text-end">
                <div className="btn-group" role="group">
                  {user.role !== "admin" && (
                    <button
                      onClick={() => handleEditUser(user)}
                      className="btn btn-sm btn-outline-info"
                      title="Edit User"
                    >
                      <i className="bi bi-pencil"></i> Edit
                    </button>
                  )}
                  {user.role === "anggota" && (
                    <button
                      onClick={() => handlePromote(user.id)}
                      className="btn btn-sm btn-outline-success"
                      title="Angkat Staf"
                    >
                      <i className="bi bi-arrow-up-circle"></i> Angkat
                    </button>
                  )}
                  {user.role === "staf" && (
                    <>
                      <button
                        onClick={() => handleDemote(user.id)}
                        className="btn btn-sm btn-outline-warning"
                        title="Turunkan ke Anggota"
                      >
                        <i className="bi bi-arrow-down-circle"></i> Turunkan
                      </button>
                      <button
                        onClick={() => navigate(`/admin/schedules/manage/${user.id}`)}
                        className="btn btn-sm btn-outline-primary"
                        title="Lihat Jadwal"
                      >
                        <i className="bi bi-calendar3"></i> Jadwal
                      </button>
                    </>
                  )}
                  {user.role !== "admin" && (
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="btn btn-sm btn-outline-danger"
                      title="Hapus User"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const ScheduleTable = () => (
    <div className="table-responsive">
      <table className="table table-hover align-middle modern-table">
        <thead>
          <tr>
            <th>Staf</th>
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
                  <div className="user-avatar me-2 small">
                    {schedule.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="fw-semibold">{schedule.user.name}</div>
                    <small className="text-muted">{schedule.user.role}</small>
                  </div>
                </div>
              </td>
              <td>
                <span className="fw-semibold">{schedule.activity}</span>
              </td>
              <td>
                <small className="text-muted">
                  <i className="bi bi-calendar-event me-1"></i>
                  {new Date(schedule.scheduled_start).toLocaleString('id-ID', {
                    dateStyle: 'short',
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
                        dateStyle: 'short',
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
  );

  return (
    <div className="admin-wrapper">
      {/* FIXED HEADER */}
      <header className="admin-header">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center">
            <div className="header-left">
              <h2 className="mb-0">
                <i className="bi bi-speedometer2 me-2"></i>
                Admin Dashboard
              </h2>
              <p className="text-muted mb-0 small">Komunitas EE Lokal Soe</p>
            </div>
            <div className="header-right">
              <button onClick={handleLogout} className="btn btn-outline-danger">
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* FIXED NAVIGATION TABS */}
      <nav className="admin-nav">
        <div className="container-fluid">
          <ul className="nav nav-pills">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "users" ? "active" : ""}`}
                onClick={() => setActiveTab("users")}
              >
                <i className="bi bi-people me-2"></i>
                Manajemen User
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "schedules" ? "active" : ""}`}
                onClick={() => setActiveTab("schedules")}
              >
                <i className="bi bi-calendar3 me-2"></i>
                Manajemen Jadwal
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="admin-content">
        <div className="container-fluid">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}

          <div className="content-card">
            <div className="card-header">
              <h5 className="mb-0">
                {activeTab === "users" ? (
                  <>
                    <i className="bi bi-people me-2"></i>
                    Daftar User ({users.length})
                  </>
                ) : (
                  <>
                    <i className="bi bi-calendar3 me-2"></i>
                    Daftar Jadwal ({schedules.length})
                  </>
                )}
              </h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  {activeTab === "users" && <UserTable />}
                  {activeTab === "schedules" && <ScheduleTable />}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL EDIT USER */}
      {showEditUserModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-pencil-square me-2"></i>
                  Edit User
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowEditUserModal(false)}></button>
              </div>
              <form onSubmit={handleUpdateUser}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="edit-name" className="form-label fw-semibold">
                      <i className="bi bi-person me-2"></i>
                      Nama
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="edit-name"
                      value={editingUser?.name || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="edit-email" className="form-label fw-semibold">
                      <i className="bi bi-envelope me-2"></i>
                      Email
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="edit-email"
                      value={editingUser?.email || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-shield me-2"></i>
                      Role (Tidak Dapat Diubah)
                    </label>
                    <div>
                      <span className={getRoleBadge(editingUser?.role)}>
                        {editingUser?.role.toUpperCase()}
                      </span>
                      <small className="text-muted d-block mt-2">
                        Gunakan tombol "Angkat" atau "Turunkan" untuk mengubah role
                      </small>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditUserModal(false)}>
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

      {/* MODAL EDIT SCHEDULE */}
      {showEditScheduleModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-pencil-square me-2"></i>
                  Edit Jadwal
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowEditScheduleModal(false)}></button>
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
                        Waktu Selesai
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
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditScheduleModal(false)}>
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

export default AdminPanel;