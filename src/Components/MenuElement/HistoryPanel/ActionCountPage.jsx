import React, { useEffect, useState, useRef } from "react";
import { FaEdit, FaTrashAlt, FaLock, FaUnlock } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import Chart from "chart.js/auto";
import api from "../../../api";
import "./ActionCountPage.css";

export default function ActionCountPage({ setResponseRequest }) {
    const [actions] = useState([
        { id: 1, action: "Yaradıldı", icon: <FaEdit /> },
        { id: 2, action: "Dəyişdirildi", icon: <FaEdit /> },
        { id: 3, action: "Statusu silinmiş", icon: <FaTrashAlt /> },
        { id: 4, action: "Aktiv", icon: <FaUnlock /> },
        { id: 5, action: "Deactiv", icon: <FaLock /> },
        { id: 6, action: "Məxfi", icon: <FaLock /> },
        { id: 7, action: "Qeyri Məxfi", icon: <FaUnlock /> },
        { id: 8, action: "Silinmiş", icon: <FaTrashAlt /> }
    ]);

    const [byAccountType, setByAccountType] = useState(false);
    const [byHours, setByHours] = useState(false);
    const [personnelList, setPersonnelList] = useState([]);
    const [filters, setFilters] = useState({
        actionIds: [],
        personnelIds: [],
        fromDate: "",
        toDate: ""
    });
    const [actionCounts, setActionCounts] = useState([]);
    const [activeFilter, setActiveFilter] = useState(null);

    const chartCanvasRef = useRef(null);
    const chartRef = useRef(null);

    const chartCanvasRefByHours = useRef(null);
    const chartRefByHours = useRef(null);

    const loadPersonnel = async () => {
        try {
            const token = localStorage.getItem("myUserDutyToken");
            const res = await api.post(
                "/admin/personnel/getAllPersonnel?page=1&pageSize=50",
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPersonnelList(res?.data?.data || []);
        } catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Növbətçi məlumatları alınarkən xəta baş verdi",
                message: err?.response?.data?.errorDescription || err,
                isQuestion: false
            }));
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

    const handleDateChange = e => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value.split("-").reverse().join(".")
        }));
    };

    const toggleActiveFilter = filterName => {
        setActiveFilter(prev => (prev === filterName ? null : filterName));
    };

    const getActionCounts = async () => {
        try {
            const token = localStorage.getItem("myUserDutyToken");
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
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Əməliyyat sayları alınarkən xəta baş verdi",
                message: err?.response?.data?.errorDescription || err,
                isQuestion: false
            }));
        }
    };

    const getAllByAccountType = async () => {
        try {
            const token = localStorage.getItem("myUserDutyToken");
            const res = await api.post(
                "/statistics/history/actionCountByAccountType",
                filters,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setByAccountType(res?.data?.data || false);
        } catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Hesab növü üzrə əməliyyat sayları alınarkən xəta baş verdi",
                message: err?.response?.data?.errorDescription || err,
                isQuestion: false
            }));
        }
    };

    const getAllByHours = async () => {
        try {
            const token = localStorage.getItem("myUserDutyToken");
            const res = await api.post(
                "/statistics/history/personnelDailyActivity",
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setByHours(res?.data?.data || false);
        } catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Saat üzrə əməliyyat sayları alınarkən xəta baş verdi",
                message: err?.response?.data?.errorDescription || err,
                isQuestion: false
            }));
        }
    };

    useEffect(() => {
        getActionCounts();
        getAllByAccountType();
    }, [filters]);

    useEffect(() => {
        getAllByHours();
    }, []);


    useEffect(() => {
        if (!byHours || !byHours.length || !chartCanvasRefByHours.current) return;

        const labels = byHours.map(item => item.date);
        const actionKeys = Object.keys(byHours[0].activityCount);

        const datasets = actionKeys.map((action, i) => ({
            label: action,
            data: byHours.map(item => item.activityCount[action]),
            fill: true,
            backgroundColor: `rgba(${50 + i * 40}, 95, 240, 0.3)`,
            borderColor: `rgba(${50 + i * 40}, 95, 240, 0.8)`,
            tension: 0.4
        }));

        requestAnimationFrame(() => {
            if (chartRefByHours.current) chartRefByHours.current.destroy();

            chartRefByHours.current = new Chart(chartCanvasRefByHours.current, {
                type: 'line',
                data: { labels, datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top', labels: { usePointStyle: true } },
                        tooltip: { enabled: true }
                    },
                    scales: {
                        x: {
                            display: true,
                            title: { display: true, text: 'Tarix' }
                        },
                        y: {
                            display: true,
                            beginAtZero: true,
                            title: { display: true, text: 'Əməliyyat sayı' },
                            ticks: { precision: 0 }
                        }
                    }
                }
            });

            chartRefByHours.current.resize();
        });

        return () => chartRefByHours.current?.destroy();
    }, [byHours]);


    useEffect(() => {
        if (!byAccountType || !byAccountType.length || !chartCanvasRef.current) return;

        const actionKeys = Object.keys(byAccountType[0].actionCount); // action-lar legend
        const labels = byAccountType.map(account => account.accountTypeName); // künclər

        const datasets = actionKeys.map((action, i) => ({
            label: action,
            data: byAccountType.map(account => account.actionCount[action]),
            borderWidth: 2,
            borderColor: `hsl(${(i * 360) / actionKeys.length}, 70%, 50%)`,
            backgroundColor: `hsla(${(i * 360) / actionKeys.length}, 70%, 50%, 0.3)`,
            fill: true,
            pointBackgroundColor: `hsl(${(i * 360) / actionKeys.length}, 70%, 50%)`
        }));

        requestAnimationFrame(() => {
            if (chartRef.current) chartRef.current.destroy();

            chartRef.current = new Chart(chartCanvasRef.current, {
                type: "radar",
                data: { labels, datasets },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: "top" },
                        tooltip: { enabled: true }
                    },
                    scales: {
                        r: {
                            beginAtZero: true,
                            ticks: { precision: 0 }
                        }
                    }
                }
            });

            chartRef.current.resize();
        });

        return () => chartRef.current?.destroy();
    }, [byAccountType]);

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
                <div
                    className="by-account-type-wrapper"
                    style={{
                        height: "350px",
                        background: "#fff",
                        borderRadius: "14px",
                        padding: "20px",
                        marginTop: "30px"
                    }}
                >
                    <canvas ref={chartCanvasRef} />
                </div>
            )}
            {byHours && (
                <div
                    className="by-account-type-wrapper"
                    style={{
                        height: "350px",
                        background: "#fff",
                        borderRadius: "14px",
                        padding: "20px",
                        marginTop: "30px"
                    }}
                >
                    <canvas ref={chartCanvasRefByHours} />
                </div>
            )}
        </div>
    );
}
