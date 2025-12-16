import React, { useEffect, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import "./Loggins.css";
import api from "../../api";
import Pagination from "../Pagination/Pagination";
import { FiInfo } from "react-icons/fi";
import LogDetails from "./LogDetails";


export default function Loggins({ setResponseRequest, userInfo, setItem, item }) {

    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(12);
    const [totalItem, setTotalItem] = useState(null);
    const [totalPages, setTotalPages] = useState(null);
    const [rankList, setRankList] = useState([]);
    const [showLogDetails, setShowLogDetails] = useState(null)

    const [actions] = useState([
        { id: 1, action: "Yaradıldı" },
        { id: 2, action: "Dəyişdirildi" },
        { id: 3, action: "Statusu silinmiş" },
        { id: 4, action: "Aktiv" },
        { id: 5, action: "Deactiv" },
        { id: 6, action: "Məxfi" },
        { id: 7, action: "Qeyri Məxfi" },
        { id: 8, action: "Silinmiş" }
    ]);

    const [accTypeList, setAccTypeList] = useState([]);

    const [activeFilter, setActiveFilter] = useState(null);

    const [filters, setFilters] = useState({
        clientSearchText: "",
        issuerSearchText: "",
        clientRankIds: [],
        issuerRankIds: [],
        accountTypeIds: [],
        actionIds: [],
        newToOld: true
    });

    const loadFilterData = async () => {
        const token = localStorage.getItem('myUserDutyToken');
        const hdr = { headers: { Authorization: `Bearer ${token}` } };

        try {
            const ranks = await api.get('/rank/getAllRank', hdr);
            const types = await api.get('/admin/accountType/getAllAccountType', hdr);

            setRankList(ranks?.data?.data || []);
            setAccTypeList(types?.data?.data || []);

        } catch (err) {
            console.log(err)
        }
    };

    const getLogs = async () => {
        const token = localStorage.getItem('myUserDutyToken');

        try {
            const res = await api.post(
                "/admin/history/getLogs",
                filters,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { page, pageSize }
                }
            );

            setTotalItem(res?.data?.totalItem || null);
            setTotalPages(res?.data?.totalPages || null);
            setLogs(res?.data?.data || []);
        } catch (err) {
            console.log(err)
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

    const showFilter = (type) => {
        setActiveFilter(prev => prev === type ? null : type);
    }

    useEffect(() => {
        setItem(null);
        loadFilterData();
        getLogs();
    }, []);

    const showDetails = async (log) => {
        const token = localStorage.getItem('myUserDutyToken');

        try {
            const res = await api.get(
                `/admin/history/getLogDetails/${log?.id}`,
                filters,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setItem(res?.data?.data);
        } catch (err) {
            console.log(err)
        }
        setShowLogDetails(true)
    }

    const clearFilter = () => {
        setFilters({
            clientSearchText: "",
            issuerSearchText: "",
            clientRankIds: [],
            issuerRankIds: [],
            accountTypeIds: [],
            actionIds: [],
            newToOld: true
        })

        const inputs = document.querySelectorAll('input[type="checkbox"]');
        inputs.forEach(input => {
            input.checked = false;
        });

        setActiveFilter(null);
    }

    useEffect(() => {
        getLogs();

        console.log(totalItem, page)
    }, [filters, page]);

    return (
        <div className="logs-wrapper p-4">

            <div className="filters">

                <div className="filter-box">
                    <input
                        placeholder="İstifadəçi axtar..."
                        className="filter-label"
                        value={filters.clientSearchText}
                        onChange={(e) => setFilters({ ...filters, clientSearchText: e.target.value })}
                    />
                </div>

                <div className="filter-box">
                    <input
                        placeholder="Təsdiq edən axtar..."
                        className="filter-label"
                        value={filters.issuerSearchText}
                        onChange={(e) => setFilters({ ...filters, issuerSearchText: e.target.value })}
                    />
                </div>

                <div className="filter-box">
                    <span className="filter-label" onClick={() => showFilter("actionIds")}>
                        Əməliyyat <FiChevronDown />
                    </span>
                    <div className={`filter-box-child ${activeFilter === 'actionIds' ? 'show-filtered-element' : ''}`}>
                        {actions.map(a => (
                            <label key={a.id}>
                                <input
                                    type="checkbox"
                                    checked={filters.actionIds.includes(a.id)}
                                    onChange={() => toggleFilter("actionIds", a.id)}
                                />
                                <span>{a.action}</span>
                            </label>
                        ))}
                    </div>
                </div>


                <div className="filter-box">
                    <span className="filter-label" onClick={() => showFilter("accountTypeIds")}>
                        Hesab Növü <FiChevronDown />
                    </span>
                    <div className={`filter-box-child ${activeFilter === 'accountTypeIds' ? 'show-filtered-element' : ''}`}>
                        {accTypeList.map(t => (
                            <label key={t.id}>
                                <input
                                    type="checkbox"
                                    checked={filters.accountTypeIds.includes(t.id)}
                                    onChange={() => toggleFilter("accountTypeIds", t.id)}
                                />
                                <span>{t.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="filter-box">
                    <span className="filter-label" onClick={() => showFilter("clientRankIds")}>
                        İstifadəçi Rütbəsi <FiChevronDown />
                    </span>
                    <div className={`filter-box-child ${activeFilter === 'clientRankIds' ? 'show-filtered-element' : ''}`}>
                        {rankList.map(t => (
                            <label key={t.id}>
                                <input
                                    type="checkbox"
                                    checked={filters.clientRankIds.includes(t.id)}
                                    onChange={() => toggleFilter("clientRankIds", t.id)}
                                />
                                <span>{t.name}</span>
                            </label>
                        ))}
                    </div>
                </div>


                <div className="filter-box">
                    <span className="filter-label" onClick={() => showFilter("issuerRankIds")}>
                        Növbətçi Rütbəsi <FiChevronDown />
                    </span>
                    <div className={`filter-box-child ${activeFilter === 'issuerRankIds' ? 'show-filtered-element' : ''}`}>
                        {rankList.map(t => (
                            <label key={t.id}>
                                <input
                                    type="checkbox"
                                    checked={filters.issuerRankIds.includes(t.id)}
                                    onChange={() => toggleFilter("issuerRankIds", t.id)}
                                />
                                <span>{t.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="filter-box">
                    <span className="filter-label clear-filter" onClick={clearFilter}>
                        Filteri Sıfırla
                    </span>
                </div>

            </div>


            <div className="logs-table">

                <div className="table-header table-log-header">
                    <span>#</span>
                    <span>Əməliyyat</span>
                    <span>Ad</span>
                    <span>Soyad</span>
                    <span>Rütbə</span>
                    <span>Növ</span>
                    <span>Sənəd Nömrəsi</span>
                    <span>Tarix</span>
                    <span className="log-more-icon-box">Ətraflı</span>
                </div>

                {logs.map((log, index) => (
                    <div className="table-row table-log-row" key={log.id}>
                        <span>{pageSize * (page - 1) + index + 1}</span>
                        <span>{log?.action}</span>
                        <span>{log?.clientData?.name}</span>
                        <span>{log?.clientData?.surname}</span>
                        <span>{log?.clientData?.rank?.name}</span>
                        <span>{log?.accountType}</span>
                        <span>{log?.documentNo || "Mövcud deyil"}</span>
                        <span>{log?.historyDate?.split("T")[0]} {log?.historyDate?.split("T")[1]?.slice(0, 8)}</span>
                        <span className="log-more-icon-box">
                            <FiInfo className="icon-log-more" onClick={() => showDetails(log)} />
                        </span>
                    </div>
                ))}

            </div>

            {
                showLogDetails && (
                    <LogDetails setResponseRequest={setResponseRequest} setItem={setItem} item={item} setShowLogDetails={setShowLogDetails} />
                )
            }

            {
                totalItem && totalPages && (totalItem > pageSize) && (
                    <Pagination page={page} setPage={setPage} pageSize={pageSize} totalItem={totalItem} totalPages={totalPages} />
                )
            }
        </div>
    );
}
