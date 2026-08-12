import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rawMaterialApi, unitApi } from '../api/businessApi';
import { safeQueryData } from '../api/queryHelpers';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import { Plus, Edit, AlertTriangle } from 'lucide-react';

const RawMaterials = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    materialName: '',
    unitId: '',
    stockQuantity: 0,
    reorderLevel: 10
  });

  const { data: materials, isLoading } = useQuery({
    queryKey: ['rawMaterials'],
    queryFn: () => safeQueryData(() => rawMaterialApi.getAll())
  });

  const { data: units } = useQuery({
    queryKey: ['units'],
    queryFn: () => safeQueryData(() => unitApi.getAll())
  });

  const createMutation = useMutation({
    mutationFn: (data) => rawMaterialApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['rawMaterials']);
      toast.success('Raw material created');
      closeModal();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => rawMaterialApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['rawMaterials']);
      toast.success('Raw material updated');
      closeModal();
    }
  });

  const openModal = (material = null) => {
    if (material) {
      setEditing(material);
      setFormData({
        materialName: material.materialName,
        unitId: material.unit?.unitId || '',
        stockQuantity: material.stockQuantity,
        reorderLevel: material.reorderLevel
      });
    } else {
      setEditing(null);
      setFormData({ materialName: '', unitId: '', stockQuantity: 0, reorderLevel: 10 });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      unit: formData.unitId ? { unitId: parseInt(formData.unitId) } : null
    };
    
    if (editing) {
      updateMutation.mutate({ id: editing.rawMaterialId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns = [
    { key: 'rawMaterialId', label: 'ID' },
    { key: 'materialName', label: 'Name' },
    { key: 'unit', label: 'Unit', render: (val) => val?.unitName || '-' },
    { 
      key: 'stockQuantity', 
      label: 'Stock',
      render: (val, row) => (
        <span className={val <= row.reorderLevel ? 'text-red-400 font-medium' : 'text-gray-200'}>
          {val} {val <= row.reorderLevel && <AlertTriangle className="inline" size={16} />}
        </span>
      )
    },
    { key: 'reorderLevel', label: 'Reorder Level' }
  ];

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-400">Raw Materials</h1>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Add Material
        </button>
      </div>

      <div className="card">
        <Table
          columns={columns}
          data={materials || []}
          actions={(row) => (
            <button onClick={() => openModal(row)} className="text-primary-400 hover:text-primary-300">
              <Edit size={18} />
            </button>
          )}
        />
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Raw Material' : 'Add Raw Material'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-1">Material Name</label>
            <input
              type="text"
              value={formData.materialName}
              onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-1">Unit</label>
            <select
              value={formData.unitId}
              onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
              className="input-field"
            >
              <option value="">Select Unit</option>
              {units?.map((u) => (
                <option key={u.unitId} value={u.unitId}>{u.unitName}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-400/90 mb-1">Stock Quantity</label>
              <input
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) })}
                className="input-field"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-400/90 mb-1">Reorder Level</label>
              <input
                type="number"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) })}
                className="input-field"
                min="0"
              />
            </div>
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

export default RawMaterials;