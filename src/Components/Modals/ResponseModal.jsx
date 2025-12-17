import React, { useEffect } from 'react';
import './ResponseModal.css';
import api from '../../api';

const ResponseModal = ({ responseRequest, setResponseRequest }) => {

    const sendApi = async () => {
        const token = localStorage.getItem("myUserDutyToken");
        if (!token) return;

        const hdrs = {
            headers: { Authorization: `Bearer ${token}` }
        }

        if (responseRequest?.api != "") {
            try {
                if (responseRequest.type === "signOut") {
                    await api.post(responseRequest.api, hdrs);
                    localStorage.clear();
                }

                else if (responseRequest.type === "deleteAccSoft") {
                    await api.put(responseRequest.api, responseRequest.message, hdrs);
                    window.location.reload()
                }

                else if (responseRequest.type === "deleteAccHard") {
                    console.log()
                    await api.delete(responseRequest.api, { headers: hdrs.headers, data: responseRequest?.message });
                    window.location.reload()
                }

                else {
                    await api.delete(responseRequest.api, hdrs);
                    window.location.reload()
                }
                
                setResponseRequest({
                    showResponse: false,
                    isQuestion: false,
                    title: "",
                    message: "",
                    onConfirm: null,
                    type: "",
                    api: ""
                });
            } catch (err) {
                console.error(err);
            }
        }
    };

    if (!responseRequest?.showResponse) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>{responseRequest.title}</h2>
                {
                    (responseRequest.type === "deleteAccSoft" || responseRequest.type == "deleteAccHard") ? ""
                        : <p>
                            {responseRequest.message}
                        </p>
                }
                <div className="modal-buttons">
                    {responseRequest.isQuestion ? (
                        <>
                            <button
                                className="confirm-button"
                                onClick={() => sendApi()}
                            >Bəli</button>
                            <button
                                className="cancel-button"
                                onClick={() => setResponseRequest(prev => ({ ...prev, showResponse: false }))}
                            >Xeyr</button>
                        </>
                    ) : (
                        <button
                            className="confirm-button"
                            onClick={() => {
                                setResponseRequest(prev => ({ ...prev, showResponse: false }));
                                if (responseRequest?.type === "changeMyPass" || responseRequest?.type === "createAdminAccDuty") {
                                    window.location.reload();
                                }
                            }}
                        >Bağla</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResponseModal;
