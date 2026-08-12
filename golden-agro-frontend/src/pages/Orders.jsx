import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../api/businessApi';
import { useAuth } from '../context/AuthContext';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Loading from '../components/common/Loading';
import StatusBadge from '../components/common/StatusBadge';
import toast from 'react-hot-toast';
import { Eye, Check, RefreshCw, CheckCircle, Phone } from 'lucide-react';

const Orders = () => {
  const { isManufacturer, isRetailer } = useAuth();
  const queryClient = useQueryClient();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data: orders, isLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      if (isRetailer) {
        const res = await orderApi.getMyOrders();
        return res?.data?.data ?? [];
      } else {
        const res = await orderApi.getAll();
        return res?.data?.data ?? [];
      }
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 5000,
    retry: false,
  });

  const confirmMutation = useMutation({
    mutationFn: (id) => orderApi.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order is now in progress');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to confirm order')
  });

  const completeMutation = useMutation({
    mutationFn: (id) => orderApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order marked as completed!');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to complete order')
  });

  const columns = [
    { key: 'retailerOrderId', label: 'Order ID' },
    { 
      key: 'retailer', 
      label: 'Retailer',
      render: (val) => (
        <div>
          <p className="font-medium">{val?.shopName || '-'}</p>
          {val?.phone && (
            <p className="text-xs text-theme-muted flex items-center gap-1">
              <Phone size={12} /> {val.phone}
            </p>
          )}
        </div>
      )
    },
    { 
      key: 'orderDate', 
      label: 'Date',
      render: (val) => new Date(val).toLocaleDateString()
    },
    { 
      key: 'totalAmount', 
      label: 'Total',
      render: (val) => `₹${val?.toFixed(2)}`
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => <StatusBadge status={val} />
    }
  ];

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary-400">Order history</h1>
          <p className="text-theme-muted text-sm mt-1">
            {isRetailer ? 'Your orders. Place new orders from Products → Add to cart → Checkout.' : 'All orders.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetchOrders()}
          className="btn-secondary flex items-center gap-2"
          title="Refresh list to see latest orders"
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="card">
        <Table
          columns={columns}
          data={orders || []}
          actions={(row) => (
            <div className="flex gap-2">
              <button 
                onClick={() => { setSelectedOrder(row); setViewModalOpen(true); }}
                className="text-primary-400 hover:text-primary-300"
                title="View"
              >
                <Eye size={18} />
              </button>
              {isManufacturer && row.status === 'pending' && (
                <button 
                  onClick={() => confirmMutation.mutate(row.retailerOrderId)}
                  className="text-green-400 hover:text-green-300"
                  title="Start Processing"
                >
                  <Check size={18} />
                </button>
              )}
              {isRetailer && row.status === 'in_progress' && (
                <button 
                  onClick={() => {
                    if (confirm('Mark this order as completed/delivered?')) {
                      completeMutation.mutate(row.retailerOrderId);
                    }
                  }}
                  className="text-green-400 hover:text-green-300 flex items-center gap-1"
                  title="Mark as Completed"
                >
                  <CheckCircle size={18} />
                  <span className="text-xs">Received</span>
                </button>
              )}
            </div>
          )}
        />
      </div>

      {/* View Order Modal */}
      <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title={`Order #${selectedOrder?.retailerOrderId}`}>
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-theme-muted">Retailer Shop</p>
                <p className="font-medium text-gray-200">{selectedOrder.retailer?.shopName}</p>
              </div>
              <div>
                <p className="text-sm text-theme-muted">Owner / Contact</p>
                <p className="font-medium text-gray-200">{selectedOrder.retailer?.ownerName || '-'}</p>
                {selectedOrder.retailer?.phone && (
                  <p className="text-sm text-theme-muted flex items-center gap-1">
                    <Phone size={14} /> {selectedOrder.retailer.phone}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-theme-muted">Date</p>
                <p className="font-medium text-gray-200">{new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-theme-muted">Status</p>
                <StatusBadge status={selectedOrder.status} />
              </div>
              <div>
                <p className="text-sm text-theme-muted">Total</p>
                <p className="font-medium text-gray-200">₹{selectedOrder.totalAmount?.toFixed(2)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-theme-muted mb-2">Items</p>
              <table className="min-w-full divide-y divide-theme-border">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-primary-400 table-header">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-primary-400 table-header">Qty</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-primary-400 table-header">Price</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-primary-400 table-header">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
                  {selectedOrder.items?.map((item, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2 text-gray-200">{item.product?.productName}</td>
                      <td className="px-4 py-2 text-gray-200">{item.quantity}</td>
                      <td className="px-4 py-2 text-gray-200">₹{item.price?.toFixed(2)}</td>
                      <td className="px-4 py-2 text-gray-200">₹{(item.quantity * item.price)?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;