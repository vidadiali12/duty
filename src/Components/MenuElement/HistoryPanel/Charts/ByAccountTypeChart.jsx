import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function ByAccountTypeChart({ data }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        console.log(data)
        if (!data || !data.actionCount) return;

        const labels = Object.keys(data.actionCount);
        const values = Object.values(data.actionCount);

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
                        backgroundColor: "rgba(111,95,240,0.7)"
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });

        return () => chartRef.current?.destroy();
    }, [data]);

    return (
        <div style={{ height: "350px", background: "#fff", borderRadius: "14px", padding: "20px" }}>
            <canvas ref={canvasRef} />
        </div>
    );
}
