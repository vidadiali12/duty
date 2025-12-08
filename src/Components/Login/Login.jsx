import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./Login.css";
import logo from "../../Logos/logo.png";
import api from "../../api";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const response = await api.post("/auth/signIn", {
                username: username, password: password
            });
            localStorage.setItem("myUserDutyToken", response?.data?.data?.accessToken);
            localStorage.setItem("tokenExpiration", response?.data?.data?.tokenExpDate);
            localStorage.setItem("firstLogin", 1);

            window.location.href = "/";
        } catch (err) {
            setError("Username və ya password səhvdir");
            console.log(err)
            console.log(username, password)
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <img src={logo} alt="Logo" className="login-logo" />
                <h2>Növbətçi Sistemi</h2>
                {error && <p className="error">{error}</p>}

                <label>İstifadəçi adı</label>
                <input
                    type="text"
                    placeholder="İstifadəçi adınızı daxil edin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />

                <label>Parol</label>
                <div className="password-wrapper">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Parolunuzu daxil edin"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <span
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                    </span>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Loading..." : "Daxil ol"}
                </button>
            </form>
        </div>
    );
};

export default Login;
