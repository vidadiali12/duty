import React, { useEffect, useState } from "react";
import "./Summary.css";
import api from "../../../api";
import Pagination from "../../Pagination/Pagination";

export default function Summary({ setResponseRequest }) {

    const token = localStorage.getItem("myUserDutyToken");
    const hdrs = {
        headers: { Authorization: `Bearer ${token}` }
    };

    const [filters, setFilters] = useState({
        fromDate: "",
        toDate: "",
        statusIds: [],
        departmentIds: [],
        unitIds: [],
        registered: null,
        departmentOrderIds: [],
        unitOrderIds: []
    });

    const [departments, setDepartments] = useState([]);
    const [units, setUnits] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [unitOrders, setUnitOrders] = useState([]);
    const [departmentOrders, setDepartmentOrders] = useState([]);
    const [totalItem, setTotalItem] = useState(null);
    const [totalPages, setTotalPages] = useState(null)
    const [page, setPage] = useState(1);
    const [pageSize] = useState(5)

    const [activeFilter, setActiveFilter] = useState(null);

    const [accountTypeSummary, setAccountTypeSummary] = useState([]);
    const [depUnitSummary, setDepUnitSummary] = useState([]);

    useEffect(() => {
        try {
            api.get("/department/getDepartments", {
                ...hdrs,
                params: { page: 1, pageSize: 1000 }
            }).then(res => {
                setDepartments(res?.data?.data?.data || []);
            });

            api.get("/department/unit/getAllUnit", {
                ...hdrs,
                params: { page: 1, pageSize: 1000 }
            }).then(res => {
                setUnits(res?.data?.data?.data || []);
            });

            api.get("/general/status/getAllStatus", hdrs)
                .then(res => setStatuses(res?.data?.data || []));

            api.get("/statistics/order/department/getAllOrder", hdrs)
                .then(res => { setDepartmentOrders(res?.data?.data || []) });

            api.get("/statistics/order/unit/getAllOrder", hdrs)
                .then(res => setUnitOrders(res?.data?.data || []));

        } catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Məlumatlar alınarkən xəta baş verdi",
                message: err?.response?.data?.errorDescription || err,
            }));
        }
    }, []);

    const callSummary = async () => {
        try {
            const req1 = {
                fromDate: filters.fromDate,
                toDate: filters.toDate,
                statusIds: filters.statusIds,
                registered: filters.registered,
                departmentIds: filters.departmentIds,
                unitIds: filters.unitIds,
            };

            const req2 = {
                departmentOrderIds: filters.departmentOrderIds,
                unitOrderIds: filters.unitOrderIds,
                filter: req1
            };

            const r1 = await api.post(
                "/statistics/short/getAccountTypeCountByStatus",
                req1,
                hdrs
            );

            const r2 = await api.post(
                "/statistics/short/getAccountTypeCountByDepartmentAndUnit",
                req2,
                hdrs
            );

            setAccountTypeSummary(r1?.data?.data || []);
            setDepUnitSummary(r2?.data?.data || []);
        } catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Məlumatlar alınarkən xəta baş verdi",
                message: err?.response?.data?.errorDescription || err,
            }));
        }
    };

    useEffect(() => {
        callSummary();
        setPage(1)
    }, [filters]);

    const toggleFilter = (key, id) => {
        setFilters(prev => ({
            ...prev,
            [key]: prev[key].includes(id)
                ? prev[key].filter(x => x !== id)
                : [...prev[key], id]
        }));
    };

    const errorHandler = (err) => {
        setResponseRequest(prev => ({
            ...prev,
            showResponse: true,
            title: "❌ Statistik məlumatlar yüklənmədi",
            message: err?.response?.data?.errorDescription || err
        }));
    };

    const clearFilters = () => {
        setFilters({
            fromDate: "",
            toDate: "",
            statusIds: [],
            departmentIds: [],
            unitIds: [],
            registered: null,
            departmentOrderIds: [],
            unitOrderIds: []
        })
    }



    const callUnitByDep = async () => {
        try {
            const token = localStorage.getItem('myUserDutyToken');
            const hdrs = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const hdrsDep = {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: { page: 1, pageSize: 1000 }
            }

            if (filters?.departmentIds.length !== 0) {
                let u, uList = [];
                const callUnits = async (id) => {
                    u = await api.get(`/department/unit/getUnitsByDepartment/${id}`, hdrs);
                    uList = [...uList, ...(u?.data?.data || [])];
                    setUnits(uList);
                }
                filters?.departmentIds.forEach((id) => {
                    callUnits(id)
                })
            }
            else {
                const uu = await api.get('/department/unit/getAllUnit', hdrsDep);
                setUnits(uu?.data?.data?.data || []);
            }
        }
        catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Məlumatlar alınarkən xəta baş verdi",
                message: err?.response?.data?.errorDescription || err,
            }));
        }
    }

    useEffect(() => {
        callUnitByDep()
    }, [filters?.departmentIds])

    const renderFilters = () => (
        <div className="summary-filters">

            <div className="summary-filter-box">
                <span
                    className="summary-filter-label"
                    onClick={() => setActiveFilter(activeFilter === "status" ? null : "status")}
                >
                    Statuslar
                </span>
                <div className={`summary-filter-child ${activeFilter === "status" ? "show" : ""}`}>
                    {statuses.map(s => (
                        <label key={s.id}>
                            <input
                                type="checkbox"
                                checked={filters.statusIds.includes(s.id)}
                                onChange={() => toggleFilter("statusIds", s.id)}
                            />
                            <span>{s.status}</span>
                        </label>
                    ))}
                    <label>
                        <input
                            type="checkbox"
                            checked={filters.unConfidential}
                            onChange={() => setFilters(prev => ({ ...prev, unConfidential: !prev.unConfidential }))}
                        />
                        <span>Qeyri Məxfi</span>
                    </label>
                </div>
            </div>

            <div className="summary-filter-box">
                <span
                    className="summary-filter-label"
                    onClick={() => setActiveFilter(activeFilter === "dep" ? null : "dep")}
                >
                    İdarələr
                </span>
                <div className={`summary-filter-child ${activeFilter === "dep" ? "show" : ""}`}>
                    {departments.map(d => (
                        <label key={d.id}>
                            <input
                                type="checkbox"
                                checked={filters.departmentIds.includes(d.id)}
                                onChange={() => toggleFilter("departmentIds", d.id)}
                            />
                            <span>{d.tag}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="summary-filter-box">
                <span
                    className="summary-filter-label"
                    onClick={() => setActiveFilter(activeFilter === "unit" ? null : "unit")}
                >
                    Bölmələr
                </span>
                <div className={`summary-filter-child ${activeFilter === "unit" ? "show" : ""}`}>
                    {units.map(u => (
                        <label key={u.id}>
                            <input
                                type="checkbox"
                                checked={filters.unitIds.includes(u.id)}
                                onChange={() => toggleFilter("unitIds", u.id)}
                            />
                            <span>{u.tag}</span>
                        </label>
                    ))}
                </div>
            </div>

            <select
                className="summary-filter-label"
                value={filters.departmentOrderIds}
                onChange={e => setFilters(prev => ({ ...prev, departmentOrderIds: e.target.value.split(",").map(Number) }))}
            >
                <option value="">İdarə ardıcıllığı seç</option>
                {departmentOrders.map(d => (
                    <option key={d.id} value={d.departmentIds}>{d.name}</option>
                ))}
            </select>

            <select
                className="summary-filter-label"
                value={filters.unitOrderIds}
                onChange={e => setFilters(prev => ({ ...prev, unitOrderIds: e.target.value.split(",").map(Number) }))}
            >
                <option value="">Bölmə ardıcıllığı seç</option>
                {unitOrders.map(u => (
                    <option key={u.id} value={u.unitIds}>{u.name}</option>
                ))}
            </select>

            <select
                className="summary-filter-label"
                value={filters.registered ?? ""}
                onChange={e => setFilters(prev => ({
                    ...prev,
                    registered: e.target.value === "" ? null : e.target.value === "true"
                }))}
            >
                <option value="">Hamısı</option>
                <option value="true">Qeydiyyatdan keçmiş</option>
                <option value="false">Qeydiyyatdan keçməmiş</option>
            </select>

            <input
                type="date"
                className="summary-filter-label"
                value={filters.fromDate.split(".").reverse().join("-")}
                onChange={e => setFilters(prev => ({ ...prev, fromDate: e.target.value.split("-").reverse().join(".") }))}
            />

            <input
                type="date"
                className="summary-filter-label"
                value={filters.toDate.split(".").reverse().join("-")}
                onChange={e => setFilters(prev => ({ ...prev, toDate: e.target.value.split("-").reverse().join(".") }))}
            />

            <button className="clear-btn" onClick={clearFilters}>Sıfırla</button>
        </div>
    );

    useEffect(() => {
        if (depUnitSummary.length === 0) return;

        const grouped = depUnitSummary.reduce((acc, item) => {
            const depName = item.departmentName;

            if (!acc[depName]) {
                acc[depName] = [];
            }

            acc[depName].push(item);
            return acc;
        }, {});

        const departmentCount = Object.keys(grouped).length;

        setTotalItem(departmentCount);
        setTotalPages(Math.ceil(departmentCount / pageSize));

    }, [depUnitSummary, page, filters]);

    const groupedByDepartment = depUnitSummary.reduce((acc, item) => {
        const depName = item.departmentName;

        if (!acc[depName]) {
            acc[depName] = [];
        }

        acc[depName].push(item);
        return acc;
    }, {});

    return (
        <div className="summary-wrapper">

            {renderFilters()}

            <div className="summary-card">
                <h3>Hesab növləri üzrə statuslar</h3>

                <div className="summary-table">
                    <div className="summary-table-head">
                        <span>Növ</span>
                        <span>Aktiv</span>
                        <span>Deaktiv</span>
                        <span>Məxfi</span>
                        <span>Qeyri Məxfi</span>
                        <span>Silinmiş</span>
                        <span>Qeydiyyat</span>
                        <span>Cəmi</span>
                    </div>

                    {accountTypeSummary.map((x, i) => (
                        <div className="summary-table-row" key={i}>
                            <span>{x.accountType}</span>
                            <span>{x.activeCount}</span>
                            <span>{x.inactiveCount}</span>
                            <span>{x.confidentialCount}</span>
                            <span>{x.unconfidentialCount}</span>
                            <span>{x.deletedCount}</span>
                            <span>
                                {x.registeredCount ?? 0} / {x.unRegisteredCount ?? 0}
                            </span>
                            <span className="bold">{x.total}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="summary-card">
                <h3>İdarə / Bölmə üzrə hesab növləri</h3>

                {Object.entries(groupedByDepartment)
                    .slice((page - 1) * pageSize, page * pageSize)
                    .map(([depName, units]) => (
                        <div key={depName} className="summary-dep-block">

                            <div className="summary-dep-title">
                                {depName}
                            </div>

                            {units.map((d) => (
                                <div key={d.unitName} className="summary-dep-row">

                                    <div className="summary-unit-title">
                                        {d.unitName}
                                    </div>

                                    <div className="summary-badges">
                                        {Object.entries(d.typeAndCount || {}).map(([k, v]) => (
                                            <span key={k} className="summary-badge">
                                                {k}: <b>{v}</b>
                                            </span>
                                        ))}

                                        {d.registeredCount !== undefined && (
                                            <span className="summary-badge">
                                                Qeydiyyat: <b>{d.registeredCount} / {d.unregisteredCount}</b>
                                            </span>
                                        )}

                                        {d.unConfidentialCount !== undefined && (
                                            <span className="summary-badge">
                                                Qeyri Məxfi: <b>{d.unConfidentialCount}</b>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
            </div>
            {
                totalItem && totalPages && totalItem > pageSize && (
                    <Pagination
                        page={page}
                        setPage={setPage}
                        pageSize={pageSize}
                        totalItem={totalItem}
                        totalPages={totalPages}
                    />
                )
            }
        </div>
    );
}
