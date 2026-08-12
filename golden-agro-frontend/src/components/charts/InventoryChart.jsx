import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#D4AF37', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

const InventoryChart = ({ data, title = "Finished Goods Inventory" }) => {
  // Take top 7 items by quantity
  const chartData = [...(data || [])]
    .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
    .slice(0, 7);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-primary-400 mb-4">{title}</h3>
      <div className="h-72 min-h-[288px] w-full" style={{ minWidth: 0 }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" stroke="#888" fontSize={12} tick={{ fill: '#e5e5e5' }} />
              <YAxis type="category" dataKey="product" stroke="#888" fontSize={11} width={70} tick={{ fill: '#e5e5e5' }} />
              <Tooltip 
                formatter={(value) => [value, 'Quantity']}
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#e5e5e5' }}
              />
              <Bar dataKey="quantity" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-theme-muted">
            No inventory data available
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryChart;
