import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./streaming-style.css";
import axios from "axios";

const LiveStreamingPage = () => {
  const navigate = useNavigate();
  const [youtubeLink, setYoutubeLink] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [message, setMessage] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [allStreams, setAllStreams] = useState([]); // ✅ Tambahan untuk daftar stream

  const userRole = localStorage.getItem("userRole");
  const userName = localStorage.getItem("userName") || "User";
  const canCreateStream = userRole === "admin" || userRole === "staf";
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchStreams(); // ✅ Ambil semua stream dari server
  }, []);

  // Ambil semua stream dari backend
  const fetchStreams = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/public/streams");
      setAllStreams(res.data);
    } catch (error) {
      console.error("Gagal memuat daftar stream:", error);
    }
  };

  // Ambil ID YouTube dari link
  const extractYouTubeId = (url) => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Simpan stream baru
  const handleSaveStream = async (e) => {
    e.preventDefault();
    const videoId = extractYouTubeId(youtubeLink);

    if (!videoId) {
      setMessage("URL YouTube tidak valid!");
      return;
    }

    const embed = `https://www.youtube.com/embed/${videoId}`;

    try {
      await axios.post(
        "http://localhost:8000/api/streams",
        {
          title: "Live Streaming Komunitas EE Soe",
          description: "Streaming ibadah langsung dari YouTube",
          youtube_url: embed,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEmbedUrl(embed);
      setMessage("Tautan YouTube berhasil disimpan ke server!");
      setShowCreateModal(false);
      setYoutubeLink("");
      fetchStreams(); // ✅ Refresh daftar stream
    } catch (error) {
      console.error(error);
      setMessage("Gagal menyimpan tautan ke server.");
    }
  };

  // Hapus stream tertentu
  const handleDeleteStream = async (id) => {
    if (!window.confirm("Yakin ingin menghapus stream ini?")) return;

    try {
      await axios.delete(`http://localhost:8000/api/streams/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage("Stream berhasil dihapus.");
      fetchStreams();
    } catch (error) {
      console.error("Gagal menghapus stream:", error);
      setMessage("Gagal menghapus stream.");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
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
              <button
                onClick={() => navigate(-1)}
                className="btn btn-outline-light"
              >
                <i className="bi bi-arrow-left me-2"></i>Kembali
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
      <main className="admin-content" style={{ marginTop: "100px" }}>
        <div className="container-fluid">
          {message && (
            <div
              className="alert alert-info alert-dismissible fade show"
              role="alert"
            >
              <i className="bi bi-info-circle me-2"></i>
              {message}
              <button
                type="button"
                className="btn-close"
                onClick={() => setMessage(null)}
              ></button>
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
                Masukkan Link YouTube
              </button>
            </div>
          )}

          {/* PLAYER */}
          <div className="content-card text-center p-4 mb-5">
            {embedUrl ? (
              <div className="ratio ratio-16x9">
                <iframe
                  src={embedUrl}
                  title="YouTube Live"
                  allowFullScreen
                ></iframe>
              </div>
            ) : (
              <div className="empty-state">
                <i className="bi bi-camera-video-off"></i>
                <p>Tidak Ada Live Stream Aktif</p>
                <small className="text-muted">
                  Belum ada link YouTube yang ditambahkan.
                </small>
              </div>
            )}
          </div>

          {/* ✅ STREAM LIST UNTUK ADMIN / STAF */}
          {canCreateStream && (
            <div className="content-card p-4">
              <h5 className="fw-bold mb-3">
                <i className="bi bi-collection-play me-2 text-primary"></i>
                Daftar Live Stream yang Sudah Diunggah
              </h5>

              {allStreams.length === 0 ? (
                <p className="text-muted">Belum ada stream yang diunggah.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped align-middle">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Judul</th>
                        <th>Deskripsi</th>
                        <th>Link YouTube</th>
                        <th>Tanggal Upload</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allStreams.map((stream, index) => (
                        <tr key={stream.id}>
                          <td>{index + 1}</td>
                          <td>{stream.title}</td>
                          <td>{stream.description || "-"}</td>
                          <td>
                            <button
                              onClick={() => {
                                const match =
                                  stream.youtube_url.match(/embed\/([^?]+)/);
                                const videoId = match ? match[1] : null;
                                if (videoId) {
                                  window.open(
                                    `https://www.youtube.com/watch?v=${videoId}`,
                                    "_blank"
                                  );
                                } else {
                                  alert("Link video tidak valid");
                                }
                              }}
                              className="btn btn-outline-primary btn-sm"
                            >
                              <i className="bi bi-play-circle me-1"></i>Lihat
                              Video
                            </button>
                          </td>
                          <td>
                            {new Date(stream.created_at).toLocaleString(
                              "id-ID"
                            )}
                          </td>
                          <td>
                            <button
                              onClick={() => handleDeleteStream(stream.id)}
                              className="btn btn-sm btn-outline-danger"
                            >
                              <i className="bi bi-trash me-1"></i> Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* MODAL INPUT LINK */}
      {showCreateModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-youtube me-2 text-danger"></i>
                  Masukkan Link YouTube
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSaveStream}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      URL YouTube
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="contoh: https://www.youtube.com/watch?v=abcd1234xyz"
                      value={youtubeLink}
                      onChange={(e) => setYoutubeLink(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Batal
                  </button>
                  <button type="submit" className="btn btn-schedule-primary">
                    <i className="bi bi-save me-2"></i>
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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

export default LiveStreamingPage;
