import React, { useEffect, useState } from "react";
import { FiChevronDown, FiInfo } from "react-icons/fi";
import "./CompletedTasks.css";
import api from "../../../api";
import Pagination from "../../Pagination/Pagination";

export default function CompletedTasks({ setResponseRequest, setItem }) {
    const [tasks, setTasks] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(12);
    const [totalItem, setTotalItem] = useState(null);
    const [totalPages, setTotalPages] = useState(null);

    const [activeFilter, setActiveFilter] = useState(null);

    const [filters, setFilters] = useState({
        searchText: "",
        typeIds: [],
        departmentId: "",
        unitId: "",
        personnelIds: [],
        fromDate: "",
        toDate: ""
    });

    const [taskTypeList, setTaskTypeList] = useState([]);
    const [departmentList, setDepartmentList] = useState([]);
    const [unitList, setUnitList] = useState([]);
    const [personnelList, setPersonnelList] = useState([]);

    const token = localStorage.getItem("myUserDutyToken");

    const callTasks = async () => {
        if (!token) return;
        try {
            const res = await api.post(
                "/task/getAllTask",
                filters,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { page, pageSize }
                }
            );

            setTasks(res?.data?.data || []);
            setTotalItem(res?.data?.totalItem || null);
            setTotalPages(res?.data?.totalPages || null);
        } catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Tasklər alınarkən xəta baş verdi",
                message: err?.response?.data?.errorDescription || err
            }));
        }
    };

    const loadFilterData = async () => {
        if (!token) return;

        const hdrs = {
            headers: { Authorization: `Bearer ${token}` }
        };

        const hdrsDep = {
            headers: { Authorization: `Bearer ${token}` },
            params: { page, pageSize }
        };

        try {
            const t = await api.get("/task/type/getTypes", hdrs);
            const d = await api.get("/department/getDepartments", hdrsDep);
            const u = await api.get("/department/unit/getAllUnit", hdrsDep);
            const p = await api.post("/admin/personnel/getAllPersonnel", {}, hdrsDep);

            setTaskTypeList(t?.data?.data || []);
            setDepartmentList(d?.data?.data?.data || []);
            setUnitList(u?.data?.data?.data || []);
            setPersonnelList(p?.data?.data || []);
        } catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Filter məlumatları yüklənmədi",
                message: err?.response?.data?.errorDescription || err
            }));
        }
    };

    const toggleFilter = (type, id) => {
        setFilters(prev => ({
            ...prev,
            [type]: prev[type].includes(id)
                ? prev[type].filter(x => x !== id)
                : [...prev[type], id]
        }));
    };

    const showFilter = (name) => {
        setActiveFilter(prev => (prev === name ? null : name));
    };

    const clearFilter = () => {
        setFilters({
            searchText: "",
            typeIds: [],
            departmentId: "",
            unitId: "",
            personnelIds: [],
            fromDate: "",
            toDate: ""
        });
        setActiveFilter(null);
    };

    useEffect(() => {
        setItem(null);
        loadFilterData();
    }, []);

    useEffect(() => {
        callTasks();
    }, [filters, page]);

    useEffect(() => {
        setPage(1);
    }, [filters]);

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
                params: { page, pageSize }
            }

            if (filters?.departmentId != "") {
                const u = await api.get(`/department/unit/getUnitsByDepartment/${filters.departmentId}`, hdrs);
                setUnitList(u?.data?.data || []);
            }
            else {
                const u = await api.get('/department/unit/getAllUnit', hdrsDep);
                setUnitList(u?.data?.data?.data || []);
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
        setFilters(prev => ({
            ...prev,
            unitId: ""
        }));

        callUnitByDep();
    }, [filters?.departmentId])

    return (
        <div className="accounts-wrapper p-4 w-full">

            <div className="filters-task flex flex-wrap gap-3 mb-5">

                <div className="filter-task-box">
                    <input
                        className="filter-task-label"
                        placeholder="axtar..."
                        value={filters.searchText}
                        onChange={e =>
                            setFilters(prev => ({ ...prev, searchText: e.target.value }))
                        }
                    />
                </div>

                <div className="filter-task-box">
                    <select
                        className="filter-task-label"
                        value={filters?.departmentId || ""}
                        onChange={e =>
                            setFilters(prev => ({ ...prev, departmentId: e.target.value }))
                        }
                    >
                        <option value="">İdarə seç</option>
                        {departmentList.map(d => (
                            <option key={d.id} value={d.id}>{d.tag}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-task-box">
                    <select
                        className="filter-task-label"
                        value={filters.unitId || ""}
                        onChange={e =>
                            setFilters(prev => ({ ...prev, unitId: e.target.value }))
                        }
                    >
                        <option value="">Bölmə seç</option>
                        {unitList.map(u => (
                            <option key={u.id} value={u.id}>{u.tag}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-task-box">
                    <span className="filter-task-label" onClick={() => showFilter("type")}>
                        Task Növü <FiChevronDown />
                    </span>
                    <div className={`filter-box-child ${activeFilter === "type" ? "show-filtered-element" : ""}`}>
                        {taskTypeList.map(t => (
                            <label key={t.id}>
                                <input
                                    type="checkbox"
                                    checked={filters.typeIds.includes(t.id)}
                                    onChange={() => toggleFilter("typeIds", t.id)}
                                />
                                <span>{t.typeName}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="filter-box">
                    <span className="filter-task-label" onClick={() => showFilter("personnel")}>
                        İcraçılar <FiChevronDown />
                    </span>
                    <div className={`filter-box-child ${activeFilter === "personnel" ? "show-filtered-element" : ""}`}>
                        {personnelList.map(p => (
                            <label key={p.id}>
                                <input
                                    type="checkbox"
                                    checked={filters.personnelIds.includes(p.id)}
                                    onChange={() => toggleFilter("personnelIds", p.id)}
                                />
                                <span>{p?.rank?.name} {p.name} {p?.surname}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="filter-task-box">
                    <input
                        className="filter-task-label date-filter-task"
                        type="date"
                        value={filters.fromDate}
                        onChange={e =>
                            setFilters(prev => ({ ...prev, fromDate: e.target.value }))
                        }
                    />
                </div>

                <div className="filter-task-box">
                    <input
                        className="filter-task-label date-filter"
                        type="date"
                        value={filters.toDate}
                        onChange={e =>
                            setFilters(prev => ({ ...prev, toDate: e.target.value }))
                        }
                    />
                </div>

                <button onClick={clearFilter} className="clear-filters-task">
                    Filteri sıfırla
                </button>
            </div>

            <div className="accounts-table-task w-full">
                <div className="table-task-header">
                    <span>#</span>
                    <span>Task Növü</span>
                    <span>Başlıq</span>
                    <span>İdarə</span>
                    <span>Bölmə</span>
                    <span>Sayı</span>
                    <span>İcraçı</span>
                    <span>Tarix</span>
                    <span style={{ textAlign: "center" }}>Əməliyyat</span>
                </div>

                {tasks.map((t, index) => (
                    <div className="table-task-row" key={t.id}>
                        <span>{pageSize * (page - 1) + index + 1}</span>
                        <span>{t?.type?.typeName}</span>
                        <span>{t?.title?.title}</span>
                        <span>{t?.department?.tag}</span>
                        <span>{t?.unit?.tag}</span>
                        <span>{t?.count}</span>
                        <span>{t?.personnelUsername}</span>
                        <span>{t?.taskDate}</span>
                        <span className="ope-box">
                            <FiInfo
                                className="ope-icon"
                                onClick={() => setItem(t)}
                            />
                        </span>
                    </div>
                ))}
            </div>

            {totalItem && totalPages && totalItem > pageSize && (
                <Pagination
                    page={page}
                    setPage={setPage}
                    pageSize={pageSize}
                    totalItem={totalItem}
                    totalPages={totalPages}
                />
            )}
        </div>
    );
}
