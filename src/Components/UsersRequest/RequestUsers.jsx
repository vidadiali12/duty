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


    const [rankList, setRankList] = useState([]);
    const [departmentList, setDepartmentList] = useState([]);
    const [unitList, setUnitList] = useState([]);
    const [accTypeList, setAccTypeList] = useState([]);
    const [accStatusList, setAccStatusList] = useState([]);
    const [createAndUpdate, setCreateAndUpdate] = useState(null);
    const [typeOpe, setTypeOpe] = useState("");
    const [apiOpe, setApiOpe] = useState("");
    const [isFromESD] = useState("fromESD")

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

            setCreateAndUpdate(true);
            setApiOpe("/admin/client/createClient");
            setTypeOpe("createAcc");
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
            const resData =res?.data?.data 
            setItem({...resData, formId: formElement?.formId});
            loadFilterData();
        } catch (err) {

        }
    }

    useEffect(() => {
        setItem(null)
        allRequest();
    }, [connectNow])
    return (
        <div className="request-users-container">

            <h2 className="request-title">Göndərilmiş Formlar</h2>

            <div className="request-list">
                {connectNow ? (
                    allUsersRequest?.length > 0 ? (
                        allUsersRequest.map((req) => (
                            <div className="request-card" key={req.documentNo}>

                                <div className="req-left">
                                    <span className="req-docNo">№ {req.documentNo}</span>
                                    <span className="req-type">{req.accountType}</span>
                                    <span className="req-date">{req.formDate?.split("T")[0]} {req.formDate?.split("T")[1]?.slice(0, 8)}</span>
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
                                                        form.formStatusId === 3
                                                            ? "status pending"
                                                            : form.formStatusId === 2
                                                                ? "status approved"
                                                                : "status rejected"
                                                    }
                                                >
                                                    {form.formStatusId === 3
                                                        ? "Gözləmədə"
                                                        : form.formStatusId === 2
                                                            ? "Təsdiqlənib"
                                                            : "İmtina edilib"}
                                                </span>
                                                <span className="col-operation">
                                                    <span onClick={() => callClientDetails(form)}>Əlavə et</span>
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        ))
                    ) : (
                        <div className="no-data">Məlumat tapılmadı...</div>
                    )
                ) : (
                    <div className="no-data">Bağlantı yoxdur!</div>
                )}
            </div>

            {totalItem && totalItem > pageSize && (
                <Pagination
                    page={page}
                    setPage={setPage}
                    pageSize={pageSize}
                    totalItem={totalItem}
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