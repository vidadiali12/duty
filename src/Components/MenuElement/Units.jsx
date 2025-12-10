import React, { useEffect, useState } from 'react';
import api from '../../api';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import './Departments.css';
import { NavLink } from 'react-router-dom';
import UpdateAndAdd from './UpdateAndAdd';
import Pagination from '../Pagination/Pagination';

const Units = ({ setResponseRequest, setItem, item }) => {
    const [allUnits, setAllUnits] = useState([]);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [typeOfOpe, setTypeOfOpe] = useState("");
    const [section, setSection] = useState(null);
    const [endPoint, setEndPoint] = useState("");
    const [totalItem, setTotalItem] = useState(null)

    const callUnits = async () => {
        const token = localStorage.getItem("myUserDutyToken");
        try {
            const resUnits = await api.get("/department/unit/getAllUnit", {
                params: { page, pageSize },
                headers: { Authorization: `Bearer ${token}` }
            });
            setTotalItem(resUnits?.data?.data?.totalItem);
            setAllUnits(resUnits?.data?.data?.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        callUnits();
    }, [page, pageSize]);

    const deleteUnit = (id) => {
        setResponseRequest(prev => ({
            ...prev,
            isQuestion: true,
            title: "Bu idarəni silməyə əminsiz?",
            type: "deleteDep",
            showResponse: true,
            api: `/department/deleteDepartment/${id}`
        }))
    }

    const createUnit = () => {
        setEndPoint("/department/unit/createUnit");
        setSection("units");
        setTypeOfOpe("create")
    }

    const editUnit = (unit) => {
        setEndPoint(`/department/unit/updateUnit/${unit?.id}`);
        setSection("units");
        setTypeOfOpe("edit")
        setItem(unit)
    }

    return (
        <div className="departments-wrapper">
            <div className="departments-header">
                <h2>Bölmələr</h2>
                <div className='to-units'>
                    <button className="add-btn" onClick={createUnit}>
                        <FiPlus /> Bölmə əlavə et
                    </button>
                </div>
            </div>

            <div className="departments-table">
                <div className="departments-row dep-header">
                    <span className="cell id">#</span>
                    <span className="cell tag">Qısa ad</span>
                    <span className="cell description">Tam ad</span>
                    <span className="cell tag">Aid olduğu idarə</span>
                    <span className="cell date">Yaradıldı</span>
                    <span className="cell date">Dəyişdirildi</span>
                    <span className="cell action">Yenilə</span>
                    <span className="cell action">Sil</span>
                </div>

                {allUnits?.map((unit, index) => (
                    <div key={unit?.id} className="departments-row">
                        <span className="cell id">{pageSize * (page - 1) + index + 1}</span>
                        <span className="cell tag">{unit?.tag}</span>
                        <span className="cell description">{unit?.description}</span>
                        <span className="cell tag">{unit?.departmentName}</span>
                        <span className="cell date">{unit?.createdAt?.split("T")[0]} {unit?.createdAt?.split("T")[1]?.slice(0, 8)}</span>
                        <span className="cell date">{unit?.updatedAt?.split("T")[0]} {unit?.updatedAt?.split("T")[1]?.slice(0, 8)}</span>
                        <span className="cell action" onClick={() => editUnit(unit)}>
                            <FiEdit className="action-icon update" />
                        </span>
                        <span className="cell action" onClick={() => deleteUnit(dep?.id)}>
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

            {
                totalItem && (totalItem > pageSize) && (
                    <Pagination page={page} setPage={setPage} pageSize={pageSize} totalItem={totalItem} />
                )
            }
        </div>
    );
};

export default Units;
