import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import api from "../../api";
import "./Ranks.css"
import RankEditAndCreate from "./RankEditAndCreate";

const Ranks = ({ setResponseRequest, userInfo, setItem, item }) => {

  if (userInfo?.role?.name !== "Admin") {
    return <p style={{ color: "red", marginTop: '20px', paddingLeft: '10px' }}>Bu səhifəyə giriş icazəniz yoxdur.</p>;
  }

  const [ranks, setRanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRankOpe, setShowRankOpe] = useState(false);

  const loadRanks = async () => {
    const token = localStorage.getItem('myUserDutyToken');
    const hdrs = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    try {
      const res = await api.get("/rank/getAllRank", hdrs);
      setRanks(res?.data?.data || []);
    } catch (err) {
      setResponseRequest(prev => ({
        ...prev,
        showResponse: true,
        title: "❌ Məlumatlar alınarkən xəta baş verdi",
        message: err?.response?.data?.errorDescription || err,
      }));
    } finally {
      setLoading(false);
    }
  };

  const deleteRank = async (id) => {
    setResponseRequest(prev => ({
      ...prev,
      showResponse: true,
      isQuestion: true,
      title: "Rütbə silinsin?",
      type: 'deleteRank',
      api: `/rank/deleteRank/${id}`,
    }));
  }

  useEffect(() => {
    loadRanks();
    setItem(null);
  }, []);

  if (loading) return <p style={{ color: "white" }}>Yüklənir...</p>;

  return (
    <div className="ranks-page">
      <div className="ranks-header">
        <h2>Rütbələr</h2>
        <button className="add-btn" onClick={() => { setItem(null); setShowRankOpe(true); }}>
          <FaPlus /> Əlavə et
        </button>
      </div>

      <div className="ranks-table">
        <div className="table-row-rank table-header-rank">
          <span>ID</span>
          <span>Ad</span>
          <span>Tam ad</span>
          <span style={{ textAlign: 'center' }}>Əməliyyatlar</span>
        </div>

        <div className="table-row-rank table-header-rank">
          <span>ID</span>
          <span>Ad</span>
          <span>Tam ad</span>
          <span style={{ textAlign: 'center' }}>Əməliyyatlar</span>
        </div>

        <div className="table-row-rank table-header-rank">
          <span>ID</span>
          <span>Ad</span>
          <span>Tam ad</span>
          <span style={{ textAlign: 'center' }}>Əməliyyatlar</span>
        </div>

        {ranks.map((rank, index) => (
          <div key={rank?.id} className="table-row-rank">
            <span>{index + 1}</span>
            <span>{rank?.name}</span>
            <span>{rank?.description}</span>
            <span className="actions-ranks">
              <FaEdit className="edit-icon-ranks" onClick={() => { setItem(rank); setShowRankOpe(true); }} />
              <FaTrash className="delete-icon-ranks" onClick={() => deleteRank(rank?.id)} />
            </span>
          </div>
        ))}
      </div>
      {
        showRankOpe && (
          <RankEditAndCreate
            setShowRankOpe={setShowRankOpe}
            setResponseRequest={setResponseRequest}
            item={item}
            setItem={setItem}
          />
        )
      }
    </div>
  );
};

export default Ranks;
