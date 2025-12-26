import React, { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import api from "../../../api";
import "./OrderOpe.css";

const OrderOpe = ({
    type,
    setShowOrderOpe,
    item,
    setResponseRequest,
    setItem
}) => {
    const [name, setName] = useState(item?.name || "");
    const [selectedIds, setSelectedIds] = useState(item?.departmentIds || item?.unitIds || []);
    const [allDeps, setAllDeps] = useState([]);
    const [allUnits, setAllUnits] = useState([]);


    const loadDeps = async () => {
        try {
            const token = localStorage.getItem("myUserDutyToken");
            const res = await api.get("/department/getDepartments", {
                headers: { Authorization: `Bearer ${token}` },
                params: { page: 1, pageSize: 1000 }
            });
            setAllDeps(res?.data?.data?.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const loadUnits = async () => {
        try {
            const token = localStorage.getItem("myUserDutyToken");
            const res = await api.get("/department/unit/getAllUnit", {
                headers: { Authorization: `Bearer ${token}` },
                params: { page: 1, pageSize: 1000 }
            });
            setAllUnits(res?.data?.data?.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (type === "department") loadDeps();
        else loadUnits();
    }, [type]);

    const handleToggleId = (id) => {
        setSelectedIds(prev => {
            if (prev.includes(id)) {
                // çıxar → sıra yenidən qurulur
                return prev.filter(x => x !== id);
            }
            // sona əlavə et (sıra buradan yaranır)
            return [...prev, id];
        });
    };


    const handleSave = async () => {
        if (!name || selectedIds.length === 0) {
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Xəta",
                message: "Name və IDs seçilməlidir"
            }));
            return;
        }

        try {
            const token = localStorage.getItem("myUserDutyToken");
            if (item) {
                const url = type === "department"
                    ? `/statistics/order/department/updateOrder/${item.id}`
                    : `/statistics/order/unit/updateOrder/${item.id}`;
                const body = type === "department"
                    ? { name, departmentIds: selectedIds }
                    : { name, unitIds: selectedIds };

                const res = await api.put(url, body, { headers: { Authorization: `Bearer ${token}` } });
                setResponseRequest(prev => ({
                    ...prev,
                    showResponse: true,
                    title: "✅ Uğurla dəyişdirildi",
                    message: res?.data?.message || "Success"
                }));
                setItem(null);
                window.location.reload();
            } else {
                const url = type === "department"
                    ? "/statistics/order/department/createOrder"
                    : "/statistics/order/unit/createOrder";
                const body = type === "department"
                    ? { name, departmentIds: selectedIds }
                    : { name, unitIds: selectedIds };
                const res = await api.post(url, body, { headers: { Authorization: `Bearer ${token}` } });
                setResponseRequest(prev => ({
                    ...prev,
                    showResponse: true,
                    title: "✅ Uğurla yaradıldı",
                    message: res?.data?.message || "Success"
                }));
                setItem(null);
                window.location.reload();
            }

            setShowOrderOpe(false);
        } catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Xəta",
                message: err?.response?.data?.errorDescription || err
            }));
        }
    };

    const options = type === "department" ? allDeps : allUnits;

    return (
        <div className="order-ope-overlay">
            <div className="order-ope-modal">
                <div className="order-ope-header">
                    <h3> {type === "department" ? "İdarə" : "Bölmə"} siyahı {item ? "yeniləmə" : "yaratma"}</h3>
                    <FiX className="close-icon" onClick={() => {setShowOrderOpe(false); setItem(null);}} />
                </div>

                <div className="order-ope-body">
                    <input
                        type="text"
                        placeholder="Ad daxil edin..."
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />

                    {selectedIds.length > 0 && (
                        <div className="order-ope-selected-list">
                            {selectedIds.map((id, index) => {
                                const item =
                                    type === "department"
                                        ? allDeps.find(d => d.id === id)
                                        : allUnits.find(u => u.id === id);

                                return (
                                    <div className="order-ope-selected-item" key={id}>
                                        <span className="order-ope-order-index">
                                            {index + 1}.
                                        </span>

                                        <span className="order-ope-selected-name">
                                            {item?.tag}
                                        </span>

                                        <span
                                            className="order-ope-remove"
                                            onClick={() => handleToggleId(id)}
                                        >
                                            ✕
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="order-ope-multi-select">
                        {options.map(opt => (
                            <label key={opt.id}>
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(opt.id)}
                                    onChange={() => handleToggleId(opt.id)}
                                />
                                <span>{opt.tag}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="order-ope-footer">
                    <button className="save-btn" onClick={handleSave}>{item ? "Yenilə" : "Yarat"}</button>
                    <button className="cancel-btn" onClick={() => {setShowOrderOpe(false); setItem(null);}}>Ləğv Et</button>
                </div>
            </div>
        </div>
    );
};

export default OrderOpe;
