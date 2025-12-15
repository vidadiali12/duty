import { useEffect, useState } from "react"
import api from "../../api";
import Pagination from "../Pagination/Pagination";
import './RequestUsers.css'
import CreateAndUpdateAcc from "../MenuElement/CreateAndUpdateAcc";

const RequestUsers = ({ setResponseRequest, userInfo, setItem, item, connectNow }) => {

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [allUsersRequest, setAllUsersRequest] = useState(null);
    const [totalItem, setTotalItem] = useState(null);

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

    const loadFilterData = async (detailsData, formElement) => {
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
                setCreateAndUpdate(true);
                setApiOpe("/admin/client/createClient");
                setTypeOpe("createAcc");
            }
            else if (formElement?.eventId == 3) {
                try {
                    const userDetails = await api.post('/admin/client/getClientDetailsV2', {
                        accountTypeId: detailsData?.accountTypeId,
                        username: detailsData?.username
                    }, hdrs)

                    const resDetailsData = userDetails?.data?.data

                    setItem({
                        ...detailsData,
                        formId: formElement?.formId,
                        note: resDetailsData?.note,
                        isRegistered: resDetailsData?.registered,
                        password: resDetailsData?.password
                    });
                    setCreateAndUpdate(true)
                    setApiOpe(`/admin/client/updateClient/${resDetailsData?.id}`);
                    setTypeOpe("editAcc");
                } catch (err) {

                }
            }
            else if (formElement?.eventId == 4) {
                try {
                    const userDetails = await api.post('/admin/client/getClientDetailsV2', {
                        accountTypeId: detailsData?.accountTypeId,
                        username: detailsData?.username
                    }, hdrs)

                    const resDetailsData = userDetails?.data?.data

                    try {
                        const client = await api.get(`/admin/client/getClientDetails/${resDetailsData?.id}`, hdrs)
                        const clientData = client?.data?.data;

                        const req = {
                            ...detailsData,
                            note: clientData?.note,
                            isRegistered: clientData?.registered,
                            statusId: 5,
                            password: clientData?.password,
                            formId: formElement?.formId || null
                        }

                        if (clientData?.accountStatus?.id != 5) {
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
                    } catch (err) {

                    }
                } catch (err) {

                }
            }
        } catch (err) {
            console.log(err);
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

            setTotalItem(res?.data?.totalItem)
            setAllUsersRequest(res?.data?.data || []);
        } catch (err) {

        }
    }

    const callClientDetails = async (formElement) => {
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
            const resData = res?.data?.data
            setItem({ ...resData, formId: formElement?.formId });
            loadFilterData({ ...resData, formId: formElement?.formId }, formElement);
        } catch (err) {

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
        console.log(doc)
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
            if (searchByDocNo.trim() != "") {
                const resResultOfSerch = await api.get(`/form/searchForm/${searchByDocNo}`)
                const newData = resResultOfSerch?.data?.data;
                setAllUsersRequest(newData);
            }
            else {
                allRequest();
            }
        } catch (err) {

        }
    }

    useEffect(() => {
        searchDocumentByNo()
    }, [searchByDocNo])

    return (
        <div className="request-users-container">

            <div className="request-header">
                <h2 className="request-title">Göndərilmiş Formlar</h2>
                <div className="request-select-box">
                    <select
                        className="request-select"
                        value={searchByDocNo}
                        onChange={(e) => setSearchByDocNo(e.target.value)}
                    >
                        <option value="">Sənəd nömrəsinə görə axtar</option>
                        {allUsersRequest?.map(doc => (
                            <option key={doc.documentId} value={doc.documentNo}>
                                {doc.documentNo}
                            </option>
                        ))}
                    </select>
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

                                        <div className="req-user-header">
                                            <span className="col-rank">Rütbə</span>
                                            <span className="col-name">Ad</span>
                                            <span className="col-surname">Soyad</span>
                                            <span className="col-father">Ata adı</span>
                                            <span className="col-status">Status</span>
                                            <span className="col-operation">Əməliyyatlar</span>
                                        </div>

                                        {req.forms?.map(form => (
                                            <div className="req-user-row" key={form.formId}>
                                                <span className="col-rank">{form.rank}</span>
                                                <span className="col-name">{form.name}</span>
                                                <span className="col-surname">{form.surname}</span>
                                                <span className="col-father">{form.fatherName}</span>

                                                <span
                                                    className={
                                                        form.formStatusId == 3
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
                                                            <span onClick={() => callClientDetails(form)}
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

            {totalItem && totalItem > pageSize && (
                <Pagination
                    page={page} setPage={setPage} pageSize={pageSize} totalItem={totalItem}
                />
            )}

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