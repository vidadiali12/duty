import React, { useEffect, useState } from "react";
import "./RankEditAndCreate.css";
import api from "../../api";

const RankEditAndCreate = ({
    item,
    setItem,
    setShowRankOpe,
    setResponseRequest
}) => {
    const [form, setForm] = useState({
        name: "",
        description: "",
    });

    const isEdit = Boolean(item?.id);

    useEffect(() => {
        if (isEdit) {
            setForm({
                name: item?.name || "",
                description: item?.description || "",
            });
        }
    }, [item, isEdit]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((p) => ({ ...p, [name]: value }));
    };


    const onSubmit = async () => {
        try {
            const token = localStorage.getItem("myUserDutyToken");
            if (isEdit) {
                await api.put(
                    `/rank/updateRank/${item.id}`,
                    form,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            } else {
                await api.post(
                    "/rank/addRank",
                    form,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }

            setItem(null);
            setResponseRequest({
                showResponse: true,
                title: isEdit ? "✅ Rütbə yeniləndi" : "✅ Rütbə yaradıldı",
            });
            setShowRankOpe(false);
            window.location.reload();
        } catch (err) {
            setResponseRequest({
                showResponse: true,
                title: "❌ Xəta baş verdi",
                message: err?.response?.data?.errorDescription || err,
            });
        }
    };

    return (
        <div className="rank-overlay">
            <div className="rank-box">
                <div className="rank-header">
                    <h2>{isEdit ? "Rütbəni yenilə" : "Rütbə yarat"}</h2>
                    <button onClick={() => { setShowRankOpe(false); setItem(null); }}>✕</button>
                </div>

                <div className="rank-body">
                    <label>
                        Qısa ad
                        <input
                            name="name"
                            value={form.name}
                            onChange={onChange}
                        />
                    </label>

                    <label>
                        Tam ad
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={onChange}
                        />
                    </label>
                </div>

                <div className="rank-footer">
                    <button className="cancel" onClick={() => { setShowRankOpe(false); setItem(null); }}>
                        Ləğv et
                    </button>
                    <button className="submit" onClick={onSubmit}>
                        {isEdit ? "Yenilə" : "Yarat"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RankEditAndCreate;
