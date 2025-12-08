import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import api from "../../api";
import "./Ranks.css"

const Ranks = () => {
  const [ranks, setRanks] = useState([]);
  const [loading, setLoading] = useState(true);

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
      console.error("Rank load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRanks();
  }, []);

  if (loading) return <p style={{ color: "white" }}>Yüklənir...</p>;

  return (
    <div className="ranks-page">
      <div className="ranks-header">
        <h2>Rütbələr</h2>
        <button className="add-btn">
          <FaPlus /> Əlavə et
        </button>
      </div>

      <div className="ranks-table">
        <div className="table-row-rank table-header-rank">
          <span>ID</span>
          <span>Ad</span>
          <span>Tam ad</span>
          <span style={{textAlign: 'center'}}>Əməliyyatlar</span>
        </div>

        <div className="table-row-rank table-header-rank">
          <span>ID</span>
          <span>Ad</span>
          <span>Tam ad</span>
          <span style={{textAlign: 'center'}}>Əməliyyatlar</span>
        </div>

        <div className="table-row-rank table-header-rank">
          <span>ID</span>
          <span>Ad</span>
          <span>Tam ad</span>
          <span style={{textAlign: 'center'}}>Əməliyyatlar</span>
        </div>

        {ranks.map((item) => (
          <div key={item.id} className="table-row-rank">
            <span>{item.id}</span>
            <span>{item.name}</span>
            <span>{item.description}</span>
            <span className="actions-ranks">
              <FaEdit className="edit-icon-ranks" />
              <FaTrash className="delete-icon-ranks" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ranks;
