// Order.jsx
import React, { useEffect, useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import api from "../../../api";
import { FaPlus } from 'react-icons/fa';
import "./Order.css";
import OrderOpe from "./OrderOpe";

const Order = ({ setResponseRequest, item, setItem }) => {
    const [activeTab, setActiveTab] = useState("department");
    const [depOrders, setDepOrders] = useState([]);
    const [unitOrders, setUnitOrders] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [units, setUnits] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(12);
    const [showOrderOpe, setShowOrderOpe] = useState(false);
    const [type, setType] = useState("department");

    const token = localStorage.getItem("myUserDutyToken");

    const loadDepartments = async () => {
        try {
            const res = await api.get("/department/getDepartments", {
                headers: { Authorization: `Bearer ${token}` },
                params: { page: 1, pageSize: 1000 }
            });
            setDepartments(res?.data?.data?.data || []);
        } catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Xəta baş verdi",
                message: err?.response?.data?.errorDescription || err,
                isQuestion: false
            }));
        }
    };

    const loadUnits = async () => {
        try {
            const res = await api.get("/department/unit/getAllUnit", {
                headers: { Authorization: `Bearer ${token}` },
                params: { page: 1, pageSize: 1000 }
            });
            setUnits(res?.data?.data?.data || []);
        } catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Xəta baş verdi",
                message: err?.response?.data?.errorDescription || err,
                isQuestion: false
            }));
        }
    };

    const loadDepOrders = async () => {
        try {
            const res = await api.get("/statistics/order/department/getAllOrder", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDepOrders(res?.data?.data || []);
        } catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Xəta baş verdi",
                message: err?.response?.data?.errorDescription || err,
                isQuestion: false
            }));
        }
    };

    const loadUnitOrders = async () => {
        try {
            const res = await api.get("/statistics/order/unit/getAllOrder", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUnitOrders(res?.data?.data || []);
        } catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Xəta baş verdi",
                message: err?.response?.data?.errorDescription || err,
                isQuestion: false
            }));
        }
    };

    const deleteDepOrder = (id) => {
        setResponseRequest(prev => ({
            ...prev,
            title: "Bu department order-i silməyə əminsiz?",
            isQuestion: true,
            api: `/statistics/order/department/deleteOrder/${id}`,
            showResponse: true,
            type: 'deleteDepOrder'
        }));
    };

    const deleteUnitOrder = (id) => {
        setResponseRequest(prev => ({
            ...prev,
            title: "Bu unit order-i silməyə əminsiz?",
            isQuestion: true,
            api: `/statistics/order/unit/deleteOrder/${id}`,
            showResponse: true,
            type: 'deleteUnitOrder'
        }));
    };

    useEffect(() => {
        loadDepartments();
        loadUnits();
        loadDepOrders();
        loadUnitOrders();
    }, []);

    const getDepartmentNames = (ids) => {
        return ids
            .map(id => departments.find(d => d.id === id))
            .filter(Boolean)
            .map(d => d.tag)
            .join(", ");
    };

    const getUnitNames = (ids) => {
        return ids
            .map(id => units.find(u => u.id === id))
            .filter(Boolean)
            .map(u => u.tag)
            .join(", ");
    };

    return (
        <div className="order-wrapper p-4 w-full">
            <div className="order-tabs flex gap-3 mb-4">
                <button
                    className={activeTab === "department" ? "active-tab" : ""}
                    onClick={() => setActiveTab("department")}
                >
                    İdarələr Siyahısı
                </button>
                <button
                    className={activeTab === "unit" ? "active-tab" : ""}
                    onClick={() => setActiveTab("unit")}
                >
                    Bölmələr Siyahısı
                </button>
            </div>

            {activeTab === "department" && (
                <div className="order-department">

                    <button onClick={() => {
                        setShowOrderOpe(true);
                        setItem(null);
                        setType("department");
                    }}>
                        <FaPlus /> Yeni İdarə Siyahısı
                    </button>

                    <div className="order-dep-header">
                        <span>#</span>
                        <span>Ad</span>
                        <span>İdarələr</span>
                        <span style={{ textAlign: "center" }}>Əməliyyat</span>
                    </div>

                    {depOrders.map((order, index) => (
                        <div className="order-dep-row" key={order.id}>
                            <span>{index + 1}</span>
                            <span>{order.name}</span>
                            <span>{getDepartmentNames(order.departmentIds)}</span>
                            <span className="order-ope-box">
                                <FiEdit className="ope-icon" onClick={() => {
                                    setShowOrderOpe(true);
                                    setItem(order);
                                    setType("department");
                                }} />
                                <FiTrash2 className="ope-icon" onClick={() => deleteDepOrder(order.id)} />
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === "unit" && (
                <div className="order-unit">

                    <button onClick={() => {
                        setShowOrderOpe(true);
                        setItem(null);
                        setType("unit");
                    }}>
                        <FaPlus /> Yeni Bölmə Siyahısı
                    </button>

                    <div className="order-unit-header">
                        <span>#</span>
                        <span>Ad</span>
                        <span>Bölmələr</span>
                        <span style={{ textAlign: "center" }}>Əməliyyat</span>
                    </div>
                    {unitOrders.map((order, index) => (
                        <div className="order-unit-row" key={order.id}>
                            <span>{index + 1}</span>
                            <span>{order.name}</span>
                            <span>{getUnitNames(order.unitIds)}</span>
                            <span className="order-ope-box">
                                <FiEdit className="ope-icon" onClick={() => {
                                    setShowOrderOpe(true);
                                    setItem(order);
                                    setType("unit");
                                }} />
                                <FiTrash2 className="ope-icon" onClick={() => deleteUnitOrder(order.id)} />
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {
                showOrderOpe && (
                    <OrderOpe
                        setShowOrderOpe={setShowOrderOpe}
                        setResponseRequest={setResponseRequest}
                        type={type}
                        item={item}
                        setItem={setItem} />
                )
            }
        </div>
    );
};

export default Order;
