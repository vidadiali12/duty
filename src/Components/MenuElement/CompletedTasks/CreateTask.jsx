import React, { useEffect, useState } from 'react'
import { FiX, FiPlus } from "react-icons/fi";
import api from '../../../api'
import "./CreateTask.css";

const CreateTask = ({ setResponseRequest, setShowCreateTaskArea, departmentList, setUnitList, unitList, setItem, item }) => {

    const [accontTypes, setAccountTypes] = useState([]);
    const [taskTypes, setTaskTypes] = useState([]);
    const [taskTitles, setTaskTitles] = useState([]);
    const [createNewTitle, setCreateNewTitle] = useState(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);

    const [form, setForm] = useState({
        typeId: "",
        title: "",
        note: "",
        count: "",
        departmentId: "",
        unitId: "",
        accountTypeId: ""
    });

    const keyOfFormElements = {
        typeId: "Tapşırıq Tipi",
        title: "Tapşırıq Başlığı",
        note: "Qeyd",
        count: "Tapşırıq sayı",
        departmentId: "İdarə",
        unitId: "Bölmə",
        accountTypeId: "Hesab növü"
    }

    const callHeaders = () => {
        const token = localStorage.getItem("myUserDutyToken");
        if (token) {
            return {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        }
        else {
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Token alınmadı",
            }));
        }
    }

    const loadOders = async () => {
        try {
            const [accTypes, tTypes, tTitles] = await Promise.all([
                api.get("/admin/accountType/getAllAccountType", callHeaders()),
                api.get("/task/type/getTypes", callHeaders()),
                api.get("/task/title/getTitles", callHeaders())
            ])
            setAccountTypes(accTypes?.data?.data || []);
            setTaskTypes(tTypes?.data?.data || []);
            setTaskTitles(tTitles?.data?.data || []);
        } catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Məlumatlar alınmadı",
                message: err?.response?.data?.errorDescription || err
            }));
        }
    }

    const createTask = async () => {
        try {

            for (const [key, value] of Object.entries(form)) {
                if (value === "") {
                    setResponseRequest(prev => ({
                        ...prev,
                        showResponse: true,
                        title: `❌ ${keyOfFormElements[key]} boş qala bilməz`
                    }));
                    return;
                }
            }

            const req = {
                ...form,
                count: Number(form?.count),
                departmentId: Number(form?.departmentId),
                unitId: Number(form?.unitId),
                accountTypeId: Number(form?.accountTypeId)
            }
            if (item) {
                await api.put(
                    `/task/updateTask/${item?.id}`,
                    req,
                    callHeaders()
                );
            }
            else {
                await api.post(
                    "/task/createTask",
                    req,
                    callHeaders()
                );
            }

            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: `✅ Tapşırıq ${item ? 'yeniləndi' : 'yaradıldı'}`
            }));

            setShowCreateTaskArea(false);
            setItem(null);
            window.location.reload();
        } catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: `❌ Tapşırıq ${item ? 'yenilənmədi' : 'yaradılmadı'}`,
                message: err?.response?.data?.errorDescription || err
            }));
        }
    }

    useEffect(() => {
        if (item) {
            console.log(item)
            setForm({
                typeId: item?.type?.id,
                title: item?.title?.title,
                note: item?.note,
                count: Number(item?.count),
                departmentId: item?.department?.id,
                unitId: item?.unit?.id,
                accountTypeId: item?.accountType?.id
            })
        }
        loadOders()
    }, [])


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

            if (form?.departmentId != "") {
                const u = await api.get(`/department/unit/getUnitsByDepartment/${form?.departmentId}`, hdrs);
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
        setForm(prev => ({
            ...prev,
            unitId: ""
        }));

        callUnitByDep();
    }, [form?.departmentId]);

    return (
        <div className="create-task-overlay">
            <div className="create-task-box">

                <div className="create-task-header">
                    <h3>
                        {
                            item ? "Tapşırığın Yenilənməsi" : "Yeni Tapşırıq"
                        }
                    </h3>
                    <FiX className="close-icon" onClick={() => {
                        setShowCreateTaskArea(false);
                        setItem(null);
                    }} />
                </div>

                <div className="create-task-body">

                    <select value={form.typeId}
                        onChange={e => setForm(prev => ({ ...prev, typeId: e.target.value }))}>
                        <option value="">Tapşırıq tipi seç</option>
                        {taskTypes.map(t => (
                            <option key={t.id} value={t.id}>{t.typeName}</option>
                        ))}
                    </select>

                    <div className="title-switch-wrapper">
                        {
                            createNewTitle ?
                                <div className="title-input-box">
                                    <input
                                        className="title-input"
                                        placeholder="Yeni Başlıq Yarat"
                                        value={form.title}
                                        onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                                    />

                                    <button
                                        type="button"
                                        className="title-switch-btn"
                                        onClick={() => setCreateNewTitle(false)}
                                    >
                                        Mövcuddan seç
                                    </button>
                                </div>
                                :
                                <div className="title-select-box">
                                    <select
                                        className="title-select"
                                        value={form.title}
                                        onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                                    >
                                        <option value="">Başlıq seç</option>
                                        {taskTitles.map(t => (
                                            <option key={t.id} value={t.title}>
                                                {t.title}
                                            </option>
                                        ))}
                                    </select>

                                    <button
                                        type="button"
                                        className="title-switch-btn secondary"
                                        onClick={() => setCreateNewTitle(true)}
                                    >
                                        <FiPlus /> Yeni başlıq
                                    </button>
                                </div>
                        }
                    </div>

                    <textarea
                        placeholder="Qeyd"
                        value={form.note}
                        onChange={e => setForm(prev => ({ ...prev, note: e.target.value }))}
                    />

                    <input
                        type="number"
                        placeholder="Say"
                        value={form.count}
                        onChange={e => setForm(prev => ({ ...prev, count: e.target.value }))}
                    />

                    <select
                        value={form.departmentId}
                        onChange={e => setForm(prev => ({ ...prev, departmentId: e.target.value }))}>
                        <option value="">İdarə seç</option>
                        {departmentList.map(d => (
                            <option key={d.id} value={d.id}>{d.tag}</option>
                        ))}
                    </select>

                    <select
                        value={form.unitId}
                        onChange={e => setForm(prev => ({ ...prev, unitId: e.target.value }))}>
                        <option value="">Bölmə seç</option>
                        {unitList.map(u => (
                            <option key={u.id} value={u.id}>{u.tag}</option>
                        ))}
                    </select>

                    <select
                        value={form.accountTypeId}
                        onChange={e => setForm(prev => ({ ...prev, accountTypeId: e.target.value }))}>
                        <option value="">Hesab növü</option>
                        {accontTypes.map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                    </select>

                </div>

                <div className="create-task-footer">
                    <button className="btn-cancel" onClick={() => {
                        setShowCreateTaskArea(false);
                        setItem(null);
                    }}>
                        Ləğv et
                    </button>
                    <button className="btn-submit" onClick={createTask}>
                        {
                            item ? "Yenilə" : "Yarat"
                        }
                    </button>
                </div>

            </div>
        </div>
    )
}

export default CreateTask