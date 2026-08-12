import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
  '#6366F1', // indigo
  '#84CC16', // lime
];

const formatCurrency = (value) => {
  if (!value) return '₹0';
  const num = Number(value);
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toFixed(0)}`;
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-theme-bg border border-theme-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-gray-200">{payload[0].name}</p>
        <p className="text-sm text-primary-400">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null; // Don't show label for small slices

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const ExpenseBreakdownChart = ({ data = [] }) => {

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-primary-400 mb-4">Expense Breakdown</h3>
        <div className="flex items-center justify-center h-64 text-theme-muted">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>No expense data available</p>
            <p className="text-sm mt-1">Add expenses to see breakdown by category</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-primary-400 mb-4">Expense Breakdown by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="amount"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={CustomTooltip} />
          <Legend 
            formatter={(value, entry) => (
              <span className="text-sm text-gray-300">
                {value}: {formatCurrency(entry.payload.amount)}
              </span>
            )}
            wrapperStyle={{
              paddingTop: '20px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpenseBreakdownChart;
