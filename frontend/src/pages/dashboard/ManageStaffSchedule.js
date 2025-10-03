// frontend/src/pages/ManageStaffSchedule.js

import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useParams, useNavigate } from 'react-router-dom';

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

    const fetchSchedules = async () => {
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

    return (
        <div className="container mx-auto p-4">
            <button onClick={() => navigate('/admin/users')} className="text-indigo-500 mb-4">&larr; Kembali ke Admin Panel</button>
            <h1 className="text-3xl font-bold mb-4">Kelola Jadwal untuk Staf: {staff.name} ({staff.role})</h1>

            {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>}
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

            {/* Form Tambah Jadwal */}
            <div className="mb-8 border p-4 rounded-lg bg-gray-50">
                <h2 className="text-xl font-semibold mb-3">Tambah Jadwal Baru</h2>
                <form onSubmit={handleAddSchedule} className="space-y-3">
                    <input 
                        name="activity" 
                        value={newSchedule.activity} 
                        onChange={handleChange} 
                        placeholder="Kegiatan (Mis: Rapat Bulanan)" 
                        required 
                        className="w-full p-2 border rounded"
                    />
                    <div className="flex space-x-3">
                        <input 
                            name="scheduled_start" 
                            type="datetime-local" 
                            value={newSchedule.scheduled_start} 
                            onChange={handleChange} 
                            required 
                            className="w-full p-2 border rounded"
                        />
                        <input 
                            name="scheduled_end" 
                            type="datetime-local" 
                            value={newSchedule.scheduled_end} 
                            onChange={handleChange} 
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <input 
                        name="location" 
                        value={newSchedule.location} 
                        onChange={handleChange} 
                        placeholder="Lokasi (Opsional)" 
                        className="w-full p-2 border rounded"
                    />
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
                        Simpan Jadwal
                    </button>
                </form>
            </div>

            {/* Daftar Jadwal */}
            <h2 className="text-2xl font-bold mb-3">Daftar Jadwal Staf</h2>
            {schedules.length === 0 ? (
                <p>Tidak ada jadwal yang ditemukan untuk staf ini.</p>
            ) : (
                <table className="table-auto w-full text-left whitespace-no-wrap border">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="px-4 py-2">Kegiatan</th>
                            <th className="px-4 py-2">Mulai</th>
                            <th className="px-4 py-2">Selesai</th>
                            <th className="px-4 py-2">Lokasi</th>
                            <th className="px-4 py-2">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.map((schedule) => (
                            <tr key={schedule.id} className="border-t">
                                <td className="px-4 py-2">{schedule.activity}</td>
                                <td className="px-4 py-2">{new Date(schedule.scheduled_start).toLocaleString()}</td>
                                <td className="px-4 py-2">{schedule.scheduled_end ? new Date(schedule.scheduled_end).toLocaleString() : '-'}</td>
                                <td className="px-4 py-2">{schedule.location || '-'}</td>
                                <td className="px-4 py-2">
                                    <button 
                                        onClick={() => handleDeleteSchedule(schedule.id)}
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ManageStaffSchedule;