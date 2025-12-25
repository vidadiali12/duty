import React, { useEffect, useState } from "react";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import "./Roles.css";
import api from "../../../api";
import RoleUpdate from "./RoleUpdate";

export default function Roles({ item, setItem, setResponseRequest, userInfo }) {

    if (userInfo?.role?.name !== "Admin") {
        return <p style={{ color: "red", marginTop: '20px', paddingLeft: '10px' }}>Bu səhifəyə giriş icazəniz yoxdur.</p>;
    }

    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [showCreate, setShowCreate] = useState(false);
    const [isEdit, setIsEdit] = useState(null)

    const [form, setForm] = useState({
        roleName: "",
        permissionIds: []
    });

    const headers = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem("myUserDutyToken")}` }
    });

    const loadRoles = async () => {
        const res = await api.get("/admin/role/getAllRole", headers());
        setRoles(res?.data?.data || []);
    };

    const loadPermissions = async () => {
        const res = await api.get("/admin/role/getPermissions", headers());
        setPermissions(res?.data?.data || []);
    };

    const togglePermission = (id) => {
        setForm(prev => ({
            ...prev,
            permissionIds: prev.permissionIds.includes(id)
                ? prev.permissionIds.filter(x => x !== id)
                : [...prev.permissionIds, id]
        }));
    };

    const createRole = async () => {
        if (!form.roleName) {
            setResponseRequest({ showResponse: true, title: "❌ Rol adı boş ola bilməz" });
            return;
        }

        try {
            await api.post("/admin/role/createRole", form, headers());
            setResponseRequest({ showResponse: true, title: "✅ Rol yaradıldı" });
            setForm({ roleName: "", permissionIds: [] });
            setShowCreate(false);
            loadRoles();
        } catch (err) {
            setResponseRequest({ showResponse: true, title: "❌ Xəta", message: err });
        }
    };

    const deleteRole = async (id) => {
        setResponseRequest(prev => (
            {
                ...prev,
                title: 'Bu rolu silməyə əminsiz?',
                isQuestion: true,
                api: `/admin/role/deleteRole/${id}`,
                showResponse: true,
                type: 'deleteThisRole'
            }
        ))
    };

    useEffect(() => {
        setItem(null);
        loadRoles();
        loadPermissions();
    }, []);

    return (
        <div className="role-wrapper">

            <div className="role-header">
                <h2>Rollar</h2>
                <button onClick={() => setShowCreate(true)}>
                    <FiPlus /> Yeni rol
                </button>
            </div>

            <div className="role-list">
                {roles.map(r => (
                    <div className="role-card" key={r.id}>
                        <span>{r.name}</span>

                        <div className="role-actions">
                            <FiEdit onClick={() => {
                                setItem(r);
                                setIsEdit(true);
                            }} />
                            <FiTrash2 onClick={() => deleteRole(r.id)} />
                        </div>
                    </div>
                ))}
            </div>

            {showCreate && (
                <div className="role-modal">
                    <div className="role-box">
                        <h3>Yeni rol</h3>

                        <input
                            placeholder="Rol adı"
                            value={form.roleName}
                            onChange={e => setForm(p => ({ ...p, roleName: e.target.value }))}
                        />

                        <div className="permission-box">
                            {permissions.map(p => (
                                <label key={p.id}>
                                    <input
                                        type="checkbox"
                                        checked={form.permissionIds.includes(p.id)}
                                        onChange={() => togglePermission(p.id)}
                                    />
                                    <span className="permission-text">{p.permission}</span>
                                </label>
                            ))}
                        </div>

                        <div className="role-footer">
                            <button onClick={() => setShowCreate(false)}>Ləğv</button>
                            <button onClick={createRole}>Yarat</button>
                        </div>
                    </div>
                </div>
            )}

            {
                isEdit && (
                    <RoleUpdate setItem={setItem} item={item} setResponseRequest={setResponseRequest} setIsEdit={setIsEdit} />
                )
            }

        </div>
    );
}
