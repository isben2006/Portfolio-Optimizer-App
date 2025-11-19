import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import "./App.css";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#B084CC",
  "#FF6666",
  "#6A5ACD",
  "#20B2AA",
];

export default function PiePage({ data }) {
  if (!data || !data.weights) return null;

  const pieData = data.weights.map((w, i) => ({
    name: data.tickers[i] || `Ticker ${i + 1}`,
    value: Math.ceil(w * 100) || 0,
  }));

  return (
    <div className="chart-container">
      <h2>Portfolio Allocation</h2>
      <PieChart width={500} height={500}>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={140}
          label={({ name, value }) => `${name}: ${value}%`}
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value}%`} />
        <Legend />
      </PieChart>
    </div>
  );
}
