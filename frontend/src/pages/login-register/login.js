// login-form-user.js

import React, { useState } from "react";
// import axios from "axios";
import { useNavigate } from "react-router-dom"; // PENTING: Import useNavigate
import "./style.css";
import api from "../../api";

// Fungsi Helper untuk menentukan rute dashboard berdasarkan role
const getDashboardPath = (role) => {
    switch(role) {
        case 'admin':
            return '/dashboard/admin';
        case 'staf':
            return '/dashboard/staf';
        case 'anggota':
            return '/dashboard/anggota';
        default:
            // Jika role tidak dikenal, arahkan ke dashboard default atau login
            return '/dashboard/anggota';
    }
}

function LoginForm() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);
    const navigate = useNavigate(); // Inisialisasi useNavigate

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/login", formData);

            // --- PERUBAHAN UTAMA DI SINI ---
            const token = res.data.access_token;
            const role = res.data.user.role; 

            // 1. Simpan Token dan Role ke Local Storage
            localStorage.setItem('token', token);
            localStorage.setItem('userRole', role);

            // 2. Tentukan Path Dashboard
            const dashboardPath = getDashboardPath(role);

            setMessage(res.data.message || "Login Successful");
            setIsError(false);
            
            // 3. Arahkan ke Dashboard yang Sesuai
            navigate(dashboardPath, { replace: true });

        } catch (error) {
            let errMsg = "Login Failed. Please try again.";
            
            if (error.response?.data?.message) {
                // Pesan error umum dari Laravel (misalnya: Email atau Password salah)
                errMsg = error.response.data.message;
            } else if (error.response?.data?.errors) {
                // Penanganan error validasi (422)
                const errors = error.response.data.errors;
                errMsg = Object.values(errors).flat().join(" ");
            }

            setMessage(errMsg);
            setIsError(true);
        }
    };

    return (
        <div className="form-container">
            {/* KOLOM KIRI: VISUAL */}
            <div className="left-panel">
                <h2>Login to your Account!</h2>
                <p>Welcome to <strong>EE Lokal Soe</strong></p>
            </div>

            {/* KOLOM KANAN: FORMULIR */}
            <div className="right-panel">
                <h2>Sign In</h2>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Email address"
                        onChange={handleChange}
                        value={formData.email}
                        required
                    />

                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Password"
                        onChange={handleChange}
                        value={formData.password}
                        required
                    />

                    <button type="submit">Login</button>

                    {message && (
                        <p className={isError ? "error-message" : "success-message"}>
                            {message}
                        </p>
                    )}
                </form>

                <p>
                    Belum punya akun? <a href="/Register">Daftar di sini.</a><br></br>
                    <a href="/">Kembali ke beranda</a>
                </p>
            </div>
        </div>
    );
}

export default LoginForm;