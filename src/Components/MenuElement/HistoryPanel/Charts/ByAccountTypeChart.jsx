import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function ByAccountTypeChart({ data }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
    if (!data || !data.actionCount || !canvasRef.current) return;

    const labels = Object.keys(data.actionCount);
    const values = Object.values(data.actionCount);

    requestAnimationFrame(() => {
        if (chartRef.current) {
            chartRef.current.destroy();
        }

        chartRef.current = new Chart(canvasRef.current, {
            type: "bar",
            data: {
                labels,
                datasets: [
                    {
                        label: data.accountTypeName,
                        data: values,
                        borderRadius: 8,
                        backgroundColor: "#6f5ff0"
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 }
                    }
                }
            }
        });
        chartRef.current.resize();
    });

    return () => chartRef.current?.destroy();
}, [data]);


    return (
        <div style={{ height: "350px", background: "#fff", borderRadius: "14px", padding: "20px" }}>
            <canvas ref={canvasRef} />
        </div>
    );
}
