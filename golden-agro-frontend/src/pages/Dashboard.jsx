import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { productApi, orderApi, retailerApi, rawMaterialApi, dashboardApi } from '../api/businessApi';
import { safeQueryData } from '../api/queryHelpers';
import { Package, ShoppingCart, Users, AlertTriangle, TrendingUp, TrendingDown, DollarSign, BarChart3, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import Loading from '../components/common/Loading';
import { SalesChart, ProfitLossChart, InventoryChart, OrderStatusChart, TopProductsChart, ExpenseBreakdownChart } from '../components/charts';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
  <div className="card flex items-center gap-4">
    <div className={`p-4 rounded-lg ${color}`}>
      {React.createElement(Icon, { size: 24, className: 'text-white' })}
    </div>
    <div className="flex-1">
      <p className="text-theme-muted text-sm">{title}</p>
      <p className="text-2xl font-bold text-gray-100">{value}</p>
      {trend && (
        <p className={`text-xs flex items-center gap-1 ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trendValue}
        </p>
      )}
    </div>
  </div>
);

const Dashboard = () => {
  const { user, isManufacturer, isRetailer } = useAuth();
  const [lastSeenPendingOrders, setLastSeenPendingOrders] = useState(() =>
    Number(localStorage.getItem('pendingOrdersSeen') || '0')
  );

  // Existing queries
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['products', 'active'],
    queryFn: () => safeQueryData(() => productApi.getActive()),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
  });

  const { data: orders, isLoading: loadingOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => isRetailer 
      ? safeQueryData(() => orderApi.getMyOrders())
      : safeQueryData(() => orderApi.getAll())
  });

  const { data: retailers } = useQuery({
    queryKey: ['retailers'],
    queryFn: () => safeQueryData(() => retailerApi.getActive()),
    enabled: isManufacturer
  });

  const { data: lowStock } = useQuery({
    queryKey: ['lowStock'],
    queryFn: () => safeQueryData(() => rawMaterialApi.getLowStock()),
    enabled: isManufacturer
  });

  // New dashboard analytics queries
  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => safeQueryData(() => dashboardApi.getStats(), null),
    enabled: isManufacturer
  });

  const { data: salesTrend } = useQuery({
    queryKey: ['salesTrend'],
    queryFn: () => safeQueryData(() => dashboardApi.getSalesTrend()),
    enabled: isManufacturer
  });

  const { data: profitTrend } = useQuery({
    queryKey: ['profitTrend'],
    queryFn: () => safeQueryData(() => dashboardApi.getProfitTrend()),
    enabled: isManufacturer
  });

  const { data: inventory } = useQuery({
    queryKey: ['inventoryLevels'],
    queryFn: () => safeQueryData(() => dashboardApi.getInventory()),
    enabled: isManufacturer
  });

  const { data: orderStatus } = useQuery({
    queryKey: ['orderStatus'],
    queryFn: () => safeQueryData(() => dashboardApi.getOrderStatus()),
    enabled: isManufacturer
  });

  const { data: topProducts } = useQuery({
    queryKey: ['topProducts'],
    queryFn: () => safeQueryData(() => dashboardApi.getTopProducts()),
    enabled: isManufacturer
  });

  const { data: expenseBreakdown } = useQuery({
    queryKey: ['expenseBreakdown'],
    queryFn: () => safeQueryData(() => dashboardApi.getExpenseBreakdown()),
    enabled: isManufacturer
  });

  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;

  // Persist that the user has "seen" the current pending count.
  // Visibility is derived from lastSeenPendingOrders so we don't set state in effects.
  useEffect(() => {
    if (!isManufacturer) return;
    if (!orders) return;

    if (pendingOrders > lastSeenPendingOrders) {
      localStorage.setItem('pendingOrdersSeen', String(pendingOrders));
    }
  }, [isManufacturer, orders, pendingOrders, lastSeenPendingOrders]);

  if (loadingProducts || loadingOrders) return <Loading />;
  const formatCurrency = (value) => {
    if (!value) return '₹0';
    const num = Number(value);
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num.toFixed(0)}`;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-400 mb-2">Dashboard</h1>
      <p className="text-theme-muted mb-6">Welcome back, {user?.firstName}!</p>

      {/* New Orders Alert - Only for Manufacturer */}
      {isManufacturer && pendingOrders > 0 && pendingOrders > lastSeenPendingOrders && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-full">
              <Bell size={24} className="text-yellow-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-yellow-400 font-semibold">🔔 New Orders Waiting!</h3>
              <p className="text-yellow-300/80 text-sm">
                You have <span className="font-bold">{pendingOrders}</span> pending order{pendingOrders > 1 ? 's' : ''} from retailers that need your attention.
              </p>
            </div>
          </div>
          <Link
            to="/app/orders"
            onClick={() => setLastSeenPendingOrders(pendingOrders)}
            className="btn-primary bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            View Orders
          </Link>
        </div>
      )}

      {/* Financial Stats - Only for Manufacturer */}
      {isManufacturer && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Sales (This Month)"
            value={formatCurrency(stats.totalSales)}
            icon={DollarSign}
            color="bg-green-500"
          />
          <StatCard
            title="Total Purchases"
            value={formatCurrency(stats.totalPurchases)}
            icon={ShoppingCart}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Expenses"
            value={formatCurrency(stats.totalExpenses)}
            icon={BarChart3}
            color="bg-orange-500"
          />
          <StatCard
            title="Profit/Loss"
            value={formatCurrency(stats.profitLoss)}
            icon={stats.profitLoss >= 0 ? TrendingUp : TrendingDown}
            color={stats.profitLoss >= 0 ? 'bg-emerald-500' : 'bg-red-500'}
          />
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Products"
          value={products?.length || 0}
          icon={Package}
          color="bg-blue-500"
        />
        <StatCard
          title="Pending Orders"
          value={pendingOrders}
          icon={ShoppingCart}
          color="bg-yellow-500"
        />
        {isManufacturer && (
          <>
            <StatCard
              title="Active Retailers"
              value={retailers?.length || 0}
              icon={Users}
              color="bg-green-500"
            />
            <StatCard
              title="Low Stock Items"
              value={lowStock?.length || 0}
              icon={AlertTriangle}
              color="bg-red-500"
            />
          </>
        )}
      </div>

      {/* Charts - Only for Manufacturer */}
      {isManufacturer && (
        <>
          {/* Sales & Profit Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <SalesChart data={salesTrend || []} />
            <ProfitLossChart data={profitTrend || []} />
          </div>

          {/* Inventory & Order Status Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <InventoryChart data={inventory || []} />
            <OrderStatusChart data={orderStatus || []} />
          </div>

          {/* Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <TopProductsChart data={topProducts || []} />
            <ExpenseBreakdownChart data={expenseBreakdown || []} />
            
            {/* Recent Orders Table */}
            <div className="card">
              <h3 className="text-lg font-semibold text-primary-400 mb-4">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-theme-border">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 table-header">Order ID</th>
                      <th className="px-4 py-3 table-header">Date</th>
                      <th className="px-4 py-3 table-header">Status</th>
                      <th className="px-4 py-3 table-header">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-theme-border">
                    {orders?.slice(0, 5).map((order) => (
                      <tr key={order.retailerOrderId}>
                        <td className="px-4 py-3 text-sm text-gray-200">#{order.retailerOrderId}</td>
                        <td className="px-4 py-3 text-sm text-gray-200">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            order.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                            order.status === 'shipped' ? 'bg-purple-500/20 text-purple-400' :
                            order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-200">₹{order.totalAmount?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Retailer View - Simple Orders Table */}
      {isRetailer && (
        <div className="card">
          <h2 className="text-lg font-semibold text-primary-400 mb-4">My Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-theme-border">
              <thead>
                <tr>
                  <th className="px-6 py-3 table-header">Order ID</th>
                  <th className="px-6 py-3 table-header">Date</th>
                  <th className="px-6 py-3 table-header">Status</th>
                  <th className="px-6 py-3 table-header">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {orders?.slice(0, 10).map((order) => (
                  <tr key={order.retailerOrderId}>
                    <td className="px-6 py-4 text-gray-200">#{order.retailerOrderId}</td>
                    <td className="px-6 py-4 text-gray-200">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        order.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' :
                        order.status === 'shipped' ? 'bg-purple-500/20 text-purple-400' :
                        order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-200">₹{order.totalAmount?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
