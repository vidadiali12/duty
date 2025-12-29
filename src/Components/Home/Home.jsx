import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import api from "../../api";
import "./Home.css";
import Profile from "../Modals/Profile";

const MODERN_50_COLORS = [
  "#FF6B6B", "#4ECDC4", "#FFD93D", "#6C5CE7", "#FF9F43",
  "#1DD1A1", "#54A0FF", "#F368E0", "#00D2D3", "#Feca57",
  "#FF8C42", "#5F27CD", "#48DBFB", "#FF6F91", "#10AC84",
  "#C77DFF", "#FFB703", "#3EC1D3", "#F72585", "#4D96FF",
  "#FB5607", "#8338EC", "#00BBF9", "#FF006E", "#06D6A0",
  "#FFD166", "#118AB2", "#EF476F", "#7B2CBF", "#80ED99",
  "#F77F00", "#9D4EDD", "#43AA8B", "#FF5D8F", "#3A86FF",
  "#FF4C4C", "#1FDA9A", "#FFE74C", "#9D94FF", "#FFB86C",
  "#32E2B4", "#70B8FF", "#F58FEF", "#00F7F9", "#FFD3A5",
  "#FF9E66", "#6F4FF2", "#5FE3FF", "#FF8ABF", "#3D9EFF",
  "#FF7849", "#A66CFF", "#00D0FF", "#FF3D8F", "#08E8B2",
];

const UNIT_300_COLORS = [
  "#FF6B6B", "#4ECDC4", "#FFD93D", "#6C5CE7", "#FF9F43",
  "#1DD1A1", "#54A0FF", "#F368E0", "#00D2D3", "#Feca57",
  "#FF8C42", "#5F27CD", "#48DBFB", "#FF6F91", "#10AC84",
  "#C77DFF", "#FFB703", "#3EC1D3", "#F72585", "#4D96FF",
  "#FB5607", "#8338EC", "#00BBF9", "#FF006E", "#06D6A0",
  "#FFD166", "#118AB2", "#EF476F", "#7B2CBF", "#80ED99",
  "#F77F00", "#9D4EDD", "#43AA8B", "#FF5D8F", "#3A86FF",
  "#FF4C4C", "#1FDA9A", "#FFE74C", "#9D94FF", "#FFB86C",
  "#32E2B4", "#70B8FF", "#F58FEF", "#00F7F9", "#FFD3A5",
  "#FF9E66", "#6F4FF2", "#5FE3FF", "#FF8ABF", "#3D9EFF",
  "#FF7849", "#A66CFF", "#00D0FF", "#FF3D8F", "#08E8B2",
  "#FFE066", "#0F9DE8", "#FF5C83", "#8D3DAF", "#99E2B4",
  "#FFB3A5", "#FF6F91", "#4AD991", "#FFD97D", "#7A5FFF",
  "#FFAB3D", "#00CFFF", "#FF2D6D", "#34D399", "#FFC870",
  "#0A84FF", "#FF385D", "#9C4DFF", "#6EE7B7", "#FFD1BA",
  "#FF87A2", "#3FE8B5", "#FFE28A", "#8C6FFF", "#FF9F5D",
  "#00B4FF", "#FF1E4D", "#2DD4BF", "#FFF59D", "#0066FF",
  "#FF1744", "#B76DFF", "#A2F5BF", "#FFD6A5", "#FF6E8B",
  "#5EF1E6", "#FFF176", "#3380FF", "#FF0033", "#D27AFF",
  "#C1F0E8", "#FFE0C1", "#FF5C7C", "#81F4D0", "#FFECB3",
];

console.log(UNIT_300_COLORS)

