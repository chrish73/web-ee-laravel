// frontend/src/pages/StaffDashboard.js
import React, { useState, useEffect, useCallback } from "react";
import api from "../../api";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style-admin.css";
import { useNavigate } from "react-router-dom";

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    image: null,
  });
  const [activeTab, setActiveTab] = useState("schedules");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const userName = localStorage.getItem("userName") || "Staf";
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/me");
        localStorage.setItem("userName", res.data.name);
      } catch (err) {
        console.error("Gagal ambil profil:", err);
      }
    };
    fetchProfile();
  }, []);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/staf/schedules");
      setSchedules(res.data.schedules);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat jadwal.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/staf/posts");
      setPosts(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat pengumuman.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchData = useCallback(() => {
    if (activeTab === "schedules") fetchSchedules();
    else fetchPosts();
  }, [activeTab, fetchSchedules, fetchPosts]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePostChange = (e) => {
    if (e.target.name === "image") {
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
    formData.append("title", newPost.title);
    formData.append("content", newPost.content);
    if (newPost.image) formData.append("image", newPost.image);
    formData.append("is_public", 1);

    try {
      await api.post("/staf/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("Pengumuman berhasil diposting.");
      setNewPost({ title: "", content: "", image: null });
      document.getElementById("imageUpload").value = null;
      fetchPosts();
    } catch (err) {
      const errMsg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(" ")
        : err.response?.data?.message || "Gagal memposting.";
      setError(errMsg);
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm("Yakin ingin menghapus pengumuman ini?")) return;
    try {
      await api.delete(`/staf/posts/${id}`);
      setMessage("Pengumuman berhasil dihapus.");
      fetchPosts();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menghapus pengumuman.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Yakin ingin menghapus komentar ini?")) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setMessage("Komentar berhasil dihapus.");
      fetchPosts();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menghapus komentar.");
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      localStorage.clear();
      navigate("/login");
    }
  };

  const renderSchedules = () => (
    <div className="content-card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-calendar-week me-2"></i>
          Jadwal Saya ({schedules.length})
        </h5>
      </div>
      <div className="card-body">
        {schedules.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-calendar-x"></i>
            <p>Belum ada jadwal yang ditugaskan</p>
            <small className="text-muted">
              Jadwal akan muncul di sini ketika admin menambahkannya
            </small>
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
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => (
                  <tr key={schedule.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <i
                          className="bi bi-circle-fill text-primary me-2"
                          style={{ fontSize: "0.5rem" }}
                        ></i>
                        <span className="fw-semibold">{schedule.activity}</span>
                      </div>
                    </td>
                    <td>
                      <small className="text-muted">
                        <i className="bi bi-calendar-event me-1"></i>
                        {new Date(schedule.scheduled_start).toLocaleString(
                          "id-ID",
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }
                        )}
                      </small>
                    </td>
                    <td>
                      <small className="text-muted">
                        {schedule.scheduled_end ? (
                          <>
                            <i className="bi bi-calendar-check me-1"></i>
                            {new Date(schedule.scheduled_end).toLocaleString(
                              "id-ID",
                              {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }
                            )}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderPosts = () => (
    <>
      {/* FORM BUAT PENGUMUMAN */}
      <div className="content-card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-plus-circle me-2"></i>
            Buat Pengumuman Baru
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleCreatePost}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label fw-semibold">
                <i className="bi bi-card-heading me-2"></i>
                Judul
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={newPost.title}
                onChange={handlePostChange}
                className="form-control"
                placeholder="Masukkan judul pengumuman"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="content" className="form-label fw-semibold">
                <i className="bi bi-card-text me-2"></i>
                Konten
              </label>
              <textarea
                id="content"
                name="content"
                rows="4"
                value={newPost.content}
                onChange={handlePostChange}
                className="form-control"
                placeholder="Tulis isi pengumuman di sini..."
                required
              ></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="imageUpload" className="form-label fw-semibold">
                <i className="bi bi-image me-2"></i>
                Gambar (Opsional)
              </label>
              <input
                id="imageUpload"
                name="image"
                type="file"
                accept="image/*"
                onChange={handlePostChange}
                className="form-control"
              />
              <small className="text-muted">
                Format: JPG, PNG, GIF. Maksimal 2MB
              </small>
            </div>
            <button type="submit" className="btn btn-schedule-primary w-100">
              <i className="bi bi-send me-2"></i>
              Posting Pengumuman
            </button>
          </form>
        </div>
      </div>

      {/* DAFTAR PENGUMUMAN */}
      <div className="content-card">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-megaphone me-2"></i>
            Pengumuman Saya ({posts.length})
          </h5>
        </div>
        <div className="card-body">
          {posts.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-inbox"></i>
              <p>Belum ada pengumuman</p>
              <small className="text-muted">
                Buat pengumuman pertama Anda menggunakan form di atas
              </small>
            </div>
          ) : (
            <div className="posts-container">
              {posts.map((post) => (
                <div key={post.id} className="post-card mb-3">
                  <div className="post-header mb-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <h6 className="fw-semibold mb-1">{post.title}</h6>
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="btn btn-sm btn-outline-danger"
                        title="Hapus Pengumuman"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>

                  <div className="post-content mb-3">
                    <p className="text-muted">{post.content}</p>
                  </div>

                  {post.image_path && (
                    <div className="post-image mb-3">
                      <img
                        src={`http://localhost:8000/storage/${post.image_path.replace(
                          "public/",
                          ""
                        )}`}
                        alt="Post Media"
                        className="img-fluid rounded"
                        style={{
                          maxHeight: "100%",
                          objectFit: "cover",
                          width: "100%",
                        }}
                      />
                    </div>
                  )}

                  <div className="post-footer d-flex justify-content-between align-items-center pt-3 border-top">
                    <small className="text-muted">
                      <i className="bi bi-chat-dots me-1"></i>
                      {post.comments?.length || 0} Komentar
                    </small>
                    <small className="text-muted">
                      <i className="bi bi-clock me-1"></i>
                      {new Date(post.created_at).toLocaleDateString("id-ID")}
                    </small>
                  </div>

                  {/* Comments Section */}
                  {post.comments && post.comments.length > 0 && (
                    <div className="comments-section mt-3">
                      <h6 className="fw-semibold mb-3">
                        <i className="bi bi-chat-dots me-2"></i>
                        Komentar dari User
                      </h6>
                      <div className="comments-list">
                        {post.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="comment-item p-2 mb-2 rounded bg-light"
                          >
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <small className="fw-bold text-primary">
                                  {comment.user.name}:
                                </small>
                                <span className="ms-2">{comment.content}</span>
                              </div>
                              {comment.user.id === parseInt(currentUserId) && (
                                <button
                                  onClick={() =>
                                    handleDeleteComment(comment.id)
                                  }
                                  className="btn btn-sm btn-outline-danger py-0 px-2 ms-2"
                                  title="Hapus Komentar"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="admin-wrapper">
      {/* FIXED HEADER */}
      <header className="admin-header">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center">
            <div className="header-left">
              <h2 className="mb-0">
                <i className="bi bi-person-badge me-2"></i>
                Dashboard Staf
              </h2>
              <p className="text-muted mb-0 small">Komunitas EE Lokal Soe</p>
            </div>
            <div className="header-right d-flex align-items-center gap-3">
              <span className="text-white fw-semibold">
                <i className="bi bi-person-circle me-2"></i>
                {userName}
              </span>
              <button onClick={handleLogout} className="btn btn-outline-danger">
                <i className="bi bi-box-arrow-right me-2"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* FIXED NAVIGATION TABS */}
      <nav className="admin-nav liquidGlass-wrapper">
        <div className="liquidGlass-effect"></div>
        <div className="liquidGlass-tint"></div>
        <div className="liquidGlass-shine"></div>

        <div className="container-fluid liquidGlass-text">
          <ul className="nav nav-pills">
            <li className="nav-item">
              <button
                className={`nav-link ${
                  activeTab === "schedules" ? "active" : ""
                }`}
                onClick={() => setActiveTab("schedules")}
              >
                <i className="bi bi-calendar-event me-2"></i>
                Jadwal Saya
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "posts" ? "active" : ""}`}
                onClick={() => setActiveTab("posts")}
              >
                <i className="bi bi-megaphone me-2"></i>
                Pengumuman
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="admin-content">
        <div className="container-fluid">
          {/* ALERTS */}
          {message && (
            <div
              className="alert alert-success alert-dismissible fade show"
              role="alert"
            >
              <i className="bi bi-check-circle me-2"></i>
              {message}
              <button
                type="button"
                className="btn-close"
                onClick={() => setMessage(null)}
              ></button>
            </div>
          )}
          {error && (
            <div
              className="alert alert-danger alert-dismissible fade show"
              role="alert"
            >
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError(null)}
              ></button>
            </div>
          )}

          {/* CONTENT */}
          {loading ? (
            <div className="content-card">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-3">Memuat data...</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === "schedules" && renderSchedules()}
              {activeTab === "posts" && renderPosts()}
            </>
          )}
        </div>
      </main>

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

export default StaffDashboard;
