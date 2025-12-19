import React, { useEffect, useState } from 'react'
import api from '../../api';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import './AccountTypes.css';
import GetAccountTypes from './GetAccountTypes';

const AccountTypes = ({ setResponseRequest, userInfo, setItem, item }) => {
    if (userInfo?.role?.name !== "Admin") return;

    const [allTypes, setAllTypes] = useState([]);
    const [ope, setOpe] = useState(null)

    const callTypes = async () => {
        const token = localStorage.getItem("myUserDutyToken");
        if (!token) return;
        try {
            const resTypes = await api.get("/admin/accountType/getAllAccountType", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setAllTypes(resTypes?.data?.data);
        } catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Məlumatlar alınarkən xəta baş verdi",
                message: err?.response?.data?.errorDescription || err,
            }));
        }
    };


    const editAccTypes = (t) => {
        setItem(t);
        setOpe("editOpe")
    }

    const addTypes = () => {
        setItem(
            {
                name: "",
                reqName: false,
                reqSurname: false,
                reqFatherName: false,
                reqUsername: false,
                reqPassword: false,
                reqRank: false,
                reqPosition: false,
                reqPhone: false,
                reqDepartment: false,
                reqUnit: false,
                reqNote: false,
                reqFin: false,
                reqSerialNumber: false,
                reqMark: false,
                reqCapacity: false,
                device: false
            }
        )

        setOpe("createOpe")
    }

    const deleteAccTypes = async (t) => {
        setResponseRequest(prev => ({
            ...prev,
            isQuestion: true,
            showResponse: true,
            api: `/admin/accountType/deleteAccountType/${t?.id}`,
            title: `${t?.name} növünü silməyə əminsiz?`,
            type: "deleteAccType"
        }))
    }

    useEffect(() => {
        setItem(null)
        callTypes();
    }, []);


    return (
        <div className="account-type-page">

            <div className="acc-header">
                <h2>Hesab Növləri</h2>
                <button className="add-btn" onClick={addTypes}>
                    <FiPlus />
                    Əlavə et
                </button>
            </div>

            <div className="acc-table">

                <div className="acc-table-head">
                    <span>#</span>
                    <span>Hesab Növü</span>
                    <span className="actions-col">Əməliyyatlar</span>
                </div>

                <div className="acc-table-body">
                    {allTypes?.map((t, index) => (
                        <div className="acc-row" key={t.id}>
                            <span>{index + 1}</span>
                            <span>{t.name}</span>
                            <div className="row-actions">
                                <FiEdit className="edit-icon-acc" onClick={() => editAccTypes(t)} />
                                <FiTrash2 className="delete-icon-acc" onClick={() => deleteAccTypes(t)} />
                            </div>
                        </div>
                    ))}
                </div>

            </div>
            {
                item && (
                    <GetAccountTypes setResponseRequest={setResponseRequest} setItem={setItem} item={item} ope={ope} />
                )
            }
        </div>
    );
};

export default AccountTypes;
