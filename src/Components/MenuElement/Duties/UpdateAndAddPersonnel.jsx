import React, { useState, useEffect } from "react";
import api from "../../../api";
import "./UpdateAndAddPersonnel.css";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function UpdateAndAddPersonnel({ item, setItem, ranks, setCreateAndUpdate, apiOpe, typeOpe }) {

    const keys = {
        username: "İstifadəçi adı",
        email: "Mail Ünvanı",
        fin: "Fin",
        name: "Ad",
        surname: "Soyad",
        fatherName: "Ata adı",
        rankId: "Rütbə",
        position: "Vəzifə"
    }

    const keysOfForm = {
        username: "",
        email: "",
        fin: "",
        name: "",
        surname: "",
        fatherName: "",
        rankId: "",
        position: "",
        roleId: "",
    };

    const keysOfErrs = {
        username: "",
        email: "",
        fin: "",
        name: "",
        surname: "",
        fatherName: "",
        rankId: "",
        position: "",
        roleId: "",
    }

    const [form, setForm] = useState(item ? keysOfForm : { ...keysOfForm, password: "" });

    const [formKey, setFormKey] = useState(item ? keys : { ...keys, password: 'Parol' });

    const [errs, setErrs] = useState(item ? keysOfErrs : { ...keysOfErrs, password: '' });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [rols, setRols] = useState(null);
    const [eye, setEye] = useState(false);

    useEffect(() => {
        if (item) {
            setForm({
                username: item?.username || "",
                email: item?.email || "",
                fin: item?.person?.fin || "",
                name: item?.person?.name || "",
                surname: item?.person?.surname || "",
                fatherName: item?.person?.fatherName || "",
                rankId: item?.person?.rank?.id || "",
                position: item?.person?.position || "",
                roleId: item.role?.id || "",
            });
        }
    }, [item]);

    const callRols = async () => {
        const token = localStorage.getItem('myUserDutyToken');
        const hdrs = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        const resRols = await api.get("/admin/role/getAllRole", hdrs);
        setRols(resRols?.data?.data || [])
    }

    useEffect(() => {
        callRols()
    }, []);

    const handleRank = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: Number(value) }));
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const validationOfForm = () => {
        const newErrs = {}
        let countOfBlankFields = 0;
        Object.entries(formKey).forEach(([keysOfKF, valuesOfKF]) => {
            if (form[keysOfKF].toString().trim() == "") {
                countOfBlankFields++;
                newErrs[keysOfKF] = `${valuesOfKF} Boş qala bilməz`
            };
        });

        setErrs(newErrs);

        return countOfBlankFields;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const inValidFieldsCount = validationOfForm();

        if (inValidFieldsCount > 0) return;
        setLoading(true);
        setError("");

        try {
            if (typeOpe == "editOpe") {
                await api.put(apiOpe, form);
            }
            else if (typeOpe == "createOpe") {
                await api.post(apiOpe, form);
            }
            setItem(null);
            setCreateAndUpdate(false);
            window.location.reload();
        } catch (err) {
            console.error(err);
            setError("Məlumatları yeniləmək mümkün olmadı.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="update-personnel-wrapper">
            <div className="update-personnel-card">
                <h2>{
                    typeOpe == "editOpe" ? "İstifadəçi Yeniləmə" : "İstifadəçi Yaradılması"
                }</h2>
                <form onSubmit={handleSubmit}>
                    <div className="box-of-fields">
                        <label>Username</label>
                        <input name="username" value={form.username} onChange={handleChange} placeholder="İstifadəçi adı: " />
                        {
                            errs.username && (
                                <span className="err-of-personnal-fields">{errs.username}</span>
                            )
                        }
                    </div>

                    {
                        !item && (
                            <div className="box-of-fields">
                                <label>Parol</label>
                                <input name="password" value={form.password} onChange={handleChange}
                                    placeholder="Parol: " autoComplete="off" type={!eye ? "password" : "text"}
                                />
                                {
                                    !eye ? <FiEye onClick={() => setEye(!eye)} className="eye-icon" /> : <FiEyeOff onClick={() => setEye(!eye)} className="eye-icon" />
                                }
                                {
                                    errs.password && (
                                        <span className="err-of-personnal-fields">{errs.password}</span>
                                    )
                                }
                            </div>
                        )
                    }

                    <div className="box-of-fields">
                        <label>Email</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email: " />
                        {
                            errs.email && (
                                <span className="err-of-personnal-fields">{errs.email}</span>
                            )
                        }
                    </div>

                    <div className="box-of-fields">
                        <label>FIN</label>
                        <input name="fin" value={form.fin} onChange={handleChange} placeholder="Fin: " />
                        {
                            errs.fin && (
                                <span className="err-of-personnal-fields">{errs.fin}</span>
                            )
                        }
                    </div>

                    <div className="box-of-fields">
                        <label>Ad</label>
                        <input name="name" value={form.name} onChange={handleChange} placeholder="Ad: " />
                        {
                            errs.name && (
                                <span className="err-of-personnal-fields">{errs.name}</span>
                            )
                        }
                    </div>
                    <div className="box-of-fields">
                        <label>Soyad</label>
                        <input name="surname" value={form.surname} onChange={handleChange} placeholder="Soyad: " />
                        {
                            errs.surname && (
                                <span className="err-of-personnal-fields">{errs.surname}</span>
                            )
                        }
                    </div>

                    <div className="box-of-fields">
                        <label>Ata adı</label>
                        <input name="fatherName" value={form.fatherName} onChange={handleChange} placeholder="Ata adı: " />
                        {
                            errs.fatherName && (
                                <span className="err-of-personnal-fields">{errs.fatherName}</span>
                            )
                        }
                    </div>

                    <div className="box-of-fields">
                        <label>Rütbə</label>
                        <select name="rankId" id="rankId" value={form.rankId} onChange={handleRank}>
                            <option value="">Rütbə seç</option>
                            {ranks?.map((r, index) => {
                                return <option value={r?.id} key={index}>
                                    {r.name}
                                </option>
                            })}
                        </select>
                        {
                            errs.rankId && (
                                <span className="err-of-personnal-fields">{errs.rankId}</span>
                            )
                        }
                    </div>

                    <div className="box-of-fields">
                        <label>Vəzifə</label>
                        <input name="position" value={form.position} onChange={handleChange} placeholder="Vəzifə: " />
                        {
                            errs.position && (
                                <span className="err-of-personnal-fields">{errs.position}</span>
                            )
                        }
                    </div>

                    <div className="box-of-fields">
                        <label>Durum</label>
                        <select name="roleId" id="roleId" value={form.roleId} onChange={handleRank}>
                            <option value="">Durum seç</option>
                            {rols?.map((r, index) => {
                                return <option value={r?.id} key={index}>
                                    {r.name}
                                </option>
                            })}
                        </select>
                        {
                            errs.roleId && (
                                <span className="err-of-personnal-fields">{errs.roleId}</span>
                            )
                        }
                    </div>

                    {error && <p className="error">{error}</p>}

                    <div className="buttons">
                        <button type="submit" disabled={loading}>
                            {loading ? "Yenilənir..." : typeOpe == "editOpe" ? "Yenilə" : "Hesab Yarat"}
                        </button>
                        <button type="button" onClick={() => {
                            setCreateAndUpdate(false);
                            setItem(null);
                        }} className="cancel">
                            Ləğv et
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
