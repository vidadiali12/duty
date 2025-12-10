import React, { useEffect, useState } from 'react'
import api from '../../api'
import "./ClientOpe.css"
import Pagination from '../Pagination/Pagination'

const ClientOpe = ({ item, setShowClientOpe }) => {

    const [clientOpes, setClientOpes] = useState([])
    const [page, setPage] = useState(1);
    const [pageSize] = useState(12);
    const [totalItem, setTotalItem] = useState(null)

    const callClientOpeDetails = async () => {
        const token = localStorage.getItem('myUserDutyToken');
        if (!token || !item) return;

        try {
            const res = await api.get(
                `/admin/history/getClientLogs/${item?.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: { page, pageSize }
                }
            );
            setClientOpes(res?.data?.data?.data || [])
            setTotalItem(res?.data?.data?.totalItem)
            console.log(res?.data?.data?.totalItem)
        } catch (err) {
            console.log(err)
        }
    };

    useEffect(() => {
        callClientOpeDetails()
    }, [page])


    return (
        <div className='client-ope-container'>


            <div className='client-ope-table'>
                <h2>İstifadəçi Logları</h2>
                <div className="cl-row cl-head">
                    <span>#</span>
                    <span>Əməliyyat</span>
                    <span>Action</span>
                    <span>Tarix</span>
                    <span>Sənəd №</span>
                    <span>Ad</span>
                    <span>Soyad</span>
                    <span>User</span>
                    <span>Rütbə</span>
                </div>

                {clientOpes?.map((log, index) => (
                    <div className="cl-row" key={log?.id}>
                        <span>{pageSize * (page - 1) + index + 1}</span>
                        <span>{log?.accountType}</span>
                        <span>{log?.action}</span>
                        <span>{log?.historyDate?.split("T")[0]} {log?.historyDate?.split("T")[1]?.slice(0, 8)}</span>
                        <span>{log?.documentNo || "Mövcud deyil"}</span>
                        <span>{log?.clientData?.name}</span>
                        <span>{log?.clientData?.surname}</span>
                        <span>{log?.clientData?.username}</span>
                        <span>{log?.clientData?.rank?.name}</span>
                    </div>
                ))}

                {
                    totalItem && (totalItem > pageSize) && (
                        <Pagination page={page} setPage={setPage} pageSize={pageSize} totalItem={totalItem} />
                    )
                }

                <button
                    onClick={() => setShowClientOpe(false)}
                    className='close-btn-client-logs'
                >
                    Bağla
                </button>
            </div>

        </div>
    )
}

export default ClientOpe
