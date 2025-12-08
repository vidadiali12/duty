import React, { useEffect, useState } from 'react';
import api from '../../api';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import './Departments.css';
import { NavLink } from 'react-router-dom';
import UpdateAndAdd from './UpdateAndAdd';

const Departments = ({ setResponseRequest, setItem, item }) => {
    const [allDeps, setAllDeps] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(15);
    const [typeOfOpe, setTypeOfOpe] = useState("");
    const [section, setSection] = useState(null);
    const [endPoint, setEndPoint] = useState("");

    const callDepartments = async () => {
        const token = localStorage.getItem("myUserDutyToken");
        try {
            const resDeps = await api.get("/department/getDepartments", {
                params: { page, pageSize },
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllDeps(resDeps?.data?.data?.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        callDepartments();
    }, [page, pageSize]);

    const deleteDep = (id) => {
        setResponseRequest(prev => ({
            ...prev,
            isQuestion: true,
            title: "Bu idarəni silməyə əminsiz?",
            type: "deleteDep",
            showResponse: true,
            api: `/department/deleteDepartment/${id}`
        }))
    }

    const createDep = () => {
        setEndPoint("/department/createDepartment");
        setSection("departments");
        setTypeOfOpe("create")
    }

    const editDep = (dep) => {
        setEndPoint(`/department/updateDepartment/${dep?.id}`);
        setSection("departments");
        setTypeOfOpe("edit")
        setItem(dep)
    }

    return (
        <div className="departments-wrapper">
            <div className="departments-header">
                <h2>İdarələr</h2>
                <div className='to-units'>
                    <button className="add-btn" onClick={createDep}>
                        <FiPlus /> İdarə əlavə et
                    </button>
                    <NavLink to={"/units"}>Bölmələr</NavLink>
                </div>
            </div>

            <div className="departments-table">
                <div className="departments-row dep-header">
                    <span className="cell id">#</span>
                    <span className="cell tag">Qısa ad</span>
                    <span className="cell description">Tam ad</span>
                    <span className="cell date">Yaradıldı</span>
                    <span className="cell date">Dəyişdirildi</span>
                    <span className="cell action">Yenilə</span>
                    <span className="cell action">Sil</span>
                </div>

                {allDeps?.map((dep, index) => (
                    <div key={dep?.id} className="departments-row">
                        <span className="cell id">{index + 1}</span>
                        <span className="cell tag">{dep?.tag}</span>
                        <span className="cell description">{dep?.description}</span>
                        <span className="cell date">{dep?.createdAt?.split("T")[0]} {dep?.createdAt?.split("T")[1]?.slice(0, 8)}</span>
                        <span className="cell date">{dep?.updatedAt?.split("T")[0]} {dep?.updatedAt?.split("T")[1]?.slice(0, 8)}</span>
                        <span className="cell action" onClick={() => editDep(dep)}>
                            <FiEdit className="action-icon update" />
                        </span>
                        <span className="cell action" onClick={() => deleteDep(dep?.id)}>
                            <FiTrash2 className="action-icon delete" />
                        </span>
                    </div>
                ))}
            </div>

            {
                section && (
                    <UpdateAndAdd
                        setResponseRequest={setResponseRequest}
                        endPoint={endPoint}
                        setEndPoint={setEndPoint}
                        section={section}
                        setSection={setSection}
                        typeOfOpe={typeOfOpe}
                        setTypeOfOpe={setTypeOfOpe}
                        item={item}
                        setItem={setItem}
                    />
                )
            }
        </div>
    );
};

export default Departments;
