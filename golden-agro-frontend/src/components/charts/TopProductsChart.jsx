import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TopProductsChart = ({ data }) => {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-primary-400 mb-4">Top Selling Products</h3>
      <div className="h-72 min-h-[288px] w-full" style={{ minWidth: 0 }}>
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="product" 
                stroke="#888" 
                fontSize={11} 
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
                tick={{ fill: '#e5e5e5' }}
              />
              <YAxis stroke="#888" fontSize={12} tick={{ fill: '#e5e5e5' }} />
              <Tooltip 
                formatter={(value) => [value, 'Units Sold']}
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#e5e5e5' }}
              />
              <Bar dataKey="quantity" fill="#D4AF37" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-theme-muted">
            No sales data available
          </div>
        )}
      </div>
    </div>
  );
};

export default TopProductsChart;
