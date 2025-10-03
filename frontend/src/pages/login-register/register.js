import React, { useState } from "react";
import axios from "axios";
import "./style.css";

function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTermsChange = (e) => {
    setAgreeTerms(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError(null);

    if (!agreeTerms) {
      setError("You must agree to the Terms & Conditions.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:8000/api/register", formData);

      console.log("Register success:", res.data); // debug
      setMessage(res.data.message || "Registration Successful! Please login.");
      setFormData({ name: "", email: "", password: "", password_confirmation: "" });
      setAgreeTerms(false);
    } catch (err) {
      console.error("Register error:", err.response || err); // debug error
      let errorMessage = err.response?.data?.message || "Registration Failed. Please try again.";
      if (err.response?.data?.errors) {
        // tampilkan error validasi Laravel
        errorMessage = Object.values(err.response.data.errors).flat().join(" ");
      }
      setError(errorMessage);
    }
  };

  return (
    <div className="form-container">
      {/* KOLOM KIRI */}
      <div className="left-panel">
        <h2>Create your Account</h2>
        <p>
          Come and join to <strong>EE Lokal Soe</strong>
        </p>
      </div>

      {/* KOLOM KANAN */}
      <div className="right-panel">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          {/* Username */}
          <label htmlFor="name">Username</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Input Username"
            onChange={handleChange}
            value={formData.name}
            required
          />

          {/* Email */}
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email address"
            onChange={handleChange}
            value={formData.email}
            required
          />

          {/* Password */}
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

          {/* Confirm Password */}
          <label htmlFor="password_confirmation">Confirm Password</label>
          <input
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            placeholder="Confirm Password"
            onChange={handleChange}
            value={formData.password_confirmation}
            required
          />

          {/* Terms */}
          <div className="terms">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={handleTermsChange}
            />
            <label htmlFor="terms">Accept Terms & Conditions</label>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={!agreeTerms}>
            Join us <span className="arrow-icon">→</span>
          </button>
        </form>

        {/* Pesan Sukses/Gagal */}
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <p>
          Sudah punya akun? <a href="/Login">Login di sini.</a>
        </p>
      </div>
    </div>
  );
}

export default RegisterForm;
