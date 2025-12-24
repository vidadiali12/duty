import React, { useEffect, useState, useRef } from 'react';
import api from '../../api';
import Loading from '../Modals/Loading';
import { FaUserCircle } from 'react-icons/fa';
import logo from '../../Logos/logo.png';
import './Header.css';
import { NavLink } from 'react-router-dom';
import { AiFillHome } from 'react-icons/ai';
import { MdBusiness } from 'react-icons/md';
import { FaUsers, FaHistory } from 'react-icons/fa';
import { BsClockHistory } from 'react-icons/bs';
import { FiCheckSquare, FiBarChart2, FiMenu, FiX } from 'react-icons/fi';
import { RiCheckboxBlankCircleFill } from "react-icons/ri";
import Profile from '../Modals/Profile';
import AdminHeader from './AdminHeader';

const Header = ({ userInfo, setUserInfo, setResponseRequest, connectNow, setConnectNow }) => {
    const [loading, setLoading] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [showProfile, setShowProfile] = useState(null);
    const [connectOpe, setConnectOpe] = useState(null);
    const [showAdminMenu, setShowAdminMenu] = useState(false);
    const [zIndexValue, setZIndexValue] = useState('100000')
    const menuRef = useRef();


    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 150);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const callUserInfo = async () => {
        setLoading(true);
        const token = localStorage.getItem("myUserDutyToken");
        if (!token) return;
        try {
            const res = await api.get('/auth/getMyProfile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res?.data?.data || null;
            setUserInfo(data);
            localStorage.setItem("userInfo", JSON.stringify(data))
            setLoading(false);
            console.log(data)
            if (data?.shouldChangePassword == false) {
                callIsConnect();
            }
        } catch (err) {
            setLoading(false);
            setResponseRequest(prev => ({
                ...prev,
                showResponse: true,
                title: "❌ Məlumatlar alınarkən xəta baş verdi",
                message: err?.response?.data?.errorDescription || err,
            }));
        }
    };

    const callIsConnect = async () => {
        try {
            const token = localStorage.getItem("myUserDutyToken");
            if (!token) throw new Error("❌ Token tapılmadı!");
            const isConnect = await api.get("/admin/bridge/getStatus", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            setConnectNow(isConnect?.data?.data)

        } catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                isQuestion: false,
                showResponse: true,
                title: `❌ Əlaqə yaradıla bilmədi!`
            }))
        }
    }

    const connectNs = async () => {
        try {
            setConnectOpe(true);
            const token = localStorage.getItem("myUserDutyToken");
            if (!token) throw new Error("❌ Token tapılmadı!");
            const connectRes = await api.put("/admin/bridge/startBridging", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            setConnectNow(connectRes?.data?.data)
            setConnectOpe(false);

        } catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                isQuestion: false,
                showResponse: true,
                title: `❌ Əlaqə yaradıla bilmədi!`
            }))
            setConnectOpe(false);
        }
    }

    const disConnectNs = async () => {
        try {
            setConnectOpe(true);
            const token = localStorage.getItem("myUserDutyToken");
            if (!token) throw new Error("❌ Token tapılmadı!");
            const disConnectRes = await api.put("/admin/bridge/closeBridging", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            setConnectNow(!disConnectRes?.data?.data)
            setConnectOpe(false);

        } catch (err) {
            setResponseRequest(prev => ({
                ...prev,
                isQuestion: false,
                showResponse: true,
                title: `❌ Əlaqə kəsilmədi!`
            }));
            setConnectOpe(false);
        }
    }

    useEffect(() => {
        callUserInfo();
    }, []);

    const callShowProfile = () => {
        setShowProfile(true)
    }

    useEffect(() => {
        const closeMenu = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
        };
        document.addEventListener('mousedown', closeMenu);
        return () => document.removeEventListener('mousedown', closeMenu);
    }, []);

    if (loading) return <Loading loadingMessage="Məlumatlar yüklənir..." />;

    return (
        !userInfo?.shouldChangePassword && (
            <div className={`header  ${scrolled ? "scrolled" : ""}`} style={{ zIndex: zIndexValue }}>
                <div className={`header-wrapper ${scrolled ? "scrolled-wrapper" : ""} `}>
                    <div className="header-left">
                        <img src={logo} alt="logo" className="header-logo" />
                        <h2 className="duty-title">Növbətçi Sistemi</h2>
                    </div>

                    {
                        userInfo?.role?.name == "Admin" && (
                            <div className='ns-connect-box'>
                                <div className='ns-connect-inform' onClick={connectNow ? disConnectNs : connectNs}>
                                    <span className='ns-connect-text' >
                                        {(connectOpe && !connectNow) ? "Bağlantı yaradılır..." : (!connectOpe && !connectNow) ? "Bağlantı yarat" :
                                            (connectOpe && connectNow) ? "Bağlantını kəsilir..." : "Bağlantını kəs"}
                                    </span>
                                    {
                                        connectNow ? <RiCheckboxBlankCircleFill className='connect-icon ci-1' /> :
                                            <RiCheckboxBlankCircleFill className='connect-icon ci-2' />
                                    }
                                </div>
                                <NavLink to={'/users-request'} className={"forms-button"}>
                                    Gələn Formlar
                                </NavLink>
                            </div>
                        )
                    }

                    <div className="header-right" ref={menuRef} onClick={() => setMenuOpen(!menuOpen)}>
                        <div className="user-info">
                            <span className="user-rank">{userInfo?.person?.rank?.name}</span>
                            <span className="user-name">{userInfo?.person?.name} {userInfo?.person?.surname}</span>
                            <FaUserCircle className="profile-icon" />
                        </div>

                        {menuOpen && (
                            <div className="profile-menu">
                                <p className="menu-item" onClick={callShowProfile}>Profil</p>
                                <p className="menu-item logout"
                                    onClick={() => {
                                        setResponseRequest(prev => ({
                                            ...prev,
                                            isQuestion: true,
                                            showResponse: true,
                                            title: "Hesabdan Çıxmağa Əminsiz?",
                                            api: "/auth/signOut",
                                            type: "signOut"
                                        }))
                                    }}>
                                    Hesabdan çıx
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                <div className='header-menu'>
                    <ul className='menu-list'>
                        <li className='menu-list-child'>
                            <NavLink className="menu-list-child-link" to="/">
                                <AiFillHome className="menu-icon" />
                                <span className='menu-list-child-text'>Əsas Səhifə</span>
                            </NavLink>
                        </li>
                        <li className='menu-list-child'>
                            <NavLink className="menu-list-child-link" to="/departments">
                                <MdBusiness className="menu-icon" />
                                <span className='menu-list-child-text'>İdarələr</span>
                            </NavLink>
                        </li>
                        <li className='menu-list-child'>
                            <NavLink className="menu-list-child-link" to="/accounts">
                                <FaUsers className="menu-icon" />
                                <span className='menu-list-child-text'>Hesablar</span>
                            </NavLink>
                        </li>
                        <li className='menu-list-child'>
                            <NavLink className="menu-list-child-link" to="/history-panel">
                                <FaHistory className="menu-icon" />
                                <span className='menu-list-child-text'>Tarixçə Paneli</span>
                            </NavLink>
                        </li>
                        <li className='menu-list-child'>
                            <NavLink className="menu-list-child-link" to="/operation-history">
                                <BsClockHistory className="menu-icon" />
                                <span className='menu-list-child-text'>Əməliyyat Tarixçəsi</span>
                            </NavLink>
                        </li>
                        <li className='menu-list-child'>
                            <NavLink className="menu-list-child-link" to="/completed-tasks">
                                <FiCheckSquare className="menu-icon" />
                                <span className='menu-list-child-text'>Görülən İşlər</span>
                            </NavLink>
                        </li>
                        <li className='menu-list-child'>
                            <NavLink className="menu-list-child-link" to="/statistics">
                                <FiBarChart2 className="menu-icon" />
                                <span className='menu-list-child-text'>Statistika</span>
                            </NavLink>
                        </li>
                    </ul>

                    {userInfo?.role?.name === "Admin" && (
                        !showAdminMenu ?
                            <FiMenu className="menu-icon admin-menu-button" onClick={() => {
                                setShowAdminMenu(!showAdminMenu);
                                setZIndexValue('99999999');
                            }} />
                            : <FiX className="menu-icon admin-menu-button" onClick={() => {
                                setShowAdminMenu(!showAdminMenu);
                                setZIndexValue('100000');
                            }} />
                    )}

                    {
                        showAdminMenu && (
                            <AdminHeader />
                        )
                    }
                </div>
                {
                    showProfile && userInfo && (
                        <Profile userInfo={userInfo} setUserInfo={setUserInfo} setShowProfile={setShowProfile} setResponseRequest={setResponseRequest} />
                    )
                }
            </div>
        )
    );
};

export default Header;
