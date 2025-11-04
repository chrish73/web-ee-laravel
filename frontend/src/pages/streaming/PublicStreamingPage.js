import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const PublicStreamingPage = () => {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreams();
  }, []);

  const fetchStreams = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/public/streams");
      setStreams(res.data);
    } catch (error) {
      console.error("Gagal memuat stream:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center mt-5">Memuat...</p>;
  if (streams.length === 0)
    return (
      <div className="text-center mt-5">
        <h4>Tidak Ada Live Stream Aktif</h4>
        <p>Belum ada streaming yang berlangsung saat ini. Silakan cek kembali nanti.</p>
      </div>
    );

  return (
    <div className="container mt-5 mb-5">
      <h2 className="text-center mb-4 fw-bold">
        <i className="bi bi-broadcast me-2"></i> Live Streaming
      </h2>

      <div className="row justify-content-center">
        {streams.map((stream) => (
          <div key={stream.id} className="col-lg-8 col-md-10 col-sm-12 mb-5">
            <div className="card shadow-lg border-0">
              <div className="card-body">
                <h5 className="fw-semibold mb-2">{stream.title}</h5>
                <p className="text-muted mb-3">{stream.description}</p>

                <div className="video-wrapper ratio ratio-16x9 rounded overflow-hidden">
                  <iframe
                    src={stream.youtube_url.replace("watch?v=", "embed/")}
                    title={stream.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "0",
                    }}
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicStreamingPage;
