import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const STATUS_COLORS = {
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  shipped: '#8B5CF6',
  delivered: '#10B981',
  cancelled: '#EF4444',
};

const OrderStatusChart = ({ data }) => {
  const chartData = (data || []).map(item => ({
    ...item,
    name: item.status?.charAt(0).toUpperCase() + item.status?.slice(1) || 'Unknown',
  }));

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-primary-400 mb-4">Order Status Distribution</h3>
      <div className="h-72 min-h-[288px] w-full" style={{ minWidth: 0 }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="count"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={STATUS_COLORS[entry.status] || '#D4AF37'} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [value, 'Orders']}
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#e5e5e5' }}
              />
              <Legend wrapperStyle={{ color: '#e5e5e5' }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-theme-muted">
            No order data available
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStatusChart;
