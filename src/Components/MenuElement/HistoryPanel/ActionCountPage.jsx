import React, { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt, FaLock, FaUnlock } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import api from "../../../api";
import "./ActionCountPage.css";
import ByAccountTypeChart from "./Charts/ByAccountTypeChart";

export default function ActionCountPage() {
    const [actions] = useState([
        { id: 1, action: "Yaradıldı", icon: <FaEdit /> },
        { id: 2, action: "Dəyişdirildi", icon: <FaEdit /> },
        { id: 3, action: "Statusu silinmiş", icon: <FaTrashAlt /> },
        { id: 4, action: "Aktiv", icon: <FaUnlock /> },
        { id: 5, action: "Deactiv", icon: <FaLock /> },
        { id: 6, action: "Məxfi", icon: <FaLock /> },
        { id: 7, action: "Qeyri Məxfi", icon: <FaUnlock /> },
        { id: 8, action: "Silinmiş", icon: <FaTrashAlt /> },
    ]);

    const [byAccountType, setByAccountType] = useState(false);

    const [personnelList, setPersonnelList] = useState([]);
    const [filters, setFilters] = useState({
        actionIds: [],
        personnelIds: [],
        fromDate: "",
        toDate: ""
    });
    const [actionCounts, setActionCounts] = useState([]);
    const [activeFilter, setActiveFilter] = useState(null);

    const loadPersonnel = async () => {
        const token = localStorage.getItem("myUserDutyToken");
        try {
            const res = await api.post("/admin/personnel/getAllPersonnel?page=1&pageSize=50", {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPersonnelList(res?.data?.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadPersonnel();
    }, []);

    const toggleFilter = (type, id) => {
        setFilters(prev => ({
            ...prev,
            [type]: prev[type].includes(id)
                ? prev[type].filter(x => x !== id)
                : [...prev[type], id]
        }));
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value.split("-").reverse().join(".") }));
    };

    const toggleActiveFilter = (filterName) => {
        setActiveFilter(prev => prev === filterName ? null : filterName);
    };

    const getActionCounts = async () => {
        const token = localStorage.getItem("myUserDutyToken");
        try {
            const res = await api.post(
                "/statistics/history/getActionCount",
                {
                    actionIds: filters.actionIds,
                    personnelIds: filters.personnelIds,
                    fromDate: filters.fromDate,
                    toDate: filters.toDate
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setActionCounts(res?.data?.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const getAllByAccountType = async () => {
        const token = localStorage.getItem("myUserDutyToken");
        try {
            const res = await api.post(
                "/statistics/history/actionCountByAccountType",
                filters,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setByAccountType(res?.data?.data || false);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        getActionCounts();
        getAllByAccountType();
    }, [filters]);

    const clearFilters = () => {
        setFilters({
            actionIds: [],
            personnelIds: [],
            fromDate: "",
            toDate: ""
        });
    };

    return (
        <div className="action-count-page">
            <h1 className="action-count-page-head">Tarixçə Paneli</h1>

            <div className="filters-panel">
                <div className="filter-panel-box">
                    <span className="filter-panel-label" onClick={() => toggleActiveFilter("action")}>
                        Əməliyyatlar <FiChevronDown />
                    </span>
                    <div className={`filter-panel-box-child ${activeFilter === "action" ? "show-filtered-panel-element" : ""}`}>
                        {actions.map(a => (
                            <label key={a.id}>
                                <input
                                    type="checkbox"
                                    checked={filters.actionIds.includes(a.id)}
                                    onChange={() => toggleFilter("actionIds", a.id)}
                                />
                                <span>{a.icon} {a.action}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="filter-panel-box">
                    <span className="filter-panel-label" onClick={() => toggleActiveFilter("personnel")}>
                        Növbətçilər <FiChevronDown />
                    </span>
                    <div className={`filter-panel-box-child ${activeFilter === "personnel" ? "show-filtered-panel-element" : ""}`}>
                        {personnelList.map(p => (
                            <label key={p.id}>
                                <input
                                    type="checkbox"
                                    checked={filters.personnelIds.includes(p.id)}
                                    onChange={() => toggleFilter("personnelIds", p.id)}
                                />
                                <span>{p.name} {p.surname}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="filter-panel-box">
                    <span className="filter-panel-label" onClick={() => toggleActiveFilter("date")}>
                        Tarix aralığı <FiChevronDown />
                    </span>
                    <div className={`filter-panel-box-child-date ${activeFilter === "date" ? "show-filtered-panel-element" : ""}`}>
                        <input
                            type="date"
                            name="fromDate"
                            value={filters.fromDate.split(".").reverse().join("-")}
                            onChange={handleDateChange}
                        />
                        <input
                            type="date"
                            name="toDate"
                            value={filters.toDate.split(".").reverse().join("-")}
                            onChange={handleDateChange}
                        />
                    </div>
                </div>

                <button className="clear-btn" onClick={clearFilters}>Sıfırla</button>
            </div>

            <div className="action-count-cards">
                {actionCounts.map(ac => (
                    <div className="action-card" key={ac.action.id}>
                        <div className="action-icon">
                            {actions.find(a => a.id === ac.action.id)?.icon}
                        </div>
                        <div className="action-info">
                            <h4>{ac.action.desc}</h4>
                            <p>{ac.count}</p>
                        </div>
                    </div>
                ))}
            </div>

            {byAccountType && (
                <div style={{ marginTop: "40px" }}>
                    <h3 style={{ color: "#1a1446", marginBottom: "15px" }}>
                        Account Type üzrə Statistikalar
                    </h3>

                    <ByAccountTypeChart data={byAccountType} />
                </div>
            )}

        </div>
    );
}
