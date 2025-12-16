import React, { useState } from 'react';
import api from '../../../api';
import "./ChangePassword.css";
import { AiFillEye, AiFillEyeInvisible, AiOutlineClose } from "react-icons/ai";

const ChangePassword = ({ item, setItem, setResponseRequest, setShowCPArea }) => {

    const [pass, setPass] = useState("");
    const [repass, setRepass] = useState("");
    const [show1, setShow1] = useState(false);
    const [show2, setShow2] = useState(false);
    const [loading, setLoading] = useState(false);

    const changePass = async () => {

        if (!pass.trim() || !repass.trim()) {
            setResponseRequest({
                title: "❌ Xəta",
                message: "Parol boş buraxıla bilməz!",
                isQuestion: false,
                showResponse: true
            });
            return;
        }

        if (pass.trim() !== repass.trim()) {
            setResponseRequest({
                title: "❌ Xəta",
                message: "Parollar üst-üstə düşmədi!",
                isQuestion: false,
                showResponse: true
            });
            return;
        }

        try {
            setLoading(true);

            const token = localStorage.getItem('myUserDutyToken');

            await api.put(
                `/admin/personnel/changePersonnelPassword/${item?.id}`,
                { password: pass.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setItem(null);
            setShowCPArea(false);

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='cp-wrapper'>

            <div className='cp-wrapper-child'>
                <h3>🔐 Parol Dəyiş</h3>

                <AiOutlineClose className='cp-close' onClick={() => setShowCPArea(false)} />
                    
                <label className='cp-label'>
                    <span>Yeni Parol</span>
                    <div className='inp-wrap'>
                        <input
                            type={show1 ? "text" : "password"}
                            value={pass}
                            onChange={e => setPass(e.target.value)}
                            placeholder="Yeni Parol"
                            autoComplete='off'
                        />
                        {show1 ? (
                            <AiFillEyeInvisible onClick={() => setShow1(false)} />
                        ) : (
                            <AiFillEye onClick={() => setShow1(true)} />
                        )}
                    </div>
                </label>

                <label className='cp-label'>
                    <span>Təkrar</span>
                    <div className='inp-wrap'>
                        <input
                            type={show2 ? "text" : "password"}
                            value={repass}
                            onChange={e => setRepass(e.target.value)}
                            placeholder="Parolun Təkrarı"
                            autoComplete='off'
                        />
                        {show2 ? (
                            <AiFillEyeInvisible onClick={() => setShow2(false)} />
                        ) : (
                            <AiFillEye onClick={() => setShow2(true)} />
                        )}
                    </div>
                </label>

                <button disabled={loading} onClick={changePass}>
                    {loading ? "Gözləyin..." : "Dəyiş"}
                </button>
            </div>

        </div>
    );
};

export default ChangePassword;