export default function Home({ userInfo, setUserInfo, setResponseRequest }) {
  const [statuses, setStatuses] = useState([]);
  const [selectedStatusId, setSelectedStatusId] = useState(null);
  const [departmentOrders, setDepartmentOrders] = useState([]);
  const [selectedDepartmentOrder, setSelectedDepartmentOrder] = useState(null);
  const [unitOrders, setUnitOrders] = useState([]);
  const [selectedUnitOrder, setSelectedUnitOrder] = useState(null);
  const [showProfile, setShowProfile] = useState(true);

  const typeChartRef = useRef(null);
  const statusChartRef = useRef(null);
  const depChartRef = useRef(null);
  const unitChartRef = useRef(null);

  const typeCanvas = useRef(null);
  const statusCanvas = useRef(null);
  const depCanvas = useRef(null);
  const unitCanvas = useRef(null);

  const token = localStorage.getItem("myUserDutyToken");
  const headers = { headers: { Authorization: `Bearer ${token}` } };

  const getStatuses = async () => {
    const res = await api.get("/general/status/getAllStatus", headers);
    setStatuses(res.data.data);
  };

  const getDepartmentOrders = async () => {
    const res = await api.get("/statistics/order/department/getAllOrder", headers);
    setDepartmentOrders(res.data.data);
  };

  const getUnitOrders = async () => {
    const res = await api.get("/statistics/order/unit/getAllOrder", headers);
    setUnitOrders(res.data.data);
  };

  const accountTypeChart = async () => {
    const res = await api.post(
      "/statistics/common/accountTypeCount",
      selectedStatusId ? { statusId: selectedStatusId } : {},
      headers
    );

    const labels = res.data.data.map(x => x.accountType);
    const values = res.data.data.map(x => x.count);

    if (typeChartRef.current) typeChartRef.current.destroy();

    typeChartRef.current = new Chart(typeCanvas.current, {
      type: "pie",
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: MODERN_50_COLORS.slice(0, labels.length)
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  };

  const statusDoughnutChart = async () => {
    const res = await api.post(
      "/statistics/common/countByAccountStatus",
      selectedStatusId ? { statusId: selectedStatusId } : {},
      headers
    );

    const labels = res.data.data.map(x => x.status);
    const counts = res.data.data.map(x => x.count);
    const register = res.data.data.map(x => x.registerCount);
    const unRegister = res.data.data.map(x => x.unRegisterCount);

    if (statusChartRef.current) statusChartRef.current.destroy();

    statusChartRef.current = new Chart(statusCanvas.current, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: counts,
            backgroundColor: MODERN_50_COLORS.slice(0, labels.length)
          },
          {
            data: [...register, ...unRegister],
            backgroundColor: ["#22C55E", "#EF4444"]
          }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: "45%" }
    });
  };

  const departmentChart = async () => {
    const order = departmentOrders.find(x => x.id === selectedDepartmentOrder);
    const res = await api.post(
      "/statistics/common/accountTypeCountByDepartment",
      {
        departmentOrderIds: order?.departmentIds,
        statusId: selectedStatusId
      },
      headers
    );

    const labels = res.data.data.map(x => x.departmentTag);
    const canvasMinWidth = Math.max(labels.length * 120, 900);
    depCanvas.current.style.minWidth = canvasMinWidth + "px";

    const keys = Object.keys(res.data.data[0]?.accountTypeWithCount || {});

    const datasets = keys.map((k, i) => ({
      label: k,
      data: res.data.data.map(x => x.accountTypeWithCount[k] || 0),
      backgroundColor: MODERN_50_COLORS[i % MODERN_50_COLORS.length]
    }));

    if (depChartRef.current) depChartRef.current.destroy();

    depChartRef.current = new Chart(depCanvas.current, {
      type: "bar",
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "x",
        scales: {
          x: {
            stacked: true,
            categoryPercentage: 0.6,
            barPercentage: 0.9,      
            maxBarThickness: 60 
          },
          y: {
            stacked: true,
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            position: "left",
            align: "center",
            labels: {
              boxWidth: 14,
              boxHeight: 14,
              padding: 12,
              font: {
                size: 12,
                weight: "500"
              }
            }
          }
        },
        layout: {
          padding: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10
          }
        }
      }
    });
  };

  const unitChart = async () => {
    const order = unitOrders.find(x => x.id === selectedUnitOrder);
    const res = await api.post(
      "/statistics/common/accountTypeCountByUnit",
      {
        unitOrderIds: order?.unitIds,
        statusId: selectedStatusId
      },
      headers
    );

    const labels = res.data.data.map(x => x.unitTag);
    const canvasMinWidth = Math.max(labels.length * 120, 900);
    unitCanvas.current.style.minWidth = canvasMinWidth + "px";

    const keys = Object.keys(res.data.data[0]?.accountTypeWithCount || {});

    const datasets = keys.map((k, i) => ({
      label: k,
      data: res.data.data.map(x => x.accountTypeWithCount[k] || 0),
      backgroundColor: UNIT_300_COLORS[i]
    }));

    if (unitChartRef.current) unitChartRef.current.destroy();

    unitChartRef.current = new Chart(unitCanvas.current, {
      type: "bar",
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "x",
        scales: {
          x: {
            stacked: true,
            categoryPercentage: 0.6,
            barPercentage: 0.9,      
            maxBarThickness: 60 
          },
          y: {
            stacked: true,
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            position: "left",
            align: "center",
            labels: {
              boxWidth: 14,
              boxHeight: 14,
              padding: 10,
              font: {
                size: 11
              }
            }
          }
        },
        layout: {
          padding: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10
          }
        }
      }
    });
  };

  useEffect(() => {
    getStatuses();
    getDepartmentOrders();
    getUnitOrders();
  }, []);

  useEffect(() => {
    accountTypeChart();
    statusDoughnutChart();
    departmentChart();
    unitChart();
  }, [selectedStatusId, selectedDepartmentOrder, selectedUnitOrder]);

  if (userInfo?.shouldChangePassword) {
    return (
      <Profile
        userInfo={userInfo}
        setUserInfo={setUserInfo}
        setShowProfile={setShowProfile}
        setResponseRequest={setResponseRequest}
      />
    );
  }

  return (
    <div className="charts-wrapper">
      <div className="filters-bar">
        <select onChange={e => setSelectedStatusId(+e.target.value)}>
          <option value="">Bütün Statuslar</option>
          {statuses.map(s => <option key={s.id} value={s.id}>{s.status}</option>)}
        </select>

        <select onChange={e => setSelectedDepartmentOrder(+e.target.value)}>
          <option value="">Bütün İdarələr</option>
          {departmentOrders.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>

        <select onChange={e => setSelectedUnitOrder(+e.target.value)}>
          <option value="">Bütün Bölmələr</option>
          {unitOrders.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>

      <div className="top-charts">
        <div className="chart-box-main chart-box-circle">
          <h1>Hesab növləri</h1>
          <div className="chart-box ">
            <canvas ref={typeCanvas} />
          </div>
        </div>
        <div className="chart-box-main chart-box-circle">
          <h1>Bütün Statuslar</h1>
          <div className="chart-box">
            <canvas ref={statusCanvas} />
          </div>
        </div>
      </div>


      <div className="chart-box-main">
        <h1>İdarələr</h1>
        <div className="chart-box ">
          <canvas ref={depCanvas} />
        </div>
      </div>

      <div className="chart-box-main ">
        <h1>Bölmələr</h1>
        <div className="chart-box full">
          <canvas ref={unitCanvas} />
        </div>
      </div>
    </div>
  );
}
