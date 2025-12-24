import React, { useEffect, useState } from "react";
import "./Roles.css";
import api from "../../../api";

export default function RoleUpdate({ item, setItem, setResponseRequest, setIsEdit }) {

    const [permissions, setPermissions] = useState([]);
    const [form, setForm] = useState({
        roleName: "",
        permissionIds: []
    });

    const headers = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem("myUserDutyToken")}` }
    });

    const loadPermissions = async () => {
        const res = await api.get("/admin/role/getPermissions", headers());
        setPermissions(res?.data?.data || []);
    };

    const loadRoleDetails = async () => {
        const res = await api.get(`/admin/role/getRoleDetails/${item?.id}`, headers());
        setForm({
            roleName: res.data.data.name,
            permissionIds: res.data.data.permissions.map(p => p.id)
        });
    };

    const updateRole = async () => {
        try {
            await api.put(`/admin/role/updateRole/${item.id}`, form, headers());
            setResponseRequest({ showResponse: true, title: "✅ Rol yeniləndi" });
            setItem(null);
            setIsEdit(false);
            window.location.reload();
        } catch {
            setResponseRequest({ showResponse: true, title: "❌ Update olmadı" });
        }
    };

    useEffect(() => {
        loadPermissions();
        loadRoleDetails();
    }, []);

    if (!item) return null;

    return (
        <div className="role-modal">
            <div className="role-box">
                <h3>Rol redaktə et</h3>

                <input
                    value={form.roleName}
                    placeholder="Rol adı"
                    onChange={e => setForm(p => ({ ...p, roleName: e.target.value }))}
                />

                <div className="permission-box">
                    {permissions.map(p => (
                        <label key={p.id}>
                            <input
                                type="checkbox"
                                checked={form.permissionIds.includes(p.id)}
                                onChange={() =>
                                    setForm(prev => ({
                                        ...prev,
                                        permissionIds: prev.permissionIds.includes(p.id)
                                            ? prev.permissionIds.filter(x => x !== p.id)
                                            : [...prev.permissionIds, p.id]
                                    }))
                                }
                            />
                            <span className="permission-text">
                                {p.permission}
                            </span>
                        </label>
                    ))}
                </div>

                <div className="role-footer">
                    <button onClick={() => {
                        setItem(null);
                        setIsEdit(false);
                        }}>Geri</button>
                    <button onClick={updateRole}>Yadda saxla</button>
                </div>
            </div>
        </div>
    );
}
