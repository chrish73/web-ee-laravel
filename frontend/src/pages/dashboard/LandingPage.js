// frontend/src/pages/dashboard/LandingPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style-admin.css";

const LandingPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  const [publicPosts, setPublicPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    // Redirect logic for logged-in users
    if (token && userRole) {
      switch (userRole) {
        case "admin":
          navigate("/dashboard/admin", { replace: true });
          break;
        case "staf":
          navigate("/dashboard/staf", { replace: true });
          break;
        case "anggota":
          navigate("/dashboard/anggota", { replace: true });
          break;
        default:
          console.warn("Unknown role");
      }
    }
  }, [token, userRole, navigate]);

  useEffect(() => {
    // Fetch posts only if user is not logged in (to display public content)
    const fetchPublicPosts = async () => {
      setLoading(true);
      try {
        const res = await api.get("/posts");
        setPublicPosts(res.data);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      } finally {
        setLoading(false);
      }
    };
    if (!token) fetchPublicPosts();
  }, [token]);

  return (
    <div className="admin-wrapper">
      {/* FIXED HEADER */}
      <header className="admin-header">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center">
            <div className="header-left">
              <h2 className="mb-0">
                EE Lokal Soe
              </h2>
              <p className="text-muted mb-0 small">Selamat Datang</p>
            </div>
            <div className="header-right d-flex gap-3">
            </div>
          </div>
        </div>
      </header>

      {/* FIXED NAVIGATION BAR (New: Using Liquid Glass style from AdminPanel) */}
      <nav className="admin-nav liquidGlass-wrapper">
        <div className="liquidGlass-effect"></div>
        <div className="liquidGlass-tint"></div>
        <div className="liquidGlass-shine"></div>

        <div className="container-fluid liquidGlass-text">
          <ul className="nav nav-pills">
            <li className="nav-item">
              {/* Note: Landing page uses buttons that trigger navigation, not conditional tabs */}
              <button
                onClick={() => navigate("/streams")}
                className="nav-link"
              >
                <i className="bi bi-broadcast me-2"></i>
                Live Stream
              </button>
            </li>
          </ul>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="admin-content">
        <div className="container">
          {/* WELCOME CARD */}
          <div className="content-card mb-4">
            <div className="card-body text-center p-5">
              <div className="welcome-icon mb-4">
                <i
                  className="bi bi-people-fill"
                  style={{ fontSize: "4rem", color: "#4031c9" }}
                ></i>
              </div>
              <h1 className="fw-bold mb-3" style={{ color: "#4031c9" }}>
                Halaman Informasi
              </h1>
              <p className="lead text-muted mb-4">
                Silahkan bergabung untuk mendapatkan informasi lebih lanjut
                tentang kegiatan komunitas
              </p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <button
                  onClick={() => navigate("/register")}
                  className="btn btn-schedule-primary btn-lg"
                >
                  <i className="bi bi-person-plus me-2"></i>
                  Daftar Sekarang
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="btn btn-outline-primary btn-lg"
                >
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Masuk
                </button>
              </div>
            </div>
          </div>

          {/* PUBLIC POSTS */}
          {loading ? (
            <div className="content-card">
              <div className="card-body text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-3">Memuat pengumuman...</p>
              </div>
            </div>
          ) : publicPosts.length > 0 ? (
            <div className="content-card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-megaphone me-2"></i>
                  Pengumuman Terbaru ({publicPosts.length})
                </h5>
              </div>
              <div className="card-body">
                <div className="posts-container">
                  {publicPosts.map((post) => (
                    <div key={post.id} className="post-card mb-3">
                      <div className="post-header mb-3">
                        <div className="d-flex align-items-center">
                          <div className="user-avatar me-3">
                            {post.user?.name?.charAt(0).toUpperCase() || "A"}
                          </div>
                          <div>
                            <h6 className="fw-semibold mb-0">{post.title}</h6>
                            <small className="text-muted">
                              Oleh: {post.user?.name || "Admin"}
                              <span className="badge bg-primary ms-2">
                                {post.user?.role?.toUpperCase() || "ADMIN"}
                              </span>
                            </small>
                          </div>
                        </div>
                      </div>

                      <div className="post-content">
                        <p className="text-muted mb-2">{post.content}</p>
                      </div>

                      {/* Image if exists */}
                      {post.image_path && (
                        <div className="post-image mt-3">
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

                      <div className="post-footer mt-3 pt-3 border-top">
                        <small className="text-muted">
                          <i className="bi bi-chat-dots me-1"></i>
                          {post.comments?.length || 0} Komentar
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="content-card">
              <div className="card-body">
                <div className="empty-state">
                  <i className="bi bi-inbox"></i>
                  <p>Belum ada pengumuman</p>
                  <small className="text-muted">
                    Pengumuman akan ditampilkan di sini
                  </small>
                </div>
              </div>
            </div>
          )}

          {/* INFO FOOTER */}
          <div className="text-center mt-4 mb-4">
            <div
              className="alert alert-info d-inline-flex align-items-center"
              style={{
                border: "none",
                background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
              }}
            >
              <i
                className="bi bi-info-circle me-2"
                style={{ fontSize: "1.25rem" }}
              ></i>
              <span>Hubungi Admin jika ada masalah akses atau pertanyaan</span>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="admin-footer">
        <div className="container-fluid text-center">
          <small className="text-muted">
            &copy; 2025 Komunitas EE Lokal Soe. All rights reserved.
          </small>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
