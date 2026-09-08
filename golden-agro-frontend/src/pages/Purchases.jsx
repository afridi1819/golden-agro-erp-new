import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { purchaseApi, supplierApi, rawMaterialApi } from '../api/businessApi';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Loading from '../components/common/Loading';
import StatusBadge from '../components/common/StatusBadge';
import toast from 'react-hot-toast';
import { Plus, CheckCircle, X, RefreshCw, Eye, Edit, Ban } from 'lucide-react';

const Purchases = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editingPurchaseId, setEditingPurchaseId] = useState(null);
  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState([{ rawMaterialId: '', quantity: 1, price: '' }]);

  const { data: purchases, isLoading, refetch: refetchPurchases } = useQuery({
    queryKey: ['purchases'],
    queryFn: async () => {
      const res = await purchaseApi.getAll();
      return res?.data?.data ?? [];
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 5000,
    retry: false,
  });

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const res = await supplierApi.getAll();
      return res?.data?.data ?? [];
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    retry: false,
  });

  const { data: rawMaterials } = useQuery({
    queryKey: ['rawMaterials'],
    queryFn: async () => {
      const res = await rawMaterialApi.getAll();
      return res?.data?.data ?? [];
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (data) => purchaseApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['purchases']);
      toast.success('Purchase created');
      setModalOpen(false);
      resetForm();
    }
  });

  const completeMutation = useMutation({
    mutationFn: (id) => purchaseApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['purchases']);
      queryClient.invalidateQueries(['rawMaterials']);
      // purchase completion now also creates an Expense in the backend
      queryClient.invalidateQueries(['expenses']);
      queryClient.invalidateQueries(['dashboardStats']);
      queryClient.invalidateQueries(['profitTrend']);
      queryClient.invalidateQueries(['expenseBreakdown']);
      toast.success('Purchase completed - Stock updated');
    }
  });
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {


      return purchaseApi.update(id, data);
    },

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ['purchases']
      });

      toast.success('Purchase updated');

      setModalOpen(false);

      resetForm();

      setEditMode(false);

      setEditingPurchaseId(null);
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update purchase'
      );
    }
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => purchaseApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['purchases']);
      toast.success('Purchase cancelled');
    }
  });

  const handleEdit = (purchase) => {
    setEditMode(true);
    setEditingPurchaseId(purchase.purchaseId);

    setSupplierId(
      purchase.supplier?.supplierId?.toString() || ''
    );



    setItems(
      purchase.items.map(item => ({
        rawMaterialId:
          item.rawMaterial?.rawMaterialId?.toString(),
        quantity: item.quantity,
        price: item.pricePerUnit
      }))
    );

    setModalOpen(true);
  };

  const resetForm = () => {
    setSupplierId('');
    setItems([{ rawMaterialId: '', quantity: 1, price: '' }]);

    setEditMode(false);
    setEditingPurchaseId(null);
  };

  const addItem = () => setItems([...items, { rawMaterialId: '', quantity: 1, price: '' }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => {
    const updated = [...items];
    updated[i][field] = value;
    setItems(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      supplierId: parseInt(supplierId),
      items: items.map(item => ({
        rawMaterialId: parseInt(item.rawMaterialId),
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price)
      }))
    };

    if (editMode) {
      updateMutation.mutate({
        id: editingPurchaseId,
        data: payload
      });
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-primary-400">Purchases</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetchPurchases()}
            className="btn-secondary flex items-center gap-2"
            title="Refresh list to see latest purchases"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2"><Plus size={20} /> New Purchase</button>
        </div>
      </div>

      <div className="card">
        <Table
          columns={[
            { key: 'purchaseId', label: 'ID' },
            { key: 'supplier', label: 'Supplier', render: (val) => val?.supplierName },
            { key: 'purchaseDate', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
            { key: 'totalAmount', label: 'Total', render: (val) => `₹${val?.toFixed(2)}` },
            { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> }
          ]}
          data={purchases || []}
          actions={(row) => (
            <div className="flex gap-2">

              {/* View */}
              <button
                onClick={() => {
                  setSelectedPurchase(row);
                  setViewModalOpen(true);
                }}
                className="text-primary-400 hover:text-primary-300"
                title="View Details"
              >
                <Eye size={18} />
              </button>

              {/* Edit */}
              {row.status === 'pending' && (
                <button
                  onClick={() => handleEdit(row)}
                  className="text-blue-400 hover:text-blue-300"
                  title="Edit Purchase"
                >
                  <Edit size={18} />
                </button>
              )}

              {/* Cancel */}
              {row.status === 'pending' && (
                <button
                  onClick={() => cancelMutation.mutate(row.purchaseId)}
                  className="text-red-400 hover:text-red-300"
                  title="Cancel Purchase"
                >
                  <Ban size={18} />
                </button>
              )}

              {/* Complete */}
              {row.status === 'pending' && (
                <button
                  onClick={() => completeMutation.mutate(row.purchaseId)}
                  className="text-green-400 hover:text-green-300"
                  title="Complete Purchase"
                >
                  <CheckCircle size={18} />
                </button>
              )}

            </div>
          )}
        />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editMode ? "Edit Purchase" : "New Purchase"} size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-1">Supplier</label>
            <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="input-field" required>
              <option value="">Select Supplier</option>
              {suppliers?.map(s => <option key={s.supplierId} value={s.supplierId}>{s.supplierName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-2">Items</label>
            {items.map((item, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <select value={item.rawMaterialId} onChange={(e) => updateItem(i, 'rawMaterialId', e.target.value)} className="input-field flex-1" required>
                  <option value="">Select Material</option>
                  {rawMaterials?.map(m => <option key={m.rawMaterialId} value={m.rawMaterialId}>{m.materialName}</option>)}
                </select>
                <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} className="input-field w-20" min="1" required />
                <input type="number" placeholder="Price" value={item.price} onChange={(e) => updateItem(i, 'price', e.target.value)} className="input-field w-24" step="0.01" required />
                {items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-300"><X size={20} /></button>}
              </div>
            ))}
            <button type="button" onClick={addItem} className="text-primary-400 text-sm hover:text-primary-300">+ Add Item</button>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editMode ? "Update" : "Create"}</button>
          </div>
        </form>
      </Modal>

      {/* View Purchase Details Modal */}
      <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title={`Purchase #${selectedPurchase?.purchaseId}`} size="lg">
        {selectedPurchase && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-theme-muted">Supplier</p>
                <p className="font-medium text-gray-200">{selectedPurchase.supplier?.supplierName}</p>
              </div>
              <div>
                <p className="text-sm text-theme-muted">Date</p>
                <p className="font-medium text-gray-200">{new Date(selectedPurchase.purchaseDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-theme-muted">Status</p>
                <StatusBadge status={selectedPurchase.status} />
              </div>
              <div>
                <p className="text-sm text-theme-muted">Total Amount</p>
                <p className="font-medium text-gray-200">₹{selectedPurchase.totalAmount?.toFixed(2)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-theme-muted mb-2">Purchase Items</p>
              <table className="min-w-full divide-y divide-theme-border">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-primary-400 table-header">Raw Material</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-primary-400 table-header">Quantity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-primary-400 table-header">Price/Unit</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-primary-400 table-header">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme-border">
                  {selectedPurchase.items?.map((item, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2 text-gray-200">{item.rawMaterial?.materialName || 'N/A'}</td>
                      <td className="px-4 py-2 text-gray-200">{item.quantity}</td>
                      <td className="px-4 py-2 text-gray-200">₹{item.pricePerUnit?.toFixed(2)}</td>
                      <td className="px-4 py-2 text-gray-200">₹{item.totalPrice?.toFixed(2) || (item.quantity * item.pricePerUnit)?.toFixed(2)}</td>
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

export default Purchases;
