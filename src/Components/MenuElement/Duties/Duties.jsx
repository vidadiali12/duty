import React, { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { FiChevronDown } from "react-icons/fi";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import "../Accounts.css"
import "./Duties.css"
import api from '../../../api';
import UpdateAndAddPersonnel from './UpdateAndAddPersonnel';
import Pagination from '../../Pagination/Pagination';
import ChangePassword from './ChangePassword';
import CreateAdminAccount from './CreateAdminAccount';

export default function Duties({ setResponseRequest, userInfo, setItem, item }) {
    const [allAccounts, setAllAccounts] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [activeFilter, setActiveFilter] = useState(null);
    const [createAndUpdate, setCreateAndUpdate] = useState(null)
    const [typeOpe, setTypeOpe] = useState("");
    const [apiOpe, setApiOpe] = useState("");
    const [rankList, setRankList] = useState([]);
    const [totalItem, setTotalItem] = useState(null);
    const [totalPages, setTotalPages] = useState(null);
    const [showCPArea, setShowCPArea] = useState(null);
    const [showCreate, setShowCreate] = useState(null);

    const [filters, setFilters] = useState({
        text: "",
        ranks: []
    });

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
                searchText: filters.text,
                rankIds: filters.ranks,
                newToOld: true
            };

            const res = await api.post(
                '/admin/personnel/getAllPersonnel',
                req,
                {
                    ...hdrs,
                    params: {
                        page,
                        pageSize,
                    }
                }
            );

            const resData = res?.data?.data || [];
            setTotalItem(res?.data?.totalItem || null);
            setTotalPages(res?.data?.totalPages || null);
            setAllAccounts(resData?.filter(p => p?.id !== JSON.parse(localStorage.getItem("userInfo"))?.id));
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

        if (!token) return;

        try {
            const r = await api.get('/rank/getAllRank', hdrs);
            setRankList(r?.data?.data || []);
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
            ranks: []
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

    useEffect(() => {
        callAccounts();
    }, [filters, page]);

    useEffect(() => {
        setPage(1)
    }, [filters]);

    const deleteUser = async (acc) => {
        console.log(acc)
        setResponseRequest(prev => (
            {
                ...prev,
                isQuestion: true,
                showResponse: true,
                title: `${acc?.name} ${acc?.surname} adlı istifadəçini silməyə əminsiniz?`,
                type: "deletePersonnel",
                api: `/admin/personnel/deletePersonnel/${acc?.id}`
            }
        ))
    }

    const editUser = async (acc) => {
        try {
            const token = localStorage.getItem('myUserDutyToken');
            const hdrs = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            const personnel = await api.get(`/admin/personnel/getPersonnelDetails/${acc?.id}`, hdrs)
            const personnelData = personnel?.data?.data;

            console.log(personnelData)
            setItem(personnelData);
            setCreateAndUpdate(true)
            setApiOpe(`/admin/personnel/updatePersonnel/${acc?.id}`);
            setTypeOpe("editOpe");
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
        setApiOpe("/admin/personnel/createPersonnel");
        setTypeOpe("createOpe");
    }

    const createAccAdmin = () => {
        setShowCreate(true)
    }

    const changePass = (acc) => {
        setShowCPArea(true);
        setItem(acc);
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
                    <span className="filter-label clear-filter" onClick={clearFilter}>
                        Filteri Sıfırla
                    </span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
                <button className="add-account-btn" onClick={createAcc}>
                    <FaPlus /> Yeni İstifadəçi
                </button>

                <button className="add-account-btn" onClick={createAccAdmin}>
                    <FaPlus /> Admin İstifadəçi
                </button>
            </div>

            <div className="accounts-table w-full">
                <div className="table-header">
                    <span>#</span>
                    <span>Ad</span>
                    <span>Soyad</span>
                    <span>Ata adı</span>
                    <span>Rütbə</span>
                    <span>Vəzifə</span>
                    <span>Parol</span>
                    <span style={{ textAlign: 'center' }}>Əməliyyatlar</span>
                </div>

                {allAccounts.map((acc, index) => (
                    <div className="table-row table-duties-row" key={acc?.id}>
                        <span>{pageSize * (page - 1) + index + 1}</span>
                        <span>{acc?.name}</span>
                        <span>{acc?.surname}</span>
                        <span>{acc?.fatherName}</span>
                        <span>{acc?.rank?.name}</span>
                        <span>{acc?.position}</span>
                        <span onClick={() => changePass(acc)}>Parolu Sıfırla</span>
                        <span className='ope-box'>
                            <AiOutlineEdit className='ope-icon' onClick={() => editUser(acc)} />
                            <AiOutlineDelete className='ope-icon' onClick={() => deleteUser(acc)}
                            />
                        </span>
                    </div>
                ))}
            </div>

            {
                createAndUpdate && (
                    <UpdateAndAddPersonnel
                        item={item}
                        setItem={setItem}
                        ranks={rankList}
                        setCreateAndUpdate={setCreateAndUpdate}
                        apiOpe={apiOpe}
                        typeOpe={typeOpe}
                        setResponseRequest={setResponseRequest}
                    />
                )
            }
            {
                showCPArea && (
                    <ChangePassword setItem={setItem} item={item} setResponseRequest={setResponseRequest} setShowCPArea={setShowCPArea} />
                )
            }

            {
                showCreate && (
                    <CreateAdminAccount setShowCreate={setShowCreate} />
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
