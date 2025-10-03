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
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users.");
    }
  };

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/admin/schedules", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSchedules(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch schedules.");
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const UserTable = () => (
    <table className="table table-striped table-hover align-middle">
      <thead className="table-light">
        <tr>
          {/* <th>ID</th> */}
          <th>Nama</th>
          <th>Email</th>
          <th>Role</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            {/* <td>{user.id}</td> */}
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>
              <span className="fw-bold">{user.role}</span>
            </td>
            <td>
              {user.role === "anggota" && (
                <button
                  onClick={() => handlePromote(user.id)}
                  className="btn btn-success btn-sm me-2"
                >
                  Angkat Staf
                </button>
              )}
              {user.role !== "admin" && (
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="btn btn-danger btn-sm me-2"
                >
                  Hapus
                </button>
              )}
              {user.role === "staf" && (
                <button
                  onClick={() => navigate(`/admin/schedules/manage/${user.id}`)}
                  className="btn btn-primary btn-sm"
                >
                  Lihat Jadwal
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const ScheduleTable = () => (
    <table className="table table-striped table-hover align-middle">
      <thead className="table-light">
        <tr>
          {/* <th>ID Jadwal</th> */}
          <th>Staf</th>
          <th>Kegiatan</th>
          <th>Mulai</th>
          <th>Selesai</th>
          <th>Lokasi</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        {schedules.map((schedule) => (
          <tr key={schedule.id}>
            {/* <td>{schedule.id}</td> */}
            <td>
              <span className="fw-bold">
                {schedule.user.name} ({schedule.user.role})
              </span>
            </td>
            <td>{schedule.activity}</td>
            <td>{new Date(schedule.scheduled_start).toLocaleString()}</td>
            <td>
              {schedule.scheduled_end
                ? new Date(schedule.scheduled_end).toLocaleString()
                : "-"}
            </td>
            <td>{schedule.location || "-"}</td>
            <td>
              <button
                onClick={() => handleDeleteSchedule(schedule.id)}
                className="btn btn-danger btn-sm"
              >
                Hapus
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="admin-wrapper">
      {/* HEADER */}
      <nav class="navbar bg-body-tertiary">
        <div class="container-fluid">
          <h2>Admin Dahsboard</h2>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </nav>

      {/* NAVIGATION */}
      <nav className="admin-nav">
        <ul className="nav nav-tabs container-fluid">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              Manajemen User
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${
                activeTab === "schedules" ? "active" : ""
              }`}
              onClick={() => setActiveTab("schedules")}
            >
              Manajemen Jadwal
            </button>
          </li>
        </ul>
      </nav>

      {/* CONTENT */}
      <main className="admin-content">
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="admin-card p-3">
          {activeTab === "users" && <UserTable />}
          {activeTab === "schedules" && <ScheduleTable />}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white text-center py-2 border-top">
        <small>&copy; 2025 Komunitas EE Lokal Soe</small>
      </footer>
    </div>
  );
};

export default AdminPanel;
