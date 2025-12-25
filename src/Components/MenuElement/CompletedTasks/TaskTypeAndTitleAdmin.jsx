import React, { useEffect, useState } from "react";
import { FiEdit, FiTrash2, FiPlus, FiX } from "react-icons/fi";
import "./TaskTypeAndTitleAdmin.css";
import api from "../../../api";

const TaskTypeAndTitleAdmin = ({ setResponseRequest, item, setItem, userInfo }) => {

  if (userInfo?.role?.name !== "Admin") {
    return <p style={{ color: "red", marginTop: '20px', paddingLeft: '10px' }}>Bu səhifəyə giriş icazəniz yoxdur.</p>;
  }

  const [activeTab, setActiveTab] = useState("type");

  const [taskTypes, setTaskTypes] = useState([]);
  const [taskTitles, setTaskTitles] = useState([]);

  const [newType, setNewType] = useState("");
  const [newTitle, setNewTitle] = useState("");

  const token = localStorage.getItem("myUserDutyToken");
  const hdrs = { headers: { Authorization: `Bearer ${token}` } };

  const loadTypes = async () => {
    try {
      const res = await api.get("/task/type/getTypes", hdrs);
      setTaskTypes(res?.data?.data || []);
    } catch (err) {
      setResponseRequest(prev => ({
        ...prev,
        showResponse: true,
        title: "❌ Task tipləri yüklənmədi",
        message: err?.response?.data?.errorDescription || err?.message
      }));
    }
  };

  const loadTitles = async () => {
    try {
      const res = await api.get("/task/title/getTitles", hdrs);
      setTaskTitles(res?.data?.data || []);
    } catch (err) {
      setResponseRequest(prev => ({
        ...prev,
        showResponse: true,
        title: "❌ Task başlıqları yüklənmədi",
        message: err?.response?.data?.errorDescription || err
      }));
    }
  };

  useEffect(() => {
    setItem(null);
    loadTypes();
    loadTitles();
  }, []);

  const createType = async () => {
    if (!newType) {
      setResponseRequest(prev => ({
        ...prev,
        showResponse: true,
        title: "❌ Tip boş qala bilməz"
      }));
      return;
    };
    try {
      if (item == null) {
        const res = await api.post("/task/type/createType", { typeName: newType }, hdrs);
      }
      else {
        const res = await api.put(`/task/type/updateType/${item?.id}`, { typeName: newType }, hdrs);
      }
      window.location.reload();
      setNewType("");
      setItem(null);
    } catch (err) {
      setResponseRequest(prev => ({
        ...prev,
        showResponse: true,
        title: "❌ Xəta",
        message: err?.response?.data?.errorDescription || err
      }));
    }
  };

  const createTitle = async () => {
    if (!newTitle) {
      setResponseRequest(prev => ({
        ...prev,
        showResponse: true,
        title: "❌ Başlıq boş qala bilməz"
      }));
      return;
    };
    try {
      if (item == null) {
        const res = await api.post("/task/title/createTitle", { title: newTitle }, hdrs);
      }
      else {
        const res = await api.put(`/task/title/updateTitle/${item?.id}`, { title: newTitle }, hdrs);
      }
      window.location.reload();
      setNewTitle("");
      setItem(null);
    } catch (err) {
      setResponseRequest(prev => ({
        ...prev,
        showResponse: true,
        title: "❌ Xəta",
        message: err?.response?.data?.errorDescription || err
      }));
    }
  };

  const deleteType = (id) => {
    setResponseRequest(prev => (
      {
        ...prev,
        title: 'Bu tipi silməyə əminsiz?',
        isQuestion: true,
        api: `/task/type/deleteType/${id}`,
        showResponse: true,
        type: 'deleteTaskType'
      }
    ))
  };

  const deleteTitle = (id) => {
    setResponseRequest(prev => (
      {
        ...prev,
        title: 'Bu başlığı silməyə əminsiz?',
        isQuestion: true,
        api: `/task/title/deleteTitle/${id}`,
        showResponse: true,
        type: 'deleteTaskTitle'
      }
    ))
  };

  const editTitle = (t) => {
    setItem(t)
    setNewTitle(t?.title)
  }

  const editType = (t) => {
    setItem(t)
    setNewType(t?.typeName)
  }

  const stopEditType = () => {
    setItem(null);
    setNewType("");
  }

  const stopEditTitle = () => {
    setItem(null);
    setNewTitle("");
  }


  return (
    <div className="task-admin-wrapper p-4 w-full">
      <div className="task-admin-tabs mb-5">
        <button
          className={`task-admin-tab ${activeTab === "type" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("type");
            setItem(null);
          }}
        >
          Tapşırıq Tipi
        </button>
        <button
          className={`task-admin-tab ${activeTab === "title" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("title");
            setItem(null);
          }}
        >
          Tapşırıq Başlığı
        </button>
      </div>

      {activeTab === "type" && (
        <div className="task-type-section">
          <div className="task-type-create mb-3 flex gap-2">
            <input
              type="text"
              placeholder="Yeni tip əlavə et..."
              value={newType}
              onChange={e => setNewType(e.target.value)}
              className="task-type-input"
            />
            {
              item && <button className="task-type-x-btn" onClick={stopEditType}>
                <FiX className="close-update" />
              </button>
            }
            <button className="task-type-btn" onClick={createType}>
              {
                item == null ?
                  <>
                    <FiPlus /> Əlavə et
                  </> : "Yenilə"
              }
            </button>
          </div>

          <div className="task-type-table">
            <div className="task-type-row header">
              <span>#</span>
              <span>Tip adı</span>
              <span>Əməliyyat</span>
            </div>
            {taskTypes.map((t, index) => (
              <div className="task-type-row" key={t.id}>
                <span>{index + 1}</span>
                <span>{t.typeName}</span>
                <span className="task-type-actions">
                  <FiEdit className="task-type-edit" onClick={() => editType(t)} />
                  <FiTrash2 className="task-type-delete" onClick={() => deleteType(t.id)} />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "title" && (
        <div className="task-title-section">
          <div className="task-title-create mb-3 flex gap-2">
            <input
              type="text"
              placeholder="Yeni başlıq əlavə et..."
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="task-title-input"
            />
            {
              item && <button className="task-title-x-btn" onClick={stopEditTitle}>
                <FiX className="close-update" />
              </button>
            }
            <button className="task-title-btn" onClick={createTitle}>
              {
                item == null ?
                  <>
                    <FiPlus /> Əlavə et
                  </> : "Yenilə"
              }
            </button>
          </div>

          <div className="task-title-table">
            <div className="task-title-row header">
              <span>#</span>
              <span>Başlıq</span>
              <span>Əməliyyat</span>
            </div>
            {taskTitles.map((t, index) => (
              <div className="task-title-row" key={t.id}>
                <span>{index + 1}</span>
                <span>{t.title}</span>
                <span className="task-title-actions">
                  <FiEdit className="task-title-edit" onClick={() => editTitle(t)} />
                  <FiTrash2 className="task-title-delete" onClick={() => deleteTitle(t.id)} />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskTypeAndTitleAdmin;
