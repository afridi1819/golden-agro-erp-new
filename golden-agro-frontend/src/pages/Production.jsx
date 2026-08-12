import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productionApi, productApi } from '../api/businessApi';
import { safeQueryData } from '../api/queryHelpers';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Loading from '../components/common/Loading';
import StatusBadge from '../components/common/StatusBadge';
import toast from 'react-hot-toast';
import { Plus, Play, CheckCircle } from 'lucide-react';

const Production = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ productId: '', quantity: '' });

  const { data: productionOrders, isLoading } = useQuery({
    queryKey: ['production'],
    queryFn: () => safeQueryData(() => productionApi.getAll())
  });

  const { data: products } = useQuery({
    queryKey: ['products', 'active'],
    queryFn: () => safeQueryData(() => productApi.getActive()),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
  });

  const createMutation = useMutation({
    mutationFn: (data) => productionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['production']);
      toast.success('Production order created');
      setModalOpen(false);
      setFormData({ productId: '', quantity: '' });
    }
  });

  const startMutation = useMutation({
    mutationFn: (id) => productionApi.start(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['production']);
      toast.success('Production started');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to start production')
  });

  const completeMutation = useMutation({
    mutationFn: (id) => productionApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['production']);
      toast.success('Production completed');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      productId: parseInt(formData.productId),
      quantity: parseInt(formData.quantity)
    });
  };

  const columns = [
    { key: 'productionOrderId', label: 'ID' },
    { key: 'product', label: 'Product', render: (val) => val?.productName },
    { key: 'quantity', label: 'Quantity' },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    { 
      key: 'createdAt', 
      label: 'Created',
      render: (val) => new Date(val).toLocaleDateString()
    },
    { 
      key: 'completedAt', 
      label: 'Completed',
      render: (val) => val ? new Date(val).toLocaleDateString() : '-'
    }
  ];

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-400">Production Orders</h1>
        <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> New Production
        </button>
      </div>

      <div className="card">
        <Table
          columns={columns}
          data={productionOrders || []}
          actions={(row) => (
            <div className="flex gap-2">
              {row.status === 'pending' && (
                <button 
                  onClick={() => startMutation.mutate(row.productionOrderId)}
                  className="text-primary-400 hover:text-primary-300"
                  title="Start Production"
                >
                  <Play size={18} />
                </button>
              )}
              {row.status === 'in_progress' && (
                <button 
                  onClick={() => completeMutation.mutate(row.productionOrderId)}
                  className="text-green-400 hover:text-green-300"
                  title="Complete Production"
                >
                  <CheckCircle size={18} />
                </button>
              )}
            </div>
          )}
        />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Production Order">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-1">Product</label>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Select Product</option>
              {products?.map((p) => (
                <option key={p.productId} value={p.productId}>{p.productName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-1">Quantity</label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="input-field"
              min="1"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Production;