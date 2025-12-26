import React, { useEffect, useState } from 'react';
import api from '../../api';
import { FaPlus } from 'react-icons/fa';
import { FiChevronDown, FiInfo, FiDownload } from "react-icons/fi";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import "./Accounts.css"
import CreateAndUpdateAcc from './CreateAndUpdateAcc';
import Pagination from '../Pagination/Pagination';
import ClientOpe from './ClientOpe';
import ExportModal from './ExcelExport/ExportModal';

export default function Accounts({ setResponseRequest, userInfo, setItem, item }) {
    const [allAccounts, setAllAccounts] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [activeFilter, setActiveFilter] = useState(null);
    const [createAndUpdate, setCreateAndUpdate] = useState(null);
    const [typeOpe, setTypeOpe] = useState("");
    const [apiOpe, setApiOpe] = useState("");
    const [isDeleteU, setIsDeleteU] = useState(null);
    const [totalItem, setTotalItem] = useState(null);
    const [totalPages, setTotalPages] = useState(null)
    const [showClientOpe, setShowClientOpe] = useState(null);
    const [isFromESD] = useState(null);
    const [showExportModal, setShowExportModal] = useState(false);

    const [filters, setFilters] = useState({
        text: "",
        ranks: [],
        departments: [],
        units: [],
        accountTypes: [],
        accountStatus: [],
        fromDate: "",
        toDate: "",
        newToOld: true,
        registered: null
    });

    const [rankList, setRankList] = useState([]);
    const [departmentList, setDepartmentList] = useState([]);
    const [unitList, setUnitList] = useState([]);
    const [accTypeList, setAccTypeList] = useState([]);
    const [accStatusList, setAccStatusList] = useState([]);

    const callAccounts = async () => {
        const token = localStorage.getItem('myUserDutyToken');
        const hdrs = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        if (!token) return;
        try {
            const req = {
                searchData: filters.text,
                ranks: filters.ranks,
                departmentIds: filters.departments,
                unitIds: filters.units,
                accountTypeIds: filters.accountTypes,
                accountStatusIds: filters.accountStatus,
                newToOld: filters?.newToOld,
                fromDate: filters?.fromDate,
                toDate: filters?.toDate,
                registered: filters?.registered
            };

            const res = await api.post(
                '/admin/client/getAllClients',
                req,
                {
                    ...hdrs,
                    params: {
                        page,
                        pageSize,
                    }
                }
            );

            setTotalItem(res?.data?.totalItem || null);
            setTotalPages(res?.data?.totalPages || null);
            setAllAccounts(res?.data?.data || []);
        } catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Məlumatlar alınarkən xəta baş verdi",
                message: err?.response?.data?.errorDescription || err,
            }));
        }
    };

    const loadFilterData = async () => {
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

        if (!token) return;

        try {
            const r = await api.get('/rank/getAllRank', hdrs);
            const d = await api.get('/department/getDepartments', hdrsDep);
            const u = await api.get('/department/unit/getAllUnit', hdrsDep);
            const t = await api.get('/admin/accountType/getAllAccountType', hdrs);
            const s = await api.get('/general/status/getAllStatus', hdrs);


            setRankList(r?.data?.data || []);
            setDepartmentList(d?.data?.data?.data || []);
            setUnitList(u?.data?.data?.data || []);
            setAccTypeList(t?.data?.data || []);
            setAccStatusList(s?.data?.data || []);

        } catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Məlumatlar alınarkən xəta baş verdi",
                message: err?.response?.data?.errorDescription || err,
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

    const searchByText = (e) => {
        setFilters(prev => ({
            ...prev,
            text: e?.target?.value
        }))
    }


    const showFilter = (filterName) => {
        setActiveFilter(prev => prev === filterName ? null : filterName);
    }

    const clearFilter = () => {
        setFilters({
            text: "",
            ranks: [],
            departments: [],
            units: [],
            accountTypes: [],
            accountStatus: [],
            fromDate: "",
            toDate: "",
            newToOld: true,
            registered: null
        })

        const inputs = document.querySelectorAll('input[type="checkbox"]');
        inputs.forEach(input => {
            input.checked = false;
        });

        setActiveFilter(null);
    }

    useEffect(() => {
        setItem(null)
        loadFilterData();
    }, []);

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

            if (filters?.departments.length !== 0) {
                let u, uList = [];
                const callUnits = async (id) => {
                    u = await api.get(`/department/unit/getUnitsByDepartment/${id}`, hdrs);
                    uList = [...uList, ...(u?.data?.data || [])];
                    setUnitList(uList);
                }
                filters?.departments.forEach((id) => {
                    callUnits(id)
                })
            }
            else {
                const uu = await api.get('/department/unit/getAllUnit', hdrsDep);
                setUnitList(uu?.data?.data?.data || []);
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
            units: []
        }));

        const inputs = document.querySelectorAll('.unit-checkbox');
        inputs.forEach(input => {
            input.checked = false;
        });

        callUnitByDep();
    }, [filters?.departments])

    useEffect(() => {
        callAccounts();
    }, [filters, page]);

    useEffect(() => {
        setPage(1)
    }, [filters]);

    const deleteUser = async () => {
        setIsDeleteU(null)
        try {
            const token = localStorage.getItem('myUserDutyToken');
            const hdrs = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const client = await api.get(`/admin/client/getClientDetails/${item?.id}`, hdrs)
            const clientData = client?.data?.data;

            const req = {
                fin: clientData?.person?.fin,
                name: clientData?.person?.name,
                surname: clientData?.person?.surname,
                fatherName: clientData?.person?.fatherName,
                rankId: clientData?.person?.rank?.id,
                departmentId: clientData?.person?.department?.id,
                unitId: clientData?.person?.unit?.id,
                position: clientData?.person?.position,
                phoneNumber: clientData?.phoneNumber,
                note: clientData?.note,
                isRegistered: clientData?.registered,
                accountTypeId: clientData?.accountType?.id,
                statusId: 5,
                username: clientData?.username,
                password: clientData?.password,
                deviceData: clientData?.device,
                documentNo: clientData?.documentNo || null,
                formId: clientData?.formId || null
            }

            if (clientData?.accountStatus?.id != 5) {
                setResponseRequest(prev => (
                    {
                        ...prev,
                        isQuestion: true,
                        showResponse: true,
                        title: `${item?.name} ${item?.surname} adlı istifadəçinin statusunu dəyişməyə əminsiniz?`,
                        type: "deleteAccSoft",
                        api: `/admin/client/updateClient/${item?.id}`,
                        message: req
                    }
                ))
            }
            else {

                setResponseRequest(prev => (
                    {
                        ...prev,
                        isQuestion: false,
                        showResponse: true,
                        title: `${item?.name} ${item?.surname} adlı istifadəçinin statusu artıq "silinmiş" kimi qeyd olunub`
                    }
                ))
            }
        } catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Məlumatlar alınarkən xəta baş verdi",
                message: err?.response?.data?.errorDescription || err,
            }));
        }
    }

    const isDeleteUser = (acc) => {
        setItem(acc)
        setIsDeleteU(true)
    }

    const cancelDelete = () => {
        setItem(null)
        setIsDeleteU(null)
    }

    const deleteUserFromData = async () => {
        setIsDeleteU(null);
        try {
            const token = localStorage.getItem('myUserDutyToken');
            const hdrs = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const client = await api.get(`/admin/client/getClientDetails/${item?.id}`, hdrs)
            const clientData = client?.data?.data;

            const req = {
                documentNo: clientData?.documentNo || "",
                formId: clientData?.formId || "",
                clientId: clientData?.id
            }

            setResponseRequest(prev => (
                {
                    ...prev,
                    isQuestion: true,
                    showResponse: true,
                    title: `${item?.name} ${item?.surname} adlı istifadəçini bir dəfəlik silməyə əminsiniz?`,
                    type: "deleteAccHard",
                    api: `/admin/client/deleteClient`,
                    message: req
                }
            ))
        } catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Məlumatlar alınarkən xəta baş verdi",
                message: err?.response?.data?.errorDescription || err,
            }));
        }
    }

    const deleteBySingleUser = (acc) => {
        setItem(acc)
        deleteUser()
    }

    const editUser = async (acc) => {
        try {
            const token = localStorage.getItem('myUserDutyToken');
            const hdrs = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const client = await api.get(`/admin/client/getClientDetails/${acc?.id}`, hdrs)
            const clientData = client?.data?.data;

            const req = {
                fin: clientData?.person?.fin,
                name: clientData?.person?.name,
                surname: clientData?.person?.surname,
                fatherName: clientData?.person?.fatherName,
                rankId: clientData?.person?.rank?.id,
                departmentId: clientData?.person?.department?.id,
                unitId: clientData?.person?.unit?.id,
                position: clientData?.person?.position,
                phoneNumber: clientData?.phoneNumber,
                note: clientData?.note,
                isRegistered: clientData?.registered,
                accountTypeId: clientData?.accountType?.id,
                statusId: clientData?.accountStatus?.id,
                username: clientData?.username,
                password: clientData?.password,
                deviceData: clientData?.device,
                documentNo: clientData?.documentNo || null,
                formId: clientData?.formId || null
            }

            setItem(req);
            setCreateAndUpdate(true)
            setApiOpe(`/admin/client/updateClient/${acc?.id}`);
            setTypeOpe("editAcc");

        } catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Məlumatlar alınarkən xəta baş verdi",
                message: err?.response?.data?.errorDescription || err,
            }));
        }
    }

    const createAcc = () => {
        setItem(null)
        setCreateAndUpdate(true)
        setApiOpe("/admin/client/createClient");
        setTypeOpe("createAcc");
    }

    const showOpe = (acc) => {
        setShowClientOpe(true)
        setItem(acc)
    }

    const changeAsc = (e) => {
        if (e?.target?.value == `${true}`) {
            setFilters(prev => ({
                ...prev, newToOld: true
            }))
        }
        else if (e?.target?.value == `${false}`) {
            setFilters(prev => ({
                ...prev, newToOld: false
            }))
        }
    }

    const changeRegistered = (e) => {
        if (e?.target?.value == `${true}`) {
            setFilters(prev => ({
                ...prev, registered: true
            }))
        }
        else if (e?.target?.value == `${false}`) {
            setFilters(prev => ({
                ...prev, registered: false
            }))
        }
        else if (e?.target?.value == `${null}`) {
            setFilters(prev => ({
                ...prev, registered: null
            }))
        }
    }

    return (
        <div className="accounts-wrapper p-4 w-full">
            <div className="filters flex flex-wrap gap-3 mb-5">

                <div className="filter-box">
                    <input
                        className="filter-label"
                        placeholder='axtar...'
                        value={filters?.text}
                        onChange={(e) => searchByText(e)} />
                </div>

                <div className="filter-box">
                    <span className="filter-label" onClick={() => showFilter("rank")}>
                        Rütbə
                        <FiChevronDown />
                    </span>
                    <div className={`filter-box-child ${activeFilter === 'rank' ? 'show-filtered-element' : ''}`}>
                        {rankList.map(r => (
                            <label
                                key={r.id}
                            >
                                <input type="checkbox"
                                    checked={filters.ranks.includes(r.id)}
                                    onChange={() => toggleFilter('ranks', r.id)} />
                                <span>{r.description}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="filter-box">
                    <span className="filter-label" onClick={() => showFilter("dep")}>
                        İdarə
                        <FiChevronDown />
                    </span>
                    <div className={`filter-box-child ${activeFilter === 'dep' ? 'show-filtered-element' : ''}`}>
                        {departmentList.map(d => (
                            <label
                                key={d.id}
                            >
                                <input type="checkbox"
                                    checked={filters.departments.includes(d.id)}
                                    onChange={() => toggleFilter('departments', d.id)} />
                                <span>{d.tag}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="filter-box">
                    <span className="filter-label" onClick={() => showFilter("unit")}>
                        Bölmə
                        <FiChevronDown />
                    </span>
                    <div className={`filter-box-child ${activeFilter === 'unit' ? 'show-filtered-element' : ''}`}>
                        {unitList.map(u => (
                            <label key={u.id}>
                                <input
                                    type="checkbox"
                                    checked={filters.units.includes(u.id)}
                                    onChange={() => toggleFilter("units", u.id)}
                                    className="unit-checkbox"
                                />
                                <span>{u.tag}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="filter-box">
                    <span className="filter-label" onClick={() => showFilter("type")}>
                        Hesab növü
                        <FiChevronDown />
                    </span>
                    <div className={`filter-box-child ${activeFilter === 'type' ? 'show-filtered-element' : ''}`}>
                        {accTypeList.map(t => (
                            <label key={t.id}>
                                <input
                                    type="checkbox"
                                    checked={filters.accountTypes.includes(t.id)}
                                    onChange={() => toggleFilter("accountTypes", t.id)}
                                />
                                <span>{t.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="filter-box">
                    <span className="filter-label" onClick={() => showFilter("status")}>
                        Status
                        <FiChevronDown />
                    </span>
                    <div className={`filter-box-child ${activeFilter === 'status' ? 'show-filtered-element' : ''}`}>
                        {accStatusList.map(s => (
                            <label key={s.id}>
                                <input
                                    type="checkbox"
                                    checked={filters.accountStatus.includes(s.id)}
                                    onChange={() => toggleFilter("accountStatus", s.id)}
                                />
                                <span>{s.status.toLowerCase() == "deleted" ? "Silinmiş" :
                                    s.status.toLowerCase() == "active" ? "Aktiv" :
                                        s.status.toLowerCase() == "deactive" ? "Deaktiv" :
                                            s.status.toLowerCase() == "confidential" ? "Məxfi" : "Qeyri Məxfi"}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="filter-box">
                    <input
                        className="filter-label date-filter"
                        value={filters.fromDate.split(".").reverse().join("-")}
                        type="date"
                        onChange={e =>
                            setFilters(prev => ({ ...prev, fromDate: e.target.value.split("-").reverse().join(".") }))
                        }
                    />

                </div>

                <div className="filter-box">
                    <input
                        className="filter-label date-filter"
                        value={filters.toDate.split(".").reverse().join("-")}
                        type="date"
                        onChange={e =>
                            setFilters(prev => ({ ...prev, toDate: e.target.value.split("-").reverse().join(".") }))
                        }
                    />
                </div>

                <div className="filter-box sort-filter">
                    <select
                        className="filter-select"
                        onChange={changeAsc}
                        value={filters?.newToOld}
                    >
                        <option value={`${true}`}>Yenidən Köhnəyə</option>
                        <option value={`${false}`}>Köhnədən Yeniyə</option>
                    </select>
                    <span className="select-icon">⇅</span>
                </div>

                <div className="filter-box sort-filter">
                    <select
                        className="filter-select"
                        onChange={changeRegistered}
                        value={filters?.registered}
                    >
                        <option value={`${null}`}>Hamısı</option>
                        <option value={`${true}`}>Qeydiyyatdan keçmiş</option>
                        <option value={`${false}`}>Qeydiyyatdan keçməmiş</option>
                    </select>
                </div>

                <button onClick={clearFilter} className="clear-filters">Filteri sıfırla</button>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '5px' }}>
                <button className="add-account-btn" onClick={createAcc}>
                    <FaPlus /> Yeni İstifadəçi
                </button>

                <button className="add-account-btn export-account-btn" onClick={() => setShowExportModal(true)}>
                  <FiDownload /> Excel kimi endir
                </button>
            </div>

            <div className="accounts-table w-full">
                <div className="table-header">
                    <span>#</span>
                    <span>Rütbə</span>
                    <span>Ad</span>
                    <span>Soyad</span>
                    <span>Ata adı</span>
                    <span>İstifadəçi adı</span>
                    <span>Vəzifə</span>
                    <span>Hesab Növü</span>
                    <span>Status</span>
                    <span style={{ textAlign: 'center' }}>Əməliyyatlar</span>
                </div>

                {allAccounts.map((acc, index) => (
                    <div className="table-row" key={acc?.id}>
                        <span>{pageSize * (page - 1) + index + 1}</span>
                        <span>{acc?.rank?.name}</span>
                        <span>{acc?.name}</span>
                        <span>{acc?.surname}</span>
                        <span>{acc?.fatherName}</span>
                        <span>{acc?.username}</span>
                        <span>{acc?.position}</span>
                        <span>{acc?.accountType?.name}</span>
                        <span>
                            {acc?.accountStatus?.status.toLowerCase() == "deleted" ? "Silinmiş" :
                                acc?.accountStatus?.status.toLowerCase() == "active" ? "Aktiv" :
                                    acc?.accountStatus?.status.toLowerCase() == "deactive" ? "Deaktiv" :
                                        acc?.accountStatus?.status.toLowerCase() == "confidential" ? "Məxfi" : "Qeyri Məxfi"}
                        </span>
                        <span className='ope-box'>
                            <FiInfo className='ope-icon' onClick={() => showOpe(acc)} />
                            <AiOutlineEdit className='ope-icon' onClick={() => editUser(acc)} />
                            <AiOutlineDelete className='ope-icon' onClick={
                                userInfo?.role?.name === "Admin" ? () => isDeleteUser(acc)
                                    :
                                    () => deleteBySingleUser(acc)
                            }
                            />
                        </span>
                    </div>
                ))}
            </div>

            {
                createAndUpdate && (
                    <CreateAndUpdateAcc
                        setApiOpe={setApiOpe} apiOpe={apiOpe}
                        setTypeOpe={setTypeOpe} typeOpe={typeOpe}
                        setCreateAndUpdate={setCreateAndUpdate}
                        setResponseRequest={setResponseRequest}
                        rankList={rankList}
                        departmentList={departmentList}
                        unitList={unitList}
                        accTypeList={accTypeList}
                        accStatusList={accStatusList}
                        setItem={setItem}
                        item={item}
                        isFromESD={isFromESD}
                    />
                )
            }

            {
                showExportModal && (
                    <ExportModal
                        setShowExportModal={setShowExportModal}
                        setResponseRequest={setResponseRequest}
                        filters={filters}
                    />
                )
            }

            {
                isDeleteU && (
                    <div className="delete-user-box-back">
                        <div className="delete-user-box">
                            <div>
                                <button onClick={deleteUserFromData}>Bir dəfəlik sil</button>
                                <button onClick={deleteUser}>Statusunu silinmiş et</button>
                            </div>
                            <button onClick={cancelDelete}>Ləğv et</button>
                        </div>
                    </div>
                )
            }

            {
                showClientOpe && (
                    <ClientOpe
                        item={item}
                        setResponseRequest={setResponseRequest}
                        setShowClientOpe={setShowClientOpe}
                    />
                )
            }

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
