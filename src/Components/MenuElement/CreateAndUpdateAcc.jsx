import React, { useEffect, useState } from "react";
import api from "../../api";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./CreateAndUpdateAcc.css";

const CreateAndUpdateAcc = ({
    setApiOpe,
    apiOpe,
    setTypeOpe,
    typeOpe,
    setCreateAndUpdate,
    setResponseRequest,
    rankList,
    departmentList,
    unitList,
    accTypeList,
    accStatusList,
    setItem,
    item,
    isFromESD
}) => {
    const [form, setForm] = useState({
        fin: "",
        name: "",
        surname: "",
        fatherName: "",
        rankId: "",
        departmentId: "",
        unitId: "",
        position: "",
        phoneNumber: "",
        note: "",
        isRegistered: false,
        accountTypeId: "",
        statusId: "",
        username: "",
        password: "",
        deviceData: {
            mark: "",
            serialNumber: "",
            capacity: ""
        },
        documentNo: "",
        formId: ""
    });

    const requiredFields = {
        reqName: "name",
        reqSurname: "surname",
        reqFatherName: "fatherName",
        reqUsername: "username",
        reqPassword: "password",
        reqRank: "rankId",
        reqPosition: "position",
        reqPhone: "phoneNumber",
        reqDepartment: "departmentId",
        reqUnit: "unitId",
        reqNote: "note",
        reqFin: "fin",
        reqSerialNumber: "serialNumber",
        reqMark: "mark",
        reqCapacity: "capacity",
        reqStatus: "statusId"
    };

    const [showPassword, setShowPassword] = useState(true);
    const [accTypesDatail, setAccTypesDetail] = useState(null);
    const [unitArr, setUnitArr] = useState(unitList);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [errors, setErrors] = useState({});
    const [valueOfCapacity, setValueOfCapacity] = useState(null);

    const validateForm = () => {
        let newErrors = {};

        if (!form.accountTypeId) {
            newErrors.accountTypeId = "Hesab tipi seçilməlidir";
        }
        if (!form.statusId) {
            newErrors.statusId = "Status seçilməlidir";
        }

        if (accTypesDatail?.device) {
            if (!valueOfCapacity) {
                newErrors.capacity = "Tutum vahidi seçilməlidir";
            }
        }

        Object.entries(requiredFields).forEach(([reqKey, fieldName]) => {
            if (accTypesDatail && accTypesDatail[reqKey]) {
                let value;

                if (["mark", "serialNumber", "capacity"].includes(fieldName)) {
                    value = form.deviceData[fieldName];
                } else {
                    value = form[fieldName];
                }

                if (!value || value.toString().trim() === "") {
                    newErrors[fieldName] = "Bu sahə boş ola bilməz";
                }

                if (fieldName === "password") {
                    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;

                    if (!passwordRegex.test(value)) {
                        newErrors[fieldName] = "Şifrə ən az 8 simvol, böyük hərf, kiçik hərf və xüsusi simvol içerməlidir";
                    }
                }
            }
        });

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };


    const passView = () => {
        setShowPassword(!showPassword)
    }

    const onChange = (e, typ) => {
        if (typ === "dep") {
            setForm({
                ...form,
                departmentId: e.target.value,
                unitId: ""
            });
            setUnitArr([]);
            callUnitByDep(e.target.value);
        }
        else if (typ === "accType") {
            setForm({ ...form, [e.target.name]: e.target.value });
            callAccTypeDetails(e.target.value);
        }
        else {
            setForm({ ...form, [e.target.name]: e.target.value });
        }
    };

    const onDeviceChange = (e) => {
        setForm({
            ...form,
            deviceData: {
                ...form.deviceData,
                [e.target.name]: e.target.value
            }
        });
    };

    const chooseCapacityValue = (e) => {
        const oldValue = form?.deviceData?.capacity || "";
        const numericOld = oldValue.replace(/\D/g, "");
        const numericNew = e.target.value;
        const finalValue = numericOld + numericNew;

        setForm({
            ...form,
            deviceData: {
                ...form.deviceData,
                capacity: finalValue
            }
        });

        setValueOfCapacity(e.target.value)
    };


    const onCheck = (e) => {
        setForm({ ...form, isRegistered: e.target.checked });
    };

    const submitForm = async () => {

        if (!validateForm()) {
            return;
        }

        const token = localStorage.getItem("myUserDutyToken");

        const hdrs = {
            headers: { Authorization: `Bearer ${token}` }
        };

        const req = {
            ...form,
            rankId: Number(form.rankId),
            departmentId: Number(form.departmentId),
            unitId: Number(form.unitId),
            accountTypeId: Number(form.accountTypeId),
            statusId: Number(form.statusId),
            formId: Number(form.formId)
        };

        try {
            if (typeOpe === "createAcc") {
                await api.post(apiOpe, req, hdrs);
            } else {
                await api.put(apiOpe, req, hdrs);
            }
            setCreateAndUpdate(null);
            setApiOpe("");
            setTypeOpe("");
            setItem(null);
            window.location.reload();
        } catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Məlumatlar alınarkən xəta baş verdi",
                message: err?.response?.data?.errorDescription || err,
            }));
        }
    };

    const closeModal = () => {
        setCreateAndUpdate(null);
        setApiOpe("");
        setTypeOpe("");
        setItem(null);
    }

    const callAccTypeDetails = async (id) => {
        const token = localStorage.getItem('myUserDutyToken');
        if (!token) return;

        const hdrs = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        try {
            const clientData = await api.get(`/admin/accountType/getAccountType/${id}`, hdrs)
            setAccTypesDetail(clientData?.data?.data)
        } catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Məlumatlar alınarkən xəta baş verdi",
                message: err?.response?.data?.errorDescription || err,
            }));
        }
    }

    const callUnitByDep = async (id) => {
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

            if (id) {
                const res = await api.get(`/department/unit/getUnitsByDepartment/${id}`, hdrs);
                setUnitArr(res?.data?.data || []);
            } else {
                const res = await api.get('/department/unit/getAllUnit', hdrsDep);
                setUnitArr(res?.data?.data?.data || []);
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
        if (item) {
            callAccTypeDetails(item?.accountTypeId);
            callUnitByDep(item?.departmentId);
            if (isFromESD === "fromESD") {
                const { mark, serialNumber, capacity, ...rest } = item;
                setForm({
                    ...rest,
                    unitId: item?.unitId,
                    deviceData: {
                        mark,
                        serialNumber,
                        capacity
                    }
                });
                setValueOfCapacity(capacity.slice(capacity.length - 2));
            }
            else {
                setForm({
                    ...item,
                    unitId: item?.unitId
                });
                const cap = item?.deviceData?.capacity;
                if (cap) {
                    setValueOfCapacity(cap.slice(cap.length - 2));
                }
            }
        }
    }, []);


    return (
        <div className="acc-form-container-back">
            <div className="acc-form-container">

                <h2 className="form-title">
                    {typeOpe === "createAcc" ? "Hesab Yarat" : "Hesabı Yenilə"}
                </h2>

                <div className="acc-form">

                    <div className="input-boxes">
                        <div className={`form-group ${errors.name ? "error" : ""}`}>
                            <label>Ad</label>
                            <input
                                value={form?.name}
                                name="name"
                                placeholder="Ad: "
                                onChange={(e) => onChange(e, "name")} />
                            {errors.name && <span className="error-text">{errors.name}</span>}
                        </div>

                        <div className={`form-group ${errors.surname ? "error" : ""}`}>
                            <label>Soyad</label>
                            <input
                                value={form?.surname}
                                name="surname"
                                placeholder="Soyad: "
                                onChange={(e) => onChange(e, "surname")} />
                            {errors.surname && <span className="error-text">{errors.surname}</span>}
                        </div>

                        <div className={`form-group ${errors.fatherName ? "error" : ""}`}>
                            <label>Ata adı</label>
                            <input
                                value={form?.fatherName}
                                name="fatherName"
                                placeholder="Ata adı: "
                                onChange={(e) => onChange(e, "fatherName")} />
                            {errors.fatherName && <span className="error-text">{errors.fatherName}</span>}
                        </div>


                        <div className={`form-group ${errors.position ? "error" : ""}`}>
                            <label>Vəzifə</label>
                            <input
                                value={form?.position}
                                name="position"
                                placeholder="Vəzifə: "
                                onChange={(e) => onChange(e, "position")} />
                            {errors.position && <span className="error-text">{errors.position}</span>}
                        </div>

                        <div className={`form-group ${errors.phoneNumber ? "error" : ""}`}>
                            <label>Telefon</label>
                            <input
                                value={form?.phoneNumber}
                                name="phoneNumber"
                                placeholder="+9945005050"
                                onChange={(e) => onChange(e, "phoneNumber")} />
                            {errors.phoneNumber && <span className="error-text">{errors.phoneNumber}</span>}
                        </div>

                        <div className={`form-group ${errors.username ? "error" : ""}`}>
                            <label>İstifadəçi adı</label>
                            <input
                                value={form?.username}
                                name="username"
                                placeholder="İstifadəçi adı: "
                                onChange={(e) => onChange(e, "usernme")} />
                            {errors.username && <span className="error-text">{errors.username}</span>}
                        </div>

                        <div className={`form-group ${errors.fin ? "error" : ""}`}>
                            <label>FIN</label>
                            <input
                                value={form?.fin}
                                name="fin"
                                placeholder="Fin: "
                                onChange={(e) => onChange(e, "fin")} />
                            {errors.fin && <span className="error-text">{errors.fin}</span>}
                        </div>

                        <div className={`form-group ${errors.password ? "error" : ""}`}>
                            <label>Parol</label>
                            <input
                                value={form?.password}
                                name="password"
                                placeholder="Parol: "
                                onChange={(e) => onChange(e, "password")}
                                type={showPassword ? "password" : "text"} />
                            {
                                showPassword ? <FiEye className="pass-on-off" onClick={passView} />
                                    : <FiEyeOff className="pass-on-off" onClick={passView} />
                            }
                            {errors.password && <span className="error-text">{errors.password}</span>}
                        </div>
                    </div>

                    <div className="select-boxes">
                        <div className={`form-group ${errors.rankId ? "error" : ""}`}>
                            <label>Rütbə</label>
                            <select name="rankId" value={form?.rankId} onChange={(e) => onChange(e, "rankId")}>
                                <option value="">Seç</option>
                                {rankList?.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                            {errors.rankId && <span className="error-text">{errors.rankId}</span>}
                        </div>

                        <div className={`form-group ${errors.departmentId ? "error" : ""}`}>
                            <label>İdarə</label>
                            <select name="departmentId" value={form?.departmentId} onChange={(e) => onChange(e, "dep")}>
                                <option value="">Seç</option>
                                {departmentList?.map(d => (
                                    <option key={d.id} value={d.id}>{d.tag}</option>
                                ))}
                            </select>
                            {errors.departmentId && <span className="error-text">{errors.departmentId}</span>}
                        </div>

                        <div className={`form-group ${errors.unitId ? "error" : ""}`}>
                            <label>Bölmə</label>
                            <select name="unitId" value={form?.unitId} onChange={(e) => onChange(e, "unit")}>
                                <option value="">Seç</option>
                                {unitArr?.map(u => (
                                    <option key={u.id} value={u.id}>{u.tag}</option>
                                ))}
                            </select>
                            {errors.unitId && <span className="error-text">{errors.unitId}</span>}
                        </div>

                        <div className={`form-group ${errors.accountTypeId ? "error" : ""}`}>
                            <label>Hesab Tipi</label>
                            <select name="accountTypeId" value={form?.accountTypeId} onChange={(e) => onChange(e, "accType")}>
                                <option value="">Seç</option>
                                {accTypeList?.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                            {errors.accountTypeId && <span className="error-text">{errors.accountTypeId}</span>}
                        </div>

                        <div className={`form-group ${errors.statusId ? "error" : ""}`}>
                            <label>Status</label>
                            <select name="statusId" value={form?.statusId} onChange={(e) => onChange(e, "status")}>
                                <option value="">Seç</option>
                                {accStatusList?.map(r => (
                                    accTypesDatail?.device && r.status.toLowerCase() == "confidential" ?
                                        (
                                            <option key={r.id} value={r.id}>
                                                Məxfi
                                            </option>
                                        )
                                        :
                                        accTypesDatail?.device && r.status.toLowerCase() == "unconfidential" ?
                                            (
                                                <option key={r.id} value={r.id}>
                                                    Qeyri Məxfi
                                                </option>
                                            ) :
                                            !accTypesDatail?.device && r.status.toLowerCase() == "active" ?
                                                (
                                                    <option key={r.id} value={r.id}>
                                                        Aktiv
                                                    </option>
                                                ) :
                                                !accTypesDatail?.device && r.status.toLowerCase() == "deactive" ?
                                                    (
                                                        <option key={r.id} value={r.id}>
                                                            Deaktiv
                                                        </option>
                                                    ) : r.status.toLowerCase() == "deleted" ?
                                                        (
                                                            <option key={r.id} value={r.id}>
                                                                Silinmiş
                                                            </option>
                                                        ) : null

                                ))}
                            </select>

                            {errors.statusId && <span className="error-text">{errors.statusId}</span>}
                        </div>

                    </div>


                    {
                        accTypesDatail?.device && (
                            <div className="for-device">
                                <h3 className="section-title">Qurğu Məlumatları</h3>
                                <div className="devices-box">
                                    <div className={`form-group ${errors.mark ? "error" : ""}`}>
                                        <label>Marka</label>
                                        <input
                                            value={form?.deviceData?.mark}
                                            name="mark"
                                            placeholder="Cihazın Markası: "
                                            onChange={onDeviceChange} />
                                        {errors.mark && <span className="error-text">{errors?.mark}</span>}
                                    </div>

                                    <div className={`form-group ${errors.serialNumber ? "error" : ""}`}>
                                        <label>Unikal Nömrəsi</label>
                                        <input
                                            value={form?.deviceData?.serialNumber}
                                            name="serialNumber"
                                            placeholder="Cihazın Unikal Nömrəsi: "
                                            onChange={onDeviceChange} />
                                        {errors.serialNumber && <span className="error-text">{errors.serialNumber}</span>}
                                    </div>

                                    <div className={`form-group ${errors.capacity ? "error" : ""} `}>
                                        <label>Tutum</label>
                                        <div className="form-group-capacity">
                                            <input
                                                value={form?.deviceData?.capacity?.replace(/\D/g, "")}
                                                name="capacity"
                                                placeholder="Cihazın Tutumu: "
                                                onChange={onDeviceChange}
                                                type="number" />

                                            <select name="" id=""
                                                value={form?.deviceData?.capacity?.slice(form?.deviceData?.capacity?.length - 2, form?.deviceData?.capacity?.length) || ""}
                                                onChange={chooseCapacityValue}>
                                                <option value="">Seç</option>
                                                <option value="KB">KB</option>
                                                <option value="MB">MB</option>
                                                <option value="GB">GB</option>
                                            </select>
                                        </div>
                                        {errors.capacity && <span className="error-text">{errors.capacity}</span>}
                                    </div>
                                </div>
                            </div>
                        )
                    }


                    {
                        typeOpe == "editAcc" && form?.documentNo && (
                            <div className={`form-group`}>
                                <label>Sənəd nömrəsi</label>
                                <span className="input-span">{form?.documentNo}</span>
                            </div>
                        )
                    }

                    <div className={`form-group ${errors.note ? "error" : ""}`}>
                        <label>Qeyd</label>
                        <textarea
                            value={form?.note}
                            name="note"
                            onChange={(e) =>
                                onChange(e, "note")}
                            placeholder="Qeyd: "></textarea>
                        {errors.note && <span className="error-text">{errors.note}</span>}
                    </div>

                    <div className="form-group checkbox-group">
                        <label style={{ marginTop: '4px' }}>Qeydiyyatdan keçib?</label>
                        <input
                            type="checkbox"
                            checked={form.isRegistered}
                            onChange={onCheck} />
                    </div>

                </div>

                <div className="btns-box">
                    <button className="submit-btn" onClick={submitForm}>
                        {typeOpe === "createAcc" ? "Yarat" : "Yenilə"}
                    </button>

                    <button className="submit-btn" onClick={closeModal}>
                        Bağla
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CreateAndUpdateAcc;
