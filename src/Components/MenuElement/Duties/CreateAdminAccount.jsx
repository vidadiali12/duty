import React, { useState, useEffect } from "react";
import "./CreateAdminAccount.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../../../api";

const CreateAdminAccount = ({ setShowCreate, setResponseRequest }) => {

    const [form, setForm] = useState({
        username: "",
        password: "",
        email: "",
        fin: "",
        name: "",
        surname: "",
        fatherName: "",
        rankId: "",
        position: "",
        adminUsername: "",
        adminPassword: ""
    });

    const [ranks, setRanks] = useState([]);
    const [showPass, setShowPass] = useState(false);
    const [showAdminPass, setShowAdminPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchRanks = async () => {
        try {

            const res = await api.get("/rank/getAllRank");
            setRanks(res?.data?.data || []);
        } catch (err) {
            console.log("Rütbə sorğusu xətası:", err);
        }
    };

    useEffect(() => {
        fetchRanks();
    }, []);

    const onChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const onSubmit = async () => {
        setLoading(true);
        try {
            await api.post("/admin/auth/signUp", form);
            setShowCreate(false);
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                isQuestion: false,
                title: "✅ Hesab uğurla yaradıldı!",
                type: "createAdminAccDuty"
            }))
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="su-wrapper">

            <div className="su-box">

                <button className="su-close" onClick={() => setShowCreate(false)}>✖</button>

                <h2>Yeni Admin Hesabı</h2>

                <div className="su-grid">

                    <label>
                        <span>İstifadəçi adı</span>
                        <input
                            name="username"
                            placeholder="İstifadəçi adı"
                            value={form.username}
                            onChange={onChange}
                        />
                    </label>

                    <label>
                        <span>Email</span>
                        <input
                            name="email"
                            placeholder="example@mail.com"
                            value={form.email}
                            onChange={onChange}
                        />
                    </label>

                    <label>
                        <span>FİN</span>
                        <input
                            name="fin"
                            placeholder="FIN kodu"
                            value={form.fin}
                            onChange={onChange}
                        />
                    </label>

                    <label>
                        <span>Ad</span>
                        <input
                            name="name"
                            placeholder="Ad"
                            value={form.name}
                            onChange={onChange}
                        />
                    </label>

                    <label>
                        <span>Soyad</span>
                        <input
                            name="surname"
                            placeholder="Soyad"
                            value={form.surname}
                            onChange={onChange}
                        />
                    </label>

                    <label>
                        <span>Ata adı</span>
                        <input
                            name="fatherName"
                            placeholder="Ata adı"
                            value={form.fatherName}
                            onChange={onChange}
                        />
                    </label>

                    <label className="select-wrapper">
                        <span>Rütbə</span>
                        <select
                            name="rankId"
                            value={form.rankId}
                            onChange={onChange}
                            className="select-box"
                        >
                            <option value="">Rütbə seçin</option>
                            {ranks?.map(r => (
                                <option key={r.id} value={r.id}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label>
                        <span>Vəzifə</span>
                        <input
                            name="position"
                            placeholder="Vəzifə"
                            value={form.position}
                            onChange={onChange}
                        />
                    </label>

                    <label className="su-pass-wrapper">
                        <span>İstifadəçi Parolu</span>
                        <input
                            type={showPass ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Parol"
                            name="password"
                            value={form.password}
                            onChange={onChange}
                        />
                        <i onClick={() => setShowPass(!showPass)}>
                            {showPass ? <FaEyeSlash /> : <FaEye />}
                        </i>
                    </label>

                    <label>
                        <span>Admin İstifadəçi adı</span>
                        <input
                            name="adminUsername"
                            placeholder="Admin istifadəçi adı"
                            value={form.adminUsername}
                            onChange={onChange}
                        />
                    </label>

                    <label className="su-pass-wrapper">
                        <span>Admin Parolu</span>
                        <input
                            type={showAdminPass ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Admin parolu"
                            name="adminPassword"
                            value={form.adminPassword}
                            onChange={onChange}
                        />
                        <i onClick={() => setShowAdminPass(!showAdminPass)}>
                            {showAdminPass ? <FaEyeSlash /> : <FaEye />}
                        </i>
                    </label>

                </div>

                <button className="su-btn" disabled={loading} onClick={onSubmit}>
                    {loading ? "Göndərilir..." : "Yarat"}
                </button>

            </div>

        </div>
    );
};

export default CreateAdminAccount;
