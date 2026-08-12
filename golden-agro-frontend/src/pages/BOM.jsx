import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bomApi, productApi, rawMaterialApi } from '../api/businessApi';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, RefreshCw, Package } from 'lucide-react';

const BOM = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ 
    productId: '', 
    version: '1.0',
    items: [{ rawMaterialId: '', quantityRequired: '' }]
  });

  const { data: boms, isLoading, error, refetch: refetchBoms } = useQuery({
    queryKey: ['boms'],
    queryFn: async () => {
      const res = await bomApi.getAll();
      return res?.data?.data ?? [];
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 5000,
    retry: false,
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await productApi.getAll();
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
    mutationFn: (data) => bomApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['boms']);
      toast.success('BOM created successfully');
      closeModal();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to create BOM')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => bomApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['boms']);
      toast.success('BOM updated successfully');
      closeModal();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update BOM')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => bomApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['boms']);
      toast.success('BOM deleted successfully');
    }
  });

  const openModal = (bom = null) => {
    if (bom) {
      setEditing(bom);
      setFormData({ 
        productId: bom.product?.productId || '', 
        version: bom.version || '1.0',
        items: bom.items || [{ rawMaterialId: '', quantityRequired: '' }]
      });
    } else {
      setEditing(null);
      setFormData({ productId: '', version: '1.0', items: [{ rawMaterialId: '', quantityRequired: '' }] });
    }
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { rawMaterialId: '', quantityRequired: '' }] });
  };

  const removeItem = (index) => {
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validItems = formData.items.filter(item => item.rawMaterialId && item.quantityRequired);
    if (validItems.length === 0) {
      toast.error('Please add at least one valid item');
      return;
    }
    
    const bomData = {
      productId: formData.productId,
      version: formData.version,
      items: validItems
    };
    
    editing ? updateMutation.mutate({ id: editing.bomId, data: bomData }) : createMutation.mutate(bomData);
  };

  const columns = [
    { key: 'bomId', label: 'ID' },
    { key: 'product', label: 'Product', render: (val) => val?.productName || '-' },
    { key: 'version', label: 'Version' },
    { key: 'items', label: 'Items', render: (items) => items?.length || 0 },
    { key: 'createdAt', label: 'Created', render: (val) => val ? new Date(val).toLocaleDateString() : '-' }
  ];

  if (isLoading) return <Loading />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-primary-400">Bill of Materials</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetchBoms()}
            className="btn-secondary flex items-center gap-2"
            title="Refresh list to see latest BOMs"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus size={20} /> Add BOM
          </button>
        </div>
      </div>

      <div className="card">
        <Table
          columns={columns}
          data={boms || []}
          actions={(row) => (
            <div className="flex gap-2">
              <button onClick={() => openModal(row)} className="text-primary-400 hover:text-primary-300">
                <Edit size={18} />
              </button>
              <button onClick={() => confirm('Delete this BOM?') && deleteMutation.mutate(row.bomId)} className="text-red-400 hover:text-red-300">
                <Trash2 size={18} />
              </button>
            </div>
          )}
        />
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit BOM' : 'New BOM'} size="lg">
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
            <label className="block text-sm font-medium text-primary-400/90 mb-1">Version</label>
            <input
              type="text"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-2">Raw Materials</label>
            {formData.items.map((item, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <select
                  value={item.rawMaterialId}
                  onChange={(e) => updateItem(i, 'rawMaterialId', e.target.value)}
                  className="input-field flex-1"
                  required
                >
                  <option value="">Select Material</option>
                  {rawMaterials?.map((m) => (
                    <option key={m.rawMaterialId} value={m.rawMaterialId}>{m.materialName}</option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Quantity"
                  value={item.quantityRequired}
                  onChange={(e) => updateItem(i, 'quantityRequired', e.target.value)}
                  className="input-field w-32"
                  required
                />
                {formData.items.length > 1 && (
                  <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-300">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addItem} className="btn-secondary text-sm">
              <Plus size={16} className="inline mr-1" /> Add Material
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BOM;
