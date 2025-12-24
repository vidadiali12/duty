import React, { useEffect, useState } from 'react'
import api from '../../api';
import './UpdateAndAdd.css';

const UpdateAndAdd = ({ setResponseRequest, endPoint, setEndPoint, typeOfOpe, setTypeOfOpe, section, setSection, item, setItem }) => {

  const [departments, setDepartments] = useState([]);
  const [requestData, setRequestData] = useState(
    section == "departments"
      ? typeOfOpe == "create" ? { tag: '', description: '' } : { tag: item?.tag, description: item?.description }
      : typeOfOpe == "create" ? { tag: '', description: '', departmentId: '' } :
        { tag: item?.tag, description: item?.description, departmentId: item?.departmentId }
  );

  const updateAndAdd = async () => {
    const token = localStorage.getItem("myUserDutyToken");
    if (!token) return;

    const hdrs = { headers: { Authorization: `Bearer ${token}` } };

    try {
      if (section == "departments") {
        if (typeOfOpe == "create") {
          await api.post(endPoint, requestData, hdrs);
        } else {
          await api.put(endPoint, requestData, hdrs);
        }
      } else if (section == "units") {
        if (typeOfOpe == "create") {
          await api.post(endPoint, requestData, hdrs);
        } else {
          await api.put(endPoint, requestData, hdrs);
        }
      }

      setEndPoint("");
      setTypeOfOpe("");
      setSection(null);
      setItem({})

      window.location.reload();

    } catch (err) {
      setResponseRequest(prev => ({
        ...prev,
        showResponse: true,
        title: "❌ Məlumatlar alınarkən xəta baş verdi",
        message: err?.response?.data?.errorDescription || err,
      }));
    }
  };

  const callDepartments = async () => {
    const token = localStorage.getItem("myUserDutyToken");
    if (!token) return;

    try {
      const res = await api.get("/department/getDepartments", {
        params: { page: 1, pageSize: 1000 },
        headers: { Authorization: `Bearer ${token}` }
      });

      setDepartments(res?.data?.data?.data || []);

    } catch (err) {
      setResponseRequest(prev => ({
        ...prev,
        showResponse: true,
        title: "❌ Məlumatlar alınarkən xəta baş verdi",
        message: err?.response?.data?.errorDescription || err,
      }));
    }
  };

  useEffect(() => {
    if (section === "units") callDepartments();
  }, [section]);

  return (
    <div className="update-add-wrapper">
      <div className="edit-add-card">

        <button
          className="close-edit-add"
          onClick={() => {
            setEndPoint("");
            setTypeOfOpe("");
            setSection(null);
          }}
        >
          ✕
        </button>

        <h2 className="edit-add-title">
          {typeOfOpe === "create" ? "Yarat" : "Yadda Saxla"}
        </h2>

        <div className="edit-add-body">

          <div className="input-group">
            <label>Qısa ad</label>
            <input
              placeholder='Qısa ad: '
              value={requestData?.tag}
              onChange={e => setRequestData(prev => ({ ...prev, tag: e.target.value }))}
              type="text"
            />
          </div>

          <div className="input-group">
            <label>Tam ad</label>
            <input
              placeholder='Tam ad: '
              value={requestData?.description}
              onChange={e => setRequestData(prev => ({ ...prev, description: e.target.value }))}
              type="text"
            />
          </div>

          {section === "units" && (
            <div className="input-group">
              <label>İdarə Seç</label>
              <select
                value={requestData?.departmentId}
                onChange={e => setRequestData(prev => ({ ...prev, departmentId: e.target.value }))}
              >
                <option value="">Seçin</option>
                {departments.map(dep => (
                  <option key={dep.id} value={dep.id}>
                    {dep.tag}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button className="submit-btn" onClick={updateAndAdd}>
            {typeOfOpe === "create" ? "Yarat" : "Yadda Saxla"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default UpdateAndAdd;
