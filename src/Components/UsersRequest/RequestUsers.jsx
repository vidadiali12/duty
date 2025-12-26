import { useEffect, useState } from "react"
import api from "../../api";
import Pagination from "../Pagination/Pagination";
import './RequestUsers.css'
import CreateAndUpdateAcc from "../MenuElement/CreateAndUpdateAcc";

const RequestUsers = ({ setResponseRequest, userInfo, setItem, item, connectNow, permissionIdsList }) => {

    if (!(permissionIdsList && permissionIdsList?.includes(24))) {
        return <p style={{ color: "red", marginTop: '20px', paddingLeft: '10px' }}>Bu səhifəyə giriş icazəniz yoxdur.</p>;
    }

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [allUsersRequest, setAllUsersRequest] = useState(null);
    const [totalItem, setTotalItem] = useState(null);
    const [totalPages, setTotalPages] = useState(null);

    const [searchByDocNo, setSearchByDocNo] = useState("");
    const [rankList, setRankList] = useState([]);
    const [departmentList, setDepartmentList] = useState([]);
    const [unitList, setUnitList] = useState([]);
    const [accTypeList, setAccTypeList] = useState([]);
    const [accStatusList, setAccStatusList] = useState([]);
    const [createAndUpdate, setCreateAndUpdate] = useState(null);
    const [typeOpe, setTypeOpe] = useState("");
    const [apiOpe, setApiOpe] = useState("");
    const [isFromESD] = useState("fromESD")

    const loadFilterData = async (detailsData, formElement, toAll) => {
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


            if (formElement?.eventId == 2) {
                console.log(detailsData)
                setCreateAndUpdate(true);
                setApiOpe("/admin/client/createClient");
                setTypeOpe("createAcc");
                const postedItem = { ...detailsData, statusId: detailsData?.serialNumber == "" ? 1 : 3 }
                setItem(postedItem)
            }
            else if (formElement?.eventId == 3) {
                try {
                    const userDetails = await api.post('/admin/client/getClientDetailsV2', {
                        accountTypeId: detailsData?.accountTypeId,
                        username: detailsData?.username
                    }, hdrs)

                    const resDetailsData = userDetails?.data?.data

                    const dataOfDevice = {
                        mark: detailsData?.mark || "",
                        capacity: detailsData?.capacity || "",
                        serialNumber: detailsData?.serialNumber || ""
                    }
                    const req = {
                        fin: detailsData?.fin,
                        name: detailsData?.name,
                        surname: detailsData?.surname,
                        fatherName: detailsData?.fatherName,
                        rankId: detailsData?.rankId,
                        departmentId: detailsData?.departmentId,
                        unitId: detailsData?.unitId,
                        position: detailsData?.position,
                        phoneNumber: detailsData?.phoneNumber,
                        note: resDetailsData?.note,
                        isRegistered: resDetailsData?.registered,
                        accountTypeId: detailsData?.accountTypeId,
                        statusId: resDetailsData?.accountStatus?.id,
                        username: detailsData?.username,
                        password: resDetailsData?.password,
                        deviceData: dataOfDevice || null,
                        documentNo: detailsData?.documentNo || null,
                        formId: formElement?.formId || null
                    }
                    if (toAll === "approvedAll") {
                        try {
                            await api.put(`/admin/client/updateClient/${resDetailsData?.id}`, req, hdrs);
                            window.location.reload()
                        } catch (err) {
                            console.log(err)
                        }
                    }
                    else {
                        setItem(req);
                        setCreateAndUpdate(true)
                        setApiOpe(`/admin/client/updateClient/${resDetailsData?.id}`);
                        setTypeOpe("editAcc");
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
            else if (formElement?.eventId == 4) {
                try {
                    const userDetails = await api.post('/admin/client/getClientDetailsV2', {
                        accountTypeId: detailsData?.accountTypeId,
                        username: detailsData?.username
                    }, hdrs)

                    const resDetailsData = userDetails?.data?.data

                    const req = {
                        fin: resDetailsData?.person?.fin,
                        name: resDetailsData?.person?.name,
                        surname: resDetailsData?.person?.surname,
                        fatherName: resDetailsData?.person?.fatherName,
                        rankId: resDetailsData?.person?.rank?.id,
                        departmentId: resDetailsData?.person?.department?.id,
                        unitId: resDetailsData?.person?.unit?.id,
                        position: resDetailsData?.person?.position,
                        phoneNumber: resDetailsData?.phoneNumber,
                        note: resDetailsData?.note,
                        isRegistered: resDetailsData?.registered,
                        accountTypeId: resDetailsData?.accountType?.id,
                        statusId: 5,
                        username: resDetailsData?.username,
                        password: resDetailsData?.password,
                        deviceData: resDetailsData?.device || null,
                        documentNo: detailsData?.documentNo || null,
                        formId: formElement?.formId || null
                    }

                    if (toAll === "approvedAll") {
                        try {
                            await api.put(`/admin/client/updateClient/${resDetailsData?.id}`, req, hdrs);
                            window.location.reload()
                        } catch (err) {
                            setResponseRequest(prev => ({
                                ...prev,
                                showResponse: true,
                                title: "❌ Məlumatlar alınarkən xəta baş verdi",
                                message: err?.response?.data?.errorDescription || err,
                            }));
                        }
                    }

                    else {
                        if (resDetailsData?.accountStatus?.id != 5) {
                            setResponseRequest(prev => (
                                {
                                    ...prev,
                                    isQuestion: true,
                                    showResponse: true,
                                    title: `${detailsData?.name} ${detailsData?.surname} adlı istifadəçini silməyə əminsiniz?`,
                                    type: "deleteAccSoft",
                                    api: `/admin/client/updateClient/${resDetailsData?.id}`,
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
                                    title: `${detailsData?.name} ${detailsData?.surname} adlı istifadəçinin statusu artıq "silinmiş" kimi qeyd olunub`
                                }
                            ))
                        }
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
        } catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Məlumatlar alınarkən xəta baş verdi",
                message: err?.response?.data?.errorDescription || err,
            }));
        }
    };

    const allRequest = async () => {
        try {
            const token = localStorage.getItem("myUserDutyToken");
            if (!token) throw new Error("❌ Token tapılmadı");

            const hdrs = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            const res = await api.get(
                '/form/getAllSentForm',
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
            console.log(res?.data?.data)
            setAllUsersRequest(res?.data?.data || []);
        } catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Məlumatlar alınarkən xəta baş verdi",
                message: err?.response?.data?.errorDescription || err,
            }));
        }
    }

    const callClientDetails = async (formElement, toAll) => {
        const token = localStorage.getItem("myUserDutyToken");
        if (!token) throw new Error("❌ Token tapılmadı");

        const hdrs = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };

        try {
            const res = await api.get(
                `/form/getFormDetails/${formElement?.formId}`, hdrs
            );
            const resData = res?.data?.data;
            loadFilterData({ ...resData, formId: formElement?.formId }, formElement, toAll);
        } catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Məlumatlar alınarkən xəta baş verdi",
                message: err?.response?.data?.errorDescription || err,
            }));
        }
    }

    useEffect(() => {
        setItem(null)
        allRequest();
    }, [page]);

    const deleteFromForm = (formElement) => {
        setResponseRequest(
            {
                isQuestion: true,
                showResponse: true,
                title: `${formElement?.name} ${formElement?.surname} adlı istifadəçini silməyə əminsiniz?`,
                type: "deleteFromForm",
                api: `/form/deleteForm/${formElement?.formId}`
            }
        )
    }

    const deleteDoc = (doc) => {
        setResponseRequest(
            {
                isQuestion: true,
                showResponse: true,
                title: `Bu sənədi silməyə əminsiniz?`,
                type: "deleteDoc",
                api: `/form/deleteFormList/${doc?.documentId}`
            }
        )
    }

    const searchDocumentByNo = async () => {
        try {
            const token = localStorage.getItem("myUserDutyToken");
            if (!token) throw new Error("❌ Token tapılmadı");

            const hdrs = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            if (searchByDocNo.trim() != "") {
                const resResultOfSerch = await api.post(`/form/searchForm`, {
                    documentNo: searchByDocNo.trim(),
                },
                    {
                        ...hdrs,
                        params: {
                            page,
                            pageSize,
                        }
                    }
                );
                const newData = resResultOfSerch?.data?.data;
                setAllUsersRequest(newData);
                setTotalItem(newData?.data?.totalItem || null);
                setTotalPages(newData?.data?.totalPages || null);
            }
            else {
                allRequest();
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


    const approvedAll = (req) => {
        console.log(req);
        req?.forms.forEach((form) => {
            callClientDetails(form, "approvedAll")
        })
    }

    useEffect(() => {
        searchDocumentByNo();
        setPage(1)
    }, [searchByDocNo])


    const countOfApproveds = (req) => {
        let c = 0;
        req.forms.forEach((r) => {
            if (r.formStatusId == 2) {
                c++;
            }
        })

        if (c == req.forms.length) {
            return false
        }
        else {
            return true
        }
    }

    return (
        <div className="request-users-container">

            <div className="request-header">
                <h2 className="request-title">Göndərilmiş Formlar</h2>
                <div className="request-select-box">
                    <label htmlFor="">
                        <input type="search"
                            placeholder="Sənəd nömrəsi ilə axtar..."
                            value={searchByDocNo}
                            onChange={(e) => setSearchByDocNo(e.target.value)} />
                    </label>
                </div>
            </div>

            <div className="request-list">
                {
                    allUsersRequest?.length > 0 ? (
                        allUsersRequest?.map((req) => (
                            <div className="request-card" key={req?.documentNo}>

                                <div className="req-left">
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <span className="req-docNo">№ {req.documentNo}</span>
                                        <span className={`req-type event-type
                                    ${req?.forms[0]?.eventId == 2 ? "insert-event-type" :
                                                req?.forms[0]?.eventId == 3 ? "update-event-type" :
                                                    req?.forms[0]?.eventId == 4 ? "delete-event-type" : ""}`}>
                                            {req?.forms[0]?.eventId == 2 ? "İstifadəçi yaradılması" :
                                                req?.forms[0]?.eventId == 3 ? "İstifadəçi məlumatlarının dəyişdirilməsi" :
                                                    req?.forms[0]?.eventId == 4 ? "İstifadəçinin silinməsi" : ""}
                                        </span>
                                    </div>
                                    <span className="req-type">{req.accountType}</span>
                                    <span className="req-date">{req.formDate?.split("T")[0]} {req.formDate?.split("T")[1]?.slice(0, 8)}</span>
                                    <span className="ope-btns-design delete-event-type"
                                        style={{ marginTop: '5px' }}
                                        onClick={() => deleteDoc(req)}>Sənədi sil</span>
                                </div>

                                <div className="req-users-list">
                                    <div className="req-user-table">

                                        <div className="req-user-header"
                                            style={{ gridTemplateColumns: req?.forms[0]?.eventId == 4 ? '30px 160px 130px 300px' : '30px 120px 150px 150px 150px 130px 300px' }}>
                                            <span>#</span>
                                            {
                                                req?.forms[0]?.eventId == 4 ?
                                                    <span className="col-name">İstifadəçi adı</span> :
                                                    <>
                                                        <span className="col-rank">Rütbə</span>
                                                        <span className="col-name">Ad</span>
                                                        <span className="col-surname">Soyad</span>
                                                        <span className="col-father">Ata adı</span>
                                                    </>
                                            }
                                            <span className="col-status">Status</span>
                                            <span className="col-operation">
                                                Əməliyyatlar
                                                {
                                                    req?.forms[0]?.eventId != 2 && countOfApproveds(req) && (
                                                        <span className="approved-all" onClick={() => approvedAll(req)}>
                                                            Bir dəfəyə təsdiq et
                                                        </span>
                                                    )
                                                }
                                            </span>
                                        </div>

                                        {req?.forms?.map((form, countOfForm) => (
                                            <div className="req-user-row" key={form.formId}
                                                style={{ gridTemplateColumns: form?.eventId == 4 ? '30px 160px 130px 300px' : '30px 120px 150px 150px 150px 130px 300px' }}>
                                                <span>{countOfForm + 1}</span>
                                                {
                                                    form?.eventId == 4 ?
                                                        <span className="col-name">{form.username}</span> :
                                                        <>
                                                            <span className="col-rank">{form.rank}</span>
                                                            <span className="col-name">{form.name}</span>
                                                            <span className="col-surname">{form.surname}</span>
                                                            <span className="col-father">{form.fatherName}</span>
                                                        </>
                                                }
                                                <span
                                                    className={
                                                        form?.formStatusId == 3
                                                            ? "status pending"
                                                            : form.formStatusId == 2
                                                                ? "status approved"
                                                                : "status rejected"
                                                    }
                                                >
                                                    {form.formStatusId == 3
                                                        ? "Gözləmədə"
                                                        : form.formStatusId == 2
                                                            ? "Təsdiqlənib"
                                                            : "İmtina edilib"}
                                                </span>
                                                <span className="col-operation">
                                                    {
                                                        form.formStatusId != 2 && (
                                                            <span onClick={() => callClientDetails(form, "onlyOne")}
                                                                className={` ope-btns-design
                                                                    ${form?.eventId == 2 ? "insert-event-type" :
                                                                        form?.eventId == 3 ? "update-event-type" :
                                                                            form?.eventId == 4 ? "delete-event-type" : ""}
                                                                            `}>
                                                                Təsdiq et
                                                            </span>
                                                        )
                                                    }
                                                    <span className="ope-btns-design delete-event-type" onClick={() => deleteFromForm(form)}>
                                                        Formdan sil
                                                    </span>
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        ))
                    ) : (
                        <div className="no-data">Məlumat tapılmadı...</div>
                    )}
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
        </div>
    );
}

export default RequestUsers