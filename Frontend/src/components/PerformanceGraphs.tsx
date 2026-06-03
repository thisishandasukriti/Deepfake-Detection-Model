import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Box, Typography } from "@mui/material";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
);

const labels = ["v1", "v2", "v3", "v4", "v5", "v6"];

export default function PerformanceGraphs() {
  const accuracyPrecisionData = {
    labels,
    datasets: [
      {
        label: "Accuracy",
        data: [0.84, 0.85, 0.86, 0.87, 0.868, 0.869],
        borderColor: "#00C8FF",
        tension: 0.4,
      },
      {
        label: "Precision",
        data: [0.85, 0.86, 0.865, 0.87, 0.872, 0.874],
        borderColor: "#8C79FF",
        tension: 0.4,
      },
    ],
  };

  const recallData = {
    labels,
    datasets: [
      {
        label: "Recall",
        data: [0.83, 0.84, 0.85, 0.86, 0.864, 0.868],
        borderColor: "#34d399",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: { color: "#E5E7EB" },
      },
    },
    scales: {
      x: { ticks: { color: "#9CA3AF" } },
      y: {
        ticks: { color: "#9CA3AF" },
        min: 0.8,
        max: 0.9,
      },
    },
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, color: "#00C8FF" }}>
        Accuracy & Precision
      </Typography>
      <Line data={accuracyPrecisionData} options={options} />

      <Typography variant="h5" sx={{ mt: 6, mb: 2, color: "#8C79FF" }}>
        Recall
      </Typography>
      <Line data={recallData} options={options} />
    </Box>
  );
}
