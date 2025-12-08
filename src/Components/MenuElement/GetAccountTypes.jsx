import React, { useEffect, useState } from 'react'
import api from '../../api'
import './GetAccountTypes.css'

const GetAccountTypes = ({ setResponseRequest, setItem, item, ope }) => {
    const [typesDetails, setTypesDetails] = useState(null)

    const typesName = {
        reqName: "Ad",
        reqSurname: "Soyad",
        reqFatherName: "Ata adı",
        reqUsername: "İstifadəçi adı",
        reqPassword: "Parol",
        reqRank: "Rütbə",
        reqPosition: "Vəzifə",
        reqPhone: "Telefon Nömrə",
        reqDepartment: "İdarə",
        reqUnit: "Bölmə",
        reqNote: "Qeyd",
        reqFin: "Fin",
        reqSerialNumber: "Cihazın Unikal Nömrə",
        reqMark: "Cihazın Markası",
        reqCapacity: "Cihazın Tutumu",
        device: "Cihazdır"
    }

    const callAccountTypesDetails = async () => {
        const token = localStorage.getItem("myUserDutyToken");
        if (!token) return;

        try {
            if (ope === "createOpe") {
                setTypesDetails(item);
            }
            else if (ope === "editOpe") {

                const resTypes = await api.get(`/admin/accountType/getAccountType/${item?.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTypesDetails(resTypes?.data?.data);
            }
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        callAccountTypesDetails()
    }, [])


    const saveUpdatedType = async () => {
        const token = localStorage.getItem("myUserDutyToken");
        if (!token) return;
        const { id, device, ...rest } = typesDetails;

        const body = {
            ...rest,
            isDevice: device ?? typesDetails.isDevice ?? false
        };
        try {

            if (ope == "editOpe") {
                await api.put(
                    `/admin/accountType/updateAccountType/${item?.id}`,
                    body,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            else if (ope == "createOpe") {
                await api.post(
                    `/admin/accountType/createAccountType`,
                    body,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            setItem(null);
            window.location.reload();
        } catch (err) {
            setResponseRequest(prev => (
                {
                    ...prev,
                    isQuestion: false,
                    title: "❌ Xəta baş verdi: ",
                    message: err?.response?.data?.errorDescription || err,
                    showResponse: true
                }
            ))
        }
    }


    return (
        <div className="gat-wrapper">
            <div className="gat-card">

                <h2 className="gat-title">Hesab Növü</h2>

                <button
                    className="close-get-acc-types"
                    onClick={() => setItem(null)}
                >
                    ✕
                </button>

                {typesDetails && (
                    <div className="gat-body">

                        <div className="gat-row gat-name">
                            <span className="gat-key">Növ</span>
                            <input
                                type='text'
                                placeholder='Növ adı daxil edin: '
                                className="gat-text  input-text"
                                value={typesDetails?.name}
                                onChange={(e) =>
                                    setTypesDetails({ ...typesDetails, name: e.target.value })
                                }
                            />
                        </div>

                        <div className="gat-grid">
                            {Object.keys(typesDetails)
                                .filter(key => key !== "id" && key !== "name")
                                .filter(key => {
                                    const deviceFields = ["reqMark", "reqCapacity", "reqSerialNumber"];

                                    if (!typesDetails.device && deviceFields.includes(key)) {
                                        return false;
                                    }

                                    return true; 
                                })
                                .map((key) => (
                                    <label className="gat-item" key={key}>
                                        <span className="gat-item-text">
                                            {typesName[key]}
                                        </span>

                                        <input
                                            className="gat-checkbox"
                                            type="checkbox"
                                            checked={!!typesDetails[key]}
                                            onChange={(e) =>
                                                setTypesDetails({
                                                    ...typesDetails,
                                                    [key]: e.target.checked
                                                })
                                            }
                                        />
                                    </label>
                                ))}
                        </div>

                        <button className="gat-save-btn" onClick={saveUpdatedType}>
                            {
                                ope === "editOpe" ? "Yadda saxla" : "Hesab Yarat"
                            }
                        </button>

                    </div>
                )}
            </div>
        </div>
    )
}

export default GetAccountTypes
