import React from 'react'
import './Header.css';
import './AdminHeader.css'
import { GiTeamIdea, GiRank1 } from 'react-icons/gi';
import { FiUserPlus } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';

const AdminHeader = () => {
    return (
        <div className='admin-menu'>
            <ul className='admin-menu-list'>
                <li className='admin-menu-list-child'>
                    <NavLink className="admin-menu-list-child-link" to="/account-types">
                        <FiUserPlus className="menu-icon" />
                        <span className='admin-menu-list-child-text'>Hesab Növləri</span>
                    </NavLink>
                </li>
                <li className='admin-menu-list-child'>
                    <NavLink className="admin-menu-list-child-link" to="/shift-managers">
                        <GiTeamIdea className="menu-icon" />
                        <span className='admin-menu-list-child-text'>Növbətçilər</span>
                    </NavLink>
                </li>
                <li className='admin-menu-list-child'>
                    <NavLink className="admin-menu-list-child-link" to="/ranks">
                        <GiRank1 className="menu-icon" />
                        <span className='admin-menu-list-child-text'>Rütbələr</span>
                    </NavLink>
                </li>
                <li className='admin-menu-list-child'>
                    <NavLink className="admin-menu-list-child-link" to="/task-area">
                        <GiRank1 className="menu-icon" />
                        <span className='admin-menu-list-child-text'>Görülən işlər</span>
                    </NavLink>
                </li>
            </ul>
        </div>
    )
}

export default AdminHeader