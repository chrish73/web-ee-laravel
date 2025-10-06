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

  useEffect(() => {
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
    const fetchPublicPosts = async () => {
      try {
        const res = await api.get("/posts");
        setPublicPosts(res.data);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
    };
    if (!token) fetchPublicPosts();
  }, [token]);

  return (
    <div className="admin-wrapper">
      {/* ===== HEADER ===== */}
      <header className="admin-header">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center">
            <div className="header-left">
              <h2 className="mb-0">
                <i className="bi bi-house-door me-2"></i>
                Selamat Datang
              </h2>
              <p className="text-muted mb-0 small">Komunitas EE Lokal Soe</p>
            </div>
            <div className="header-right d-flex gap-3">
              <button
                onClick={() => navigate("/register")}
                className="btn btn-outline-light"
              >
                <i className="bi bi-person-add me-2"></i> Daftar
              </button>
              <button
                onClick={() => navigate("/login")}
                className="btn btn-outline-light"
              >
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Login
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== CONTENT ===== */}
      <main className="admin-content">
        <div className="container">
          <div className="content-card p-4 text-center">
            <div className="card-header border-0 bg-transparent mb-4">
              <h1 className="fw-bold mb-1" style={{ color: "#4031c9" }}>
                Halaman Informasi
              </h1>
              <p className="lead text-muted">
                Silahkan bergabung untuk mendapatkan informasi lebih lanjut
              </p>
            </div>

            {/* Public Posts */}
            {publicPosts.length > 0 && (
              <div className="mt-4 pt-4 border-top text-start">
                <h4 className="fw-semibold mb-3">
                  <i
                    className="bi bi-megaphone me-2"
                    style={{ color: "#4031c9" }}
                  ></i>
                  Pengumuman Terbaru
                </h4>
                <div className="list-group">
                  {publicPosts.map((post) => (
                    <div
                      key={post.id}
                      className="list-group-item shadow-sm mb-3 rounded-3 border-0"
                    >
                      <h6 className="fw-semibold mb-1">{post.title}</h6>
                      <p
                        className="mb-1 text-muted"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          fontSize: "0.9rem",
                        }}
                      >
                        {post.content}
                      </p>
                      <small className="text-primary d-block">
                        Oleh: {post.user?.name || "Admin"}
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="mt-4 text-muted small">
              Hubungi Admin jika ada masalah akses.
            </p>
          </div>
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="admin-footer">
        <div className="container-fluid text-center">
          <small className="text-muted">
            &copy; 2025 Komunitas EE Lokal Soe
          </small>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
