// Statistics.jsx
import React, { useEffect, useState } from "react";
import "./Statistics.css";
import api from "../../../api";

const tabs = [
    { key: "accountTypeByDepartment", label: "İdarəyə görə hesab növləri" },
    { key: "statusByAccountType", label: "Hesab növlərinə görə statuslar" },
    { key: "accountTypeCountByDepartment", label: "İdarəyə görə hesab sayı" },
    { key: "accountTypeCountByUnitAndDepartment", label: "Bölmə və İdarəyə görə hesab sayı" },
    { key: "accountCountByStatusTimeline", label: "Status vaxtı üzrə hesab sayı" },
    { key: "createdDeletedCompDomains", label: "Yaradılmış/Silinmiş Kompyuter Domenləri" },
    { key: "createdDeletedElectronic", label: "Yaradılmış/Silinmiş Elektron Ünvanlar" },
    { key: "pestsByDate", label: "Pests By Date" },
];

const Statistics = () => {
    const [activeTab, setActiveTab] = useState("accountTypeByDepartment");
    const [departments, setDepartments] = useState([]);
    const [units, setUnits] = useState([]);
    const [depOrders, setDepOrders] = useState([]);
    const [unitOrders, setUnitOrders] = useState([]);
    const [accountTypes, setAccountTypes] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [taskTitles, setTaskTitles] = useState([]);
    const [filters, setFilters] = useState({});

    useEffect(() => {
        const token = localStorage.getItem("myUserDutyToken");

        api.get("/department/getDepartments", { headers: { Authorization: `Bearer ${token}` }, params: { page: 1, pageSize: 1000 } })
            .then(res => setDepartments(res?.data?.data?.data || []));
        api.get("/department/unit/getAllUnit", { headers: { Authorization: `Bearer ${token}` }, params: { page: 1, pageSize: 1000 } })
            .then(res => setUnits(res?.data?.data?.data || []));
        api.get("/statistics/order/department/getAllOrder", { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setDepOrders(res?.data?.data || []));
        api.get("/statistics/order/unit/getAllOrder", { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setUnitOrders(res?.data?.data || []));
        api.get("/admin/accountType/getAllAccountType", { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setAccountTypes(res?.data?.data || []));
        api.get("/general/status/getAllStatus", { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setStatuses(res?.data?.data || []));
        // Placeholder: taskTitles endpoint varsa çağır
        api.get("/tasks/getAllTitles", { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setTaskTitles(res?.data?.data || []));
    }, []);

    const handleExport = async () => {
        const body = filters[activeTab] || {};
        let url = "";

        switch (activeTab) {
            case "accountTypeByDepartment": url = "/statistics/excel/accountTypeByDepartment"; break;
            case "statusByAccountType": url = "/statistics/excel/statusByAccountType"; break;
            case "accountTypeCountByDepartment": url = "/statistics/excel/accountTypeCountByDepartment"; break;
            case "accountTypeCountByUnitAndDepartment": url = "/statistics/excel/accountTypeCountByUnitAndDepartment"; break;
            case "accountCountByStatusTimeline": url = "/statistics/excel/accountTypeCountByUnitAndDepartment"; break;
            case "createdDeletedCompDomains": url = "/statistics/excel/getCreatedAndDeletedCompDomains"; break;
            case "createdDeletedElectronic": url = "/statistics/excel/getCreatedAndDeletedElectronicAddress"; break;
            case "pestsByDate": url = "/statistics/excel/getPestsByDate"; break;
            default: return;
        }

        try {
            const token = localStorage.getItem("myUserDutyToken");
            const res = await api.post(url, body, { headers: { Authorization: `Bearer ${token}` }, responseType: "blob" });
            const blob = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = `${activeTab}.xlsx`;
            link.click();
        } catch (err) {
            console.error(err);
        }
    };

    const renderFilter = () => {
        switch (activeTab) {
            case "accountTypeByDepartment":
                return (
                    <div className="stat-filter stat-filter-accounttype">
                        <select onChange={e => setFilters(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], departmentOrders: e.target.value.split(",") } }))}>
                            <option value="">İdarələr siyahısı seç</option>
                            {depOrders.map(d => <option key={d.id} value={d.departmentIds}>{d.name}</option>)}
                        </select>
                        <select onChange={e => setFilters(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], accountType: +e.target.value } }))}>
                            <option value="">Hesab növü seç</option>
                            {accountTypes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <input type="date" onChange={e => setFilters(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], fromDate: e.target.value.split("-").reverse().join(".") } }))} />
                        <input type="date" onChange={e => setFilters(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], toDate: e.target.value.split("-").reverse().join(".") } }))} />
                        <select onChange={e => setFilters(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], registered: e.target.value === "" ? null : e.target.value === "true" ? true : false } }))}>
                            <option value="">Hamısı</option>
                            <option value="true">Qeydiyyatdan keçmiş</option>
                            <option value="false">Qeydiyyatdan keçməmiş</option>
                        </select>
                    </div>
                );

            case "statusByAccountType":
                return (
                    <div className="stat-filter stat-filter-status">
                        <div className="stat-multi-checkbox">
                            <label>Status:</label>
                            {statuses.map(s => (
                                <label key={s.id}><input type="checkbox" value={s.id} onChange={e => {
                                    const prev = filters[activeTab]?.statusIds || [];
                                    const val = +e.target.value;
                                    const newArr = prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val];
                                    setFilters(prevF => ({ ...prevF, [activeTab]: { ...prevF[activeTab], statusIds: newArr } }));
                                }} />{s.status}</label>
                            ))}
                        </div>

                        <div className="stat-multi-checkbox">
                            <label>İdarələr:</label>
                            {departments.map(d => (
                                <label key={d.id}><input type="checkbox" value={d.id} onChange={e => {
                                    const prev = filters[activeTab]?.departmentIds || [];
                                    const val = +e.target.value;
                                    const newArr = prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val];
                                    setFilters(prevF => ({ ...prevF, [activeTab]: { ...prevF[activeTab], departmentIds: newArr } }));
                                }} />{d.tag}</label>
                            ))}
                        </div>

                        <div className="stat-multi-checkbox">
                            <label>Bölmələr:</label>
                            {units.map(u => (
                                <label key={u.id}><input type="checkbox" value={u.id} onChange={e => {
                                    const prev = filters[activeTab]?.unitIds || [];
                                    const val = +e.target.value;
                                    const newArr = prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val];
                                    setFilters(prevF => ({ ...prevF, [activeTab]: { ...prevF[activeTab], unitIds: newArr } }));
                                }} />{u.tag}</label>
                            ))}
                        </div>

                        <input type="date" onChange={e => setFilters(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], fromDate: e.target.value.split("-").reverse().join(".") } }))} />
                        <input type="date" onChange={e => setFilters(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], toDate: e.target.value.split("-").reverse().join(".") } }))} />
                        <select onChange={e => setFilters(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], registered: e.target.value === "" ? null : e.target.value === "true" } }))}>
                            <option value="">Hamısı</option>
                            <option value="true">Qeydiyyatdan keçmiş</option>
                            <option value="false">Qeydiyyatdan keçməmiş</option>
                        </select>
                    </div>
                );

            case "accountTypeCountByDepartment":
                return (
                    <div className="stat-filter stat-filter-accountcount">
                        <div className="stat-multi-checkbox">
                            <label>Department Orders:</label>
                            {depOrders.map(d => (
                                <label key={d.id}><input type="checkbox" value={d.id} onChange={e => {
                                    const prev = filters[activeTab]?.departmentOrderIds || [];
                                    const val = +e.target.value;
                                    const newArr = prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val];
                                    setFilters(prevF => ({ ...prevF, [activeTab]: { ...prevF[activeTab], departmentOrderIds: newArr } }));
                                }} />{d.name}</label>
                            ))}
                        </div>
                        <select onChange={e => setFilters(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], statusId: +e.target.value } }))}>
                            <option value="">Select Status</option>
                            {statuses.map(s => <option key={s.id} value={s.id}>{s.status}</option>)}
                        </select>
                        <input type="date" onChange={e => setFilters(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], fromDate: e.target.value.split("-").reverse().join(".") } }))} />
                        <input type="date" onChange={e => setFilters(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], toDate: e.target.value.split("-").reverse().join(".") } }))} />
                    </div>
                );

            case "accountTypeCountByUnitAndDepartment":
                return (
                    <div className="stat-filter stat-filter-unit-dep">
                        <div className="stat-multi-checkbox">
                            <label>Department Orders:</label>
                            {depOrders.map(d => (
                                <label key={d.id}><input type="checkbox" value={d.id} onChange={e => {
                                    const prev = filters[activeTab]?.departmentOrderIds || [];
                                    const val = +e.target.value;
                                    const newArr = prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val];
                                    setFilters(prevF => ({ ...prevF, [activeTab]: { ...prevF[activeTab], departmentOrderIds: newArr } }));
                                }} />{d.name}</label>
                            ))}
                        </div>
                        <div className="stat-multi-checkbox">
                            <label>Unit Orders:</label>
                            {unitOrders.map(u => (
                                <label key={u.id}><input type="checkbox" value={u.id} onChange={e => {
                                    const prev = filters[activeTab]?.unitOrderIds || [];
                                    const val = +e.target.value;
                                    const newArr = prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val];
                                    setFilters(prevF => ({ ...prevF, [activeTab]: { ...prevF[activeTab], unitOrderIds: newArr } }));
                                }} />{u.name}</label>
                            ))}
                        </div>
                    </div>
                );

            case "accountCountByStatusTimeline":
                return (
                    <div className="stat-filter stat-filter-accountstatus-timeline">
                        <select onChange={e => setFilters(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], accountTypeId: +e.target.value } }))}>
                            <option value="">Select Account Type</option>
                            {accountTypes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <div className="stat-multi-checkbox">
                            <label>Task Titles:</label>
                            {taskTitles.map(t => (
                                <label key={t.id}><input type="checkbox" value={t.id} onChange={e => {
                                    const prev = filters[activeTab]?.taskTitleId || [];
                                    const val = +e.target.value;
                                    const newArr = prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val];
                                    setFilters(prevF => ({ ...prevF, [activeTab]: { ...prevF[activeTab], taskTitleId: newArr } }));
                                }} />{t.name}</label>
                            ))}
                        </div>
                        <input type="date" onChange={e => setFilters(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], fromDate: e.target.value.split("-").reverse().join(".") } }))} />
                        <input type="date" onChange={e => setFilters(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], toDate: e.target.value.split("-").reverse().join(".") } }))} />
                    </div>
                );

            case "createdDeletedCompDomains":
            case "createdDeletedElectronic":
                return (
                    <div className="stat-filter stat-filter-created-deleted">
                        <div className="stat-multi-checkbox">
                            <label>Account Types:</label>
                            {accountTypes.map(a => (
                                <label key={a.id}><input type="checkbox" value={a.id} onChange={e => {
                                    const prev = filters[activeTab]?.accountTypeIds || [];
                                    const val = +e.target.value;
                                    const newArr = prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val];
                                    setFilters(prevF => ({ ...prevF, [activeTab]: { ...prevF[activeTab], accountTypeIds: newArr } }));
                                }} />{a.name}</label>
                            ))}
                        </div>
                        <input type="date" onChange={e => setFilters(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], fromDate: e.target.value.split("-").reverse().join(".") } }))} />
                        <input type="date" onChange={e => setFilters(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], toDate: e.target.value.split("-").reverse().join(".") } }))} />
                    </div>
                );

            case "pestsByDate":
                return (
                    <div className="stat-filter stat-filter-pests">
                        <div className="stat-multi-checkbox">
                            <label>Title IDs:</label>
                            {taskTitles.map(t => (
                                <label key={t.id}><input type="checkbox" value={t.id} onChange={e => {
                                    const prev = filters[activeTab]?.titleIds || [];
                                    const val = +e.target.value;
                                    const newArr = prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val];
                                    setFilters(prevF => ({ ...prevF, [activeTab]: { ...prevF[activeTab], titleIds: newArr } }));
                                }} />{t.name}</label>
                            ))}
                        </div>
                        <input type="date" onChange={e => setFilters(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], fromDate: e.target.value.split("-").reverse().join(".") } }))} />
                        <input type="date" onChange={e => setFilters(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], toDate: e.target.value.split("-").reverse().join(".") } }))} />
                    </div>
                );

            default:
                return <div className="stat-filter-placeholder">Filters will appear here</div>;
        }
    };

    return (
        <div className="statistics-wrapper">
            <div className="statistics-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        className={`statistics-tab ${activeTab === tab.key ? 'active-tab' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="statistics-filter">
                {renderFilter()}
            </div>

            <div className="statistics-export">
                <button className="statistics-export-btn" onClick={handleExport}>Export Excel</button>
            </div>
        </div>
    );
};

export default Statistics;
