import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area 
} from 'recharts';
import api from '../../api';
import 'bootstrap/dist/css/bootstrap.min.css';
import './analytics-style.css';

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('day'); // default: per hari

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/admin/analytics/stats?range=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted mt-3">Memuat data analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  const COLORS = ['#e91111ff', '#2c01a3ff', '#10b981', '#f59e0b'];

  const userRoleData = [
    { name: 'Admin', value: stats.users_by_role.admin || 0 },
    { name: 'Staf', value: stats.users_by_role.staf || 0 },
    { name: 'Anggota', value: stats.users_by_role.anggota || 0 }
  ];


  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <div className="content-card mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="bi bi-graph-up me-2"></i>
              Analytics Dashboard
            </h5>

            <div className="btn-group" role="group">
              <button 
                className={`btn btn-sm ${timeRange === 'day' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setTimeRange('day')}
              >
                Per Hari
              </button>
              <button 
                className={`btn btn-sm ${timeRange === 'minute' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setTimeRange('minute')}
              >
                Per Menit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="stats-card">
            <div className="stats-icon bg-primary">
              <i className="bi bi-people-fill"></i>
            </div>
            <div className="stats-content">
              <h6>Total Users</h6>
              <h3>{stats.summary.total_users}</h3>
              <small className="text-success">
                <i className="bi bi-arrow-up"></i> {stats.summary.new_users_today} hari ini
              </small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="stats-card">
            <div className="stats-icon bg-info">
              <i className="bi bi-file-post"></i>
            </div>
            <div className="stats-content">
              <h6>Total Posts</h6>
              <h3>{stats.summary.total_posts}</h3>
              <small className="text-muted">Pengumuman</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="stats-card">
            <div className="stats-icon bg-success">
              <i className="bi bi-eye-fill"></i>
            </div>
            <div className="stats-content">
              <h6>Total Views</h6>
              <h3>{stats.summary.total_views}</h3>
              <small className="text-muted">Post views</small>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="stats-card">
            <div className="stats-icon bg-warning">
              <i className="bi bi-person-badge"></i>
            </div>
            <div className="stats-content">
              <h6>Active Staff</h6>
              <h3>{stats.summary.active_staff}</h3>
              <small className="text-muted">Staf aktif</small>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Row 1 */}
      <div className="row g-3 mb-4">
        <div className="col-md-8">
          <div className="chart-card">
            <h6 className="mb-3">
              <i className="bi bi-person-plus me-2"></i>
              Registrasi {timeRange === 'minute' ? 'Per Menit' : 'Per Hari'}
            </h6>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.registrations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#4031c9" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-md-4">
          <div className="chart-card">
            <h6 className="mb-3">
              <i className="bi bi-pie-chart me-2"></i>
              Distribusi User
            </h6>
            <div className='d-flex flex-row gap-3'>
            <p className='text-danger'>Admin</p>
            <p className='text-primary'>Staf</p>
            <p className='text-success'>Anggota</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart Row 2 */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="chart-card">
            <h6 className="mb-3">
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Login {timeRange === 'minute' ? 'Per Menit' : 'Per Hari'}
            </h6>
 <ResponsiveContainer width="100%" height={300}>
  <LineChart data={stats.logins}>
    <defs>
      {/* Warna gradasi di bawah garis */}
      <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#4031c9" stopOpacity={0.4}/>
        <stop offset="95%" stopColor="#4031c9" stopOpacity={0}/>
      </linearGradient>
    </defs>

    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="label" />
    <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
    <Tooltip />
    <Legend />

    {/* Garis utama */}
    <Line
      type="monotone"
      dataKey="total"
      stroke="#1af738ff"
      strokeWidth={2}
      fillOpacity={1}
      fill="url(#colorRegistrations)"
      name="Login"
      dot={false} // hilangkan titik-titik kecil di tiap data (opsional)
    />

    {/* Area di bawah garis */}
    <Area
      type="monotone"
      dataKey="total"
      stroke="none"
      fill="url(#colorRegistrations)"
    />
  </LineChart>
</ResponsiveContainer>
          </div>
        </div>

        <div className="col-md-6">
          <div className="chart-card">
            <h6 className="mb-3">
              <i className="bi bi-eye me-2"></i>
              Post Views {timeRange === 'minute' ? 'Per Menit' : 'Per Hari'}
            </h6>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.post_views}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#f10c0c" name="Views" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Posts Table */}
      <div className="chart-card">
        <h6 className="mb-3">
          <i className="bi bi-trophy me-2"></i>
          Top 5 Post Terpopuler
        </h6>
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Judul Post</th>
                <th className="text-end">Total Views</th>
              </tr>
            </thead>
            <tbody>
              {stats.top_posts.map((post, index) => (
                <tr key={post.id}>
                  <td>
                    <span className={`badge ${index === 0 ? 'bg-warning' : index === 1 ? 'bg-secondary' : 'bg-light text-dark'}`}>
                      {index + 1}
                    </span>
                  </td>
                  <td>{post.title}</td>
                  <td className="text-end">
                    <strong>{post.views}</strong> views
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
