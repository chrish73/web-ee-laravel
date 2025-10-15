// frontend/src/pages/MemberDashboard.js
import React, { useState, useEffect } from "react";
import api from "../../api";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style-admin.css";
import { useNavigate } from "react-router-dom";

const MemberDashboard = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [commentData, setCommentData] = useState({});
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || "User"
  );

  const currentUserId = localStorage.getItem("userId");
  const currentUserRole = localStorage.getItem("userRole");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/me");
        setUserName(res.data.name);
        localStorage.setItem("userName", res.data.name);
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
      const res = await api.get("/posts");
      setPosts(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal memuat pengumuman.");
    } finally {
      setLoading(false);
    }
  };

  const handleCommentChange = (postId, value) => {
    setCommentData((prev) => ({ ...prev, [postId]: value }));
  };

  const handlePostComment = async (postId) => {
    const content = commentData[postId];
    if (!content || content.trim() === "") return;
    try {
      await api.post(`/posts/${postId}/comments`, { content });
      setMessage("Komentar berhasil ditambahkan.");
      setCommentData((prev) => ({ ...prev, [postId]: "" }));
      fetchPosts();
    } catch (err) {
      const errMsg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(" ")
        : err.response?.data?.message || "Gagal memposting komentar.";
      setError(errMsg);
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

  return (
    <div className="admin-wrapper">
      {/* FIXED HEADER */}
      <header className="admin-header">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center">
            <div className="header-left">
              <h2 className="mb-0">
                <i className="bi bi-person-circle me-2"></i>
                Dashboard Anggota
              </h2>
              <p className="text-muted mb-0 small">Komunitas EE Lokal Soe</p>
            </div>
            <div className="header-right d-flex align-items-center gap-3">
              <span className="text-white fw-semibold">
                <i className="bi bi-person-badge me-2"></i>
                {userName}
              </span>
              <button onClick={handleLogout} className="btn btn-outline-danger">
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

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

          {/* PENGUMUMAN CARD */}
          <div className="content-card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-megaphone me-2"></i>
                Pengumuman ({posts.length})
              </h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : posts.length === 0 ? (
                <div className="empty-state">
                  <i className="bi bi-inbox"></i>
                  <p>Belum ada pengumuman tersedia</p>
                  <small className="text-muted">
                    Pengumuman akan muncul di sini
                  </small>
                </div>
              ) : (
                <div className="posts-container">
                  {posts.map((post) => (
                    <div key={post.id} className="post-card mb-4">
                      <div className="post-header">
                        <div className="d-flex align-items-center mb-3">
                          <div className="user-avatar me-3">
                            {post.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h6 className="mb-0 fw-semibold">{post.title}</h6>
                            <small className="text-muted">
                              Oleh: {post.user.name}
                              <span className="badge bg-primary ms-2">
                                {post.user.role.toUpperCase()}
                              </span>
                            </small>
                          </div>
                        </div>
                      </div>

                      <div className="post-content mb-3">
                        <p className="text-muted mb-0">{post.content}</p>
                      </div>

                      {/* Image if exists */}
                      {post.image_path && (
                        <div className="post-image mb-3">
                          <img
                            src={`http://192.168.1.101:8000/storage/${post.image_path.replace(
                              "public/",
                              ""
                            )}`}
                            alt="Post Media"
                            className="img-fluid rounded"
                            style={{
                              maxHeight: "400px",
                              objectFit: "cover",
                              width: "100%",
                            }}
                          />
                        </div>
                      )}

                      {/* Comments Section */}
                      <div className="comments-section border-top pt-3">
                        <h6 className="fw-semibold mb-3">
                          <i className="bi bi-chat-dots me-2"></i>
                          Komentar ({post.comments.length})
                        </h6>

                        {/* Comments List */}
                        {post.comments.length > 0 && (
                          <div className="comments-list mb-3">
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
                                    <span className="ms-2">
                                      {comment.content}
                                    </span>
                                  </div>
                                  {(comment.user.id ===
                                    parseInt(currentUserId) ||
                                    currentUserRole === "admin") && (
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
                        )}

                        {/* Add Comment */}
                        <div className="input-group">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Tulis komentar..."
                            value={commentData[post.id] || ""}
                            onChange={(e) =>
                              handleCommentChange(post.id, e.target.value)
                            }
                            onKeyPress={(e) => {
                              if (
                                e.key === "Enter" &&
                                commentData[post.id]?.trim()
                              ) {
                                handlePostComment(post.id);
                              }
                            }}
                          />
                          <button
                            className="btn btn-schedule-primary"
                            onClick={() => handlePostComment(post.id)}
                            disabled={
                              !commentData[post.id] ||
                              commentData[post.id].trim() === ""
                            }
                          >
                            <i className="bi bi-send me-2"></i>
                            Kirim
                          </button>
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

export default MemberDashboard;
