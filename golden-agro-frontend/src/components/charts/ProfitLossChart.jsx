import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const ProfitLossChart = ({ data }) => {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-primary-400 mb-4">Profit & Loss (Last 6 Months)</h3>
      <div className="h-72 min-h-[288px] w-full" style={{ minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="month" stroke="#888" fontSize={12} tick={{ fill: '#e5e5e5' }} />
            <YAxis stroke="#888" fontSize={12} tick={{ fill: '#e5e5e5' }} tickFormatter={(value) => `₹${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}`} />
            <Tooltip 
              formatter={(value) => `₹${Number(value).toLocaleString()}`}
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#e5e5e5' }}
            />
            <Legend wrapperStyle={{ color: '#e5e5e5' }} />
            <ReferenceLine y={0} stroke="#666" />
            <Bar dataKey="revenue" name="Revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="profit" name="Profit" fill="#D4AF37" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProfitLossChart;
