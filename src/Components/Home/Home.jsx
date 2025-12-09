import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import api from "../../api";
import './Home.css'

export default function Home() {
  const [mainData, setMainData] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [filters, setFilters] = useState({
    text: "",
    ranks: [],
    departments: [],
    units: [],
    accountTypes: [],
    accountStatus: []
  });

  const statusRef = useRef(null);
  const typeRef = useRef(null);
  const statusChartRef = useRef(null);
  const typeChartRef = useRef(null);

  const callData = async () => {
    const token = localStorage.getItem('myUserDutyToken');
    if (!token) return;

    const hdrs = { headers: { Authorization: `Bearer ${token}` } };

    try {
      const req = {
        searchData: filters.text,
        ranks: filters.ranks,
        departmentIds: filters.departments,
        unitIds: filters.units,
        accountTypeIds: filters.accountTypes,
        accountStatusIds: filters.accountStatus,
        newToOld: true
      };

      const res = await api.post('/admin/client/getAllClients', req, {
        ...hdrs,
        params: { page, pageSize }
      });

      const data = res?.data?.data || [];
      setMainData(data);

      if (!data.length) return;

      const statusCounts = data.reduce((acc, x) => {
        const status = x?.accountStatus?.status ?? "unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const typeCounts = data.reduce((acc, x) => {
        const rawType = x?.accountType?.name;
        const type = (rawType && rawType.trim() !== "") ? rawType.trim() : "QeyriMueyyen";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      const typeLabels = Object.keys(typeCounts);

      if (statusChartRef.current) statusChartRef.current.destroy();
      if (typeChartRef.current) typeChartRef.current.destroy();

      const statusArr = [];
      Object.keys(statusCounts).forEach((e) => {
        if (e.toLocaleLowerCase() == "deleted") {
          statusArr.push("Silinmiş")
        }
        else if (e.toLocaleLowerCase() == "deactive") {
          statusArr.push("Deaktiv")
        }
        else if (e.toLocaleLowerCase() == "unconfidential") {
          statusArr.push("Qeyri Məxfi")
        }
        else if (e.toLocaleLowerCase() == "active") {
          statusArr.push("Aktiv")
        }
        else if (e.toLocaleLowerCase() == "confidential") {
          statusArr.push("Məxfi")
        }
      })
      statusChartRef.current = new Chart(statusRef.current, {
        type: "pie",
        data: {
          labels: statusArr,
          datasets: [{ data: Object.values(statusCounts), backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0", "#189341ff"] }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });



      const colors = [
        "#6f36ebff", "#ff63aeff", "#ffaa56ff", "#0b6b6bff",
        "#eb3645ff", "#146e0dff", "#e5ed52ff", "#0b0e6bff"
      ];


      if (typeChartRef.current) {
        typeChartRef.current.destroy();
      }

      const typeKeys = Object.keys(typeCounts);
      const typeValues = Object.values(typeCounts);

      const datasets = typeKeys.map((key, i) => ({
        label: key,             
        data: typeValues.map((_, j) => j === i ? typeValues[i] : 0), 
        backgroundColor: colors[i % colors.length]
      }));

      typeChartRef.current = new Chart(typeRef.current, {
        type: 'bar',
        data: { labels: typeKeys, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true } }
        }
      });

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    callData();
  }, [filters]);

  return (
    <div className="charts-wrapper">
      <div className="chart-box">
        <canvas ref={statusRef}></canvas>
      </div>
      <div className="chart-box">
        <canvas ref={typeRef}></canvas>
      </div>
    </div>
  );
}
