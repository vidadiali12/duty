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
import { FiCheckSquare, FiBarChart2, FiUserPlus } from 'react-icons/fi';
import { GiTeamIdea, GiRank1 } from 'react-icons/gi';

const Header = ({ userInfo, setUserInfo, setResponseRequest }) => {
    const [loading, setLoading] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef();

    const callUserInfo = async () => {
        setLoading(true);
        const token = localStorage.getItem("myUserDutyToken");
        if (!token) return;
        try {
            const res = await api.get('/auth/getMyProfile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res?.data?.data;
            setUserInfo(data);
            localStorage.setItem("userInfo", JSON.stringify(data))
            setLoading(false);
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

    useEffect(() => {
        callUserInfo();
    }, []);

    useEffect(() => {
        const closeMenu = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
        };
        document.addEventListener('mousedown', closeMenu);
        return () => document.removeEventListener('mousedown', closeMenu);
    }, []);

    if (loading) return <Loading loadingMessage="Məlumatlar yüklənir..." />;

    return (
        <div className='header'>
            <div className="header-wrapper">
                <div className="header-left">
                    <img src={logo} alt="logo" className="header-logo" />
                    <h2 className="duty-title">Növbətçi Sistemi</h2>
                </div>

                <div className="header-right" ref={menuRef} onClick={() => setMenuOpen(!menuOpen)}>
                    <div className="user-info">
                        <span className="user-rank">{userInfo?.person?.rank?.name}</span>
                        <span className="user-name">{userInfo?.person?.name} {userInfo?.person?.surname}</span>
                        <FaUserCircle className="profile-icon" />
                    </div>

                    {menuOpen && (
                        <div className="profile-menu">
                            <p className="menu-item">Profil</p>
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

                    {userInfo?.role?.name === "Admin" && (
                        <>
                            <li className='menu-list-child'>
                                <NavLink className="menu-list-child-link" to="/account-types">
                                    <FiUserPlus className="menu-icon" />
                                    <span className='menu-list-child-text'>Hesab Növləri</span>
                                </NavLink>
                            </li>
                            <li className='menu-list-child'>
                                <NavLink className="menu-list-child-link" to="/shift-managers">
                                    <GiTeamIdea className="menu-icon" />
                                    <span className='menu-list-child-text'>Növbətçilər</span>
                                </NavLink>
                            </li>
                            <li className='menu-list-child'>
                                <NavLink className="menu-list-child-link" to="/ranks">
                                    <GiRank1 className="menu-icon" />
                                    <span className='menu-list-child-text'>Rütbələr</span>
                                </NavLink>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Header;
