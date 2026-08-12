import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SalesChart = ({ data }) => {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-primary-400 mb-4">Sales Trend (Last 6 Months)</h3>
      <div className="h-72 min-h-[288px] w-full" style={{ minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="month" stroke="#888" fontSize={12} tick={{ fill: '#e5e5e5' }} />
            <YAxis stroke="#888" fontSize={12} tick={{ fill: '#e5e5e5' }} tickFormatter={(value) => `₹${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}`} />
            <Tooltip 
              formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Sales']}
              contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#e5e5e5' }}
            />
            <Area type="monotone" dataKey="sales" stroke="#D4AF37" fillOpacity={1} fill="url(#colorSales)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;
