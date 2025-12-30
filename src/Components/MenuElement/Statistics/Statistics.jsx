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
    { key: "pestsByDate", label: "Tarixə Görə Tapşırıq Qeydləri" },
];

const Statistics = ({ setResponseRequest }) => {
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
        try {
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
            api.get("/task/title/getTitles", { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setTaskTitles(res?.data?.data || []));
        } catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Statistikalar üçün məlumatlar yüklənmədi",
                message: err?.response?.data?.errorDescription || err
            }));
        }
    }, []);

    
    const readBlobError = (blob) => {
        return new Promise((resolve) => {
            if (!(blob instanceof Blob)) {
                resolve(null);
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                try {
                    resolve(JSON.parse(reader.result));
                } catch {
                    resolve(null);
                }
            };
            reader.readAsText(blob);
        });
    };


    const handleExport = async () => {
        const body = filters[activeTab] || {};
        let url = "";

        switch (activeTab) {
            case "accountTypeByDepartment": url = "/statistics/excel/accountTypeByDepartment"; break;
            case "statusByAccountType": url = "/statistics/excel/statusByAccountType"; break;
            case "accountTypeCountByDepartment": url = "/statistics/excel/accountTypeCountByDepartment"; break;
            case "accountTypeCountByUnitAndDepartment": url = "/statistics/excel/accountTypeCountByUnitAndDepartment"; break;
            case "accountCountByStatusTimeline": url = "/statistics/excel/accountTypeCountByDate"; break;
            case "createdDeletedCompDomains": url = "/statistics/excel/getCreateAndDeletedCompDomains"; break;
            case "createdDeletedElectronic": url = "/statistics/excel/getCreateAndDeletedElectronicAddress"; break;
            case "pestsByDate": url = "/statistics/excel/getPestsByDate"; break;
            default: return;
        }

        try {
            const token = localStorage.getItem("myUserDutyToken");

            const res = await api.post(url, body, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "blob"
            });

            if (!res?.data || res.data.size === 0) {
                setResponseRequest(prev => ({
                    ...prev,
                    showResponse: true,
                    title: "⚠️ Filterə uyğun məlumat tapılmadı!"
                }));
                return;
            }

            const blob = new Blob(
                [res.data],
                { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
            );

            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = `${activeTab}.xlsx`;
            link.click();

            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "✅ Excel faylı uğurla hazırlandı!"
            }));

            document.querySelectorAll('input[type="checkbox"]').forEach(i => i.checked = false);
            document.querySelectorAll('input[type="date"]').forEach(i => i.value = "");
            document.querySelectorAll('.stat-multi-checkbox-absolute')
                .forEach(el => el.style.display = "none");

            setFilters({});
        }
        catch (err) {
            let errorMessage = "Naməlum xəta baş verdi";

            if (err?.response?.data instanceof Blob) {
                const parsed = await readBlobError(err.response.data);
                errorMessage =
                    parsed?.errorDescription ||
                    parsed?.message ||
                    errorMessage;
            }
            else {
                errorMessage =
                    err?.response?.data?.errorDescription ||
                    err?.message ||
                    errorMessage;
            }

            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Excel faylı endirilərkən xəta baş verdi",
                message: errorMessage
            }));

            console.error(err);
        }
    };

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
            };
            if (filters[activeTab]?.departmentIds?.length !== 0) {
                let u, uList = [];
                const callUnits = async (id) => {
                    u = await api.get(`/department/unit/getUnitsByDepartment/${id}`, hdrs);
                    uList = [...uList, ...(u?.data?.data || [])];
                    setUnits(uList);
                }
                filters[activeTab]?.departmentIds?.forEach((id) => {
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
        callUnitByDep();
    }, [activeTab, filters[activeTab]?.departmentIds]);

    const addClassToAbsolute = (e) => {
        const allAbsolutes = document.querySelectorAll('.stat-multi-checkbox-absolute');
        allAbsolutes.forEach(abs => {
            abs.style.display = "none";
        });
        const absoluteDiv = e.target.nextSibling;
        absoluteDiv.style.display = "grid";
    };

    const renderFilter = () => {
        switch (activeTab) {
            case "accountTypeByDepartment":
                return (
                    <div className="stat-filter stat-filter-accounttype">
                        <select onChange={e => setFilters(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], departmentOrders: e.target.value.split(",").map(Number) } }))}>
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
                            <label onClick={addClassToAbsolute}>Status</label>
                            <div className="stat-multi-checkbox-absolute">
                                {statuses.map(s => (
                                    <label key={s.id}><input type="checkbox" value={s.id} onChange={e => {
                                        const prev = filters[activeTab]?.statusIds || [];
                                        const val = +e.target.value;
                                        const newArr = prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val];
                                        setFilters(prevF => ({ ...prevF, [activeTab]: { ...prevF[activeTab], statusIds: newArr } }));
                                    }} />{s.status}</label>
                                ))}
                            </div>
                        </div>

                        <div className="stat-multi-checkbox">
                            <label onClick={addClassToAbsolute}>İdarələr</label>
                            <div className="stat-multi-checkbox-absolute">
                                {departments.map(d => (
                                    <label key={d.id}><input type="checkbox" value={d.id} onChange={e => {
                                        const prev = filters[activeTab]?.departmentIds || [];
                                        const val = +e.target.value;
                                        const newArr = prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val];
                                        setFilters(prevF => ({ ...prevF, [activeTab]: { ...prevF[activeTab], departmentIds: newArr } }));
                                    }} />{d.tag}</label>
                                ))}
                            </div>
                        </div>

                        <div className="stat-multi-checkbox">
                            <label onClick={addClassToAbsolute}>Bölmələr</label>
                            <div className="stat-multi-checkbox-absolute">
                                {units.map(u => (
                                    <label key={u.id}><input type="checkbox" value={u.id} onChange={e => {
                                        const prev = filters[activeTab]?.unitIds || [];
                                        const val = +e.target.value;
                                        const newArr = prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val];
                                        setFilters(prevF => ({ ...prevF, [activeTab]: { ...prevF[activeTab], unitIds: newArr } }));
                                    }} />{u.tag}</label>
                                ))}
                            </div>
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
                        <select onChange={e => setFilters(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], departmentOrders: e.target.value.split(",").map(Number) } }))}>
                            <option value="">İdarələr siyahısı seç</option>
                            {depOrders.map(d => <option key={d.id} value={d.departmentIds}>{d.name}</option>)}
                        </select>
                        <select onChange={e => setFilters(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], statusId: +e.target.value } }))}>
                            <option value="">Status Seç</option>
                            {statuses.map(s => <option key={s.id} value={s.id}>{s.status}</option>)}
                        </select>
                        <input type="date" onChange={e => setFilters(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], fromDate: e.target.value.split("-").reverse().join(".") } }))} />
                        <input type="date" onChange={e => setFilters(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], toDate: e.target.value.split("-").reverse().join(".") } }))} />
                    </div>
                );

            case "accountTypeCountByUnitAndDepartment":
                return (
                    <div className="stat-filter stat-filter-unit-dep">
                        <select
                            onChange={e =>
                                setFilters(prev => ({
                                    ...prev,
                                    [activeTab]: {
                                        ...prev[activeTab],
                                        departmentOrderIds: e.target.value
                                            ? e.target.value.split(",").map(Number)
                                            : []
                                    }
                                }))
                            }
                        >
                            <option value="">İdarə ardıcıllığı seç</option>
                            {depOrders.map(d => (
                                <option key={d.id} value={d.departmentIds}>
                                    {d.name}
                                </option>
                            ))}
                        </select>

                        <select
                            onChange={e =>
                                setFilters(prev => ({
                                    ...prev,
                                    [activeTab]: {
                                        ...prev[activeTab],
                                        unitOrderIds: e.target.value
                                            ? e.target.value.split(",").map(Number)
                                            : []
                                    }
                                }))
                            }
                        >
                            <option value="">Bölmə ardıcıllığı seç</option>
                            {unitOrders.map(u => (
                                <option key={u.id} value={u.unitIds}>
                                    {u.name}
                                </option>
                            ))}
                        </select>

                        <div className="stat-multi-checkbox">
                            <label onClick={addClassToAbsolute}>Status</label>
                            <div className="stat-multi-checkbox-absolute">
                                {statuses.map(s => (
                                    <label key={s.id}>
                                        <input
                                            type="checkbox"
                                            value={s.id}
                                            onChange={e => {
                                                const prevArr =
                                                    filters[activeTab]?.filter?.statusIds || [];
                                                const val = +e.target.value;
                                                const newArr = prevArr.includes(val)
                                                    ? prevArr.filter(x => x !== val)
                                                    : [...prevArr, val];

                                                setFilters(prev => ({
                                                    ...prev,
                                                    [activeTab]: {
                                                        ...prev[activeTab],
                                                        filter: {
                                                            ...prev[activeTab]?.filter,
                                                            statusIds: newArr
                                                        }
                                                    }
                                                }));
                                            }}
                                        />
                                        {s.status}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="stat-multi-checkbox">
                            <label onClick={addClassToAbsolute}>İdarələr</label>
                            <div className="stat-multi-checkbox-absolute">
                                {departments.map(d => (
                                    <label key={d.id}>
                                        <input
                                            type="checkbox"
                                            value={d.id}
                                            onChange={e => {
                                                const prevArr =
                                                    filters[activeTab]?.filter?.departmentIds || [];
                                                const val = +e.target.value;
                                                const newArr = prevArr.includes(val)
                                                    ? prevArr.filter(x => x !== val)
                                                    : [...prevArr, val];

                                                setFilters(prev => ({
                                                    ...prev,
                                                    [activeTab]: {
                                                        ...prev[activeTab],
                                                        filter: {
                                                            ...prev[activeTab]?.filter,
                                                            departmentIds: newArr
                                                        }
                                                    }
                                                }));
                                            }}
                                        />
                                        {d.tag}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="stat-multi-checkbox">
                            <label onClick={addClassToAbsolute}>Bölmələr</label>
                            <div className="stat-multi-checkbox-absolute">
                                {units.map(u => (
                                    <label key={u.id}>
                                        <input
                                            type="checkbox"
                                            value={u.id}
                                            onChange={e => {
                                                const prevArr =
                                                    filters[activeTab]?.filter?.unitIds || [];
                                                const val = +e.target.value;
                                                const newArr = prevArr.includes(val)
                                                    ? prevArr.filter(x => x !== val)
                                                    : [...prevArr, val];

                                                setFilters(prev => ({
                                                    ...prev,
                                                    [activeTab]: {
                                                        ...prev[activeTab],
                                                        filter: {
                                                            ...prev[activeTab]?.filter,
                                                            unitIds: newArr
                                                        }
                                                    }
                                                }));
                                            }}
                                        />
                                        {u.tag}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <input
                            type="date"
                            onChange={e =>
                                setFilters(prev => ({
                                    ...prev,
                                    [activeTab]: {
                                        ...prev[activeTab],
                                        filter: {
                                            ...prev[activeTab]?.filter,
                                            fromDate: e.target.value
                                                .split("-")
                                                .reverse()
                                                .join(".")
                                        }
                                    }
                                }))
                            }
                        />

                        <input
                            type="date"
                            onChange={e =>
                                setFilters(prev => ({
                                    ...prev,
                                    [activeTab]: {
                                        ...prev[activeTab],
                                        filter: {
                                            ...prev[activeTab]?.filter,
                                            toDate: e.target.value
                                                .split("-")
                                                .reverse()
                                                .join(".")
                                        }
                                    }
                                }))
                            }
                        />

                        <select
                            onChange={e =>
                                setFilters(prev => ({
                                    ...prev,
                                    [activeTab]: {
                                        ...prev[activeTab],
                                        filter: {
                                            ...prev[activeTab]?.filter,
                                            registered:
                                                e.target.value === ""
                                                    ? null
                                                    : e.target.value === "true"
                                        }
                                    }
                                }))
                            }
                        >
                            <option value="">Hamısı</option>
                            <option value="true">Qeydiyyatdan keçmiş</option>
                            <option value="false">Qeydiyyatdan keçməmiş</option>
                        </select>

                    </div>
                );

            case "accountCountByStatusTimeline":
                return (
                    <div className="stat-filter stat-filter-accountstatus-timeline">
                        <select onChange={e => setFilters(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], accountTypeId: +e.target.value } }))}>
                            <option value="">Hesab növü seç</option>
                            {accountTypes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                        <div className="stat-multi-checkbox">
                            <label onClick={addClassToAbsolute}>Tapşırıq Başlığı</label>
                            <div className="stat-multi-checkbox-absolute">
                                {taskTitles.map(t => (
                                    <label key={t.id}><input type="checkbox" value={t.id} onChange={e => {
                                        const prev = filters[activeTab]?.taskTitleId || [];
                                        const val = +e.target.value;
                                        const newArr = prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val];
                                        setFilters(prevF => ({ ...prevF, [activeTab]: { ...prevF[activeTab], taskTitleId: newArr } }));
                                    }} />{t.title}</label>
                                ))}
                            </div>
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
                            <label onClick={addClassToAbsolute}>Hesab Növləri</label>
                            <div className="stat-multi-checkbox-absolute">
                                {accountTypes.map(a => (
                                    <label key={a.id}><input type="checkbox" value={a.id} onChange={e => {
                                        const prev = filters[activeTab]?.accountTypeIds || [];
                                        const val = +e.target.value;
                                        const newArr = prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val];
                                        setFilters(prevF => ({ ...prevF, [activeTab]: { ...prevF[activeTab], accountTypeIds: newArr } }));
                                    }} />{a.name}</label>
                                ))}
                            </div>
                        </div>
                        <input type="date" onChange={e => setFilters(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], fromDate: e.target.value.split("-").reverse().join(".") } }))} />
                        <input type="date" onChange={e => setFilters(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], toDate: e.target.value.split("-").reverse().join(".") } }))} />
                    </div>
                );

            case "pestsByDate":
                return (
                    <div className="stat-filter stat-filter-pests">
                        <div className="stat-multi-checkbox">
                            <label onClick={addClassToAbsolute}>Tapşırıq Başlığı</label>
                            <div className="stat-multi-checkbox-absolute">
                                {taskTitles.map(t => (
                                    <label key={t.id}><input type="checkbox" value={t.id} onChange={e => {
                                        const prev = filters[activeTab]?.titleIds || [];
                                        const val = +e.target.value;
                                        const newArr = prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val];
                                        setFilters(prevF => ({ ...prevF, [activeTab]: { ...prevF[activeTab], titleIds: newArr } }));
                                    }} />{t.title}</label>
                                ))}
                            </div>
                        </div>
                        <input type="date" onChange={e => setFilters(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], fromDate: e.target.value.split("-").reverse().join(".") } }))} />
                        <input type="date" onChange={e => setFilters(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], toDate: e.target.value.split("-").reverse().join(".") } }))} />
                    </div>
                );

            default:
                return <div className="stat-filter-placeholder">Filterlar burada görünməlidir</div>;
        }
    };


    useEffect(() => {
        setFilters({});
        const inputs = document.querySelectorAll('input[type="checkbox"]');
        inputs.forEach(input => {
            input.checked = false;
        });

        const inputsDate = document.querySelectorAll('input[type="date"]');
        inputsDate.forEach(input => {
            input.value = "";
        });

        const allAbsolutes = document.querySelectorAll('.stat-multi-checkbox-absolute');
        allAbsolutes.forEach(abs => {
            abs.style.display = "none";
        });
    }, [activeTab]);

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
                <button className="statistics-export-btn" onClick={handleExport}>Excel kimi endir</button>
            </div>
        </div>
    );
};

export default Statistics;
