import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { unitApi } from '../api/businessApi';
import { safeQueryData } from '../api/queryHelpers';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Package } from 'lucide-react';

const Units = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ unitName: '', unitCode: '' });

  const { data: units, isLoading } = useQuery({
    queryKey: ['units'],
    queryFn: () => safeQueryData(() => unitApi.getAll())
  });

  const createMutation = useMutation({
    mutationFn: (data) => unitApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['units']);
      toast.success('Unit created successfully');
      closeModal();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to create unit')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => unitApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['units']);
      toast.success('Unit updated successfully');
      closeModal();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update unit')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => unitApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['units']);
      toast.success('Unit deleted successfully');
    }
  });

  const openModal = (unit = null) => {
    if (unit) {
      setEditing(unit);
      setFormData({ unitName: unit.unitName, unitCode: unit.unitCode });
    } else {
      setEditing(null);
      setFormData({ unitName: '', unitCode: '' });
    }
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSubmit = (e) => {
    e.preventDefault();
    editing ? updateMutation.mutate({ id: editing.unitId, data: formData }) : createMutation.mutate(formData);
  };

  const columns = [
    { key: 'unitId', label: 'ID' },
    { key: 'unitName', label: 'Unit Name' },
    { key: 'unitCode', label: 'Unit Code' },
    { key: 'createdAt', label: 'Created', render: (val) => val ? new Date(val).toLocaleDateString() : '-' }
  ];

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-400">Units</h1>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Add Unit
        </button>
      </div>

      <div className="card">
        <Table
          columns={columns}
          data={units || []}
          actions={(row) => (
            <div className="flex gap-2">
              <button onClick={() => openModal(row)} className="text-primary-400 hover:text-primary-300">
                <Edit size={18} />
              </button>
              <button onClick={() => confirm('Delete this unit? This may affect existing records.') && deleteMutation.mutate(row.unitId)} className="text-red-400 hover:text-red-300">
                <Trash2 size={18} />
              </button>
            </div>
          )}
        />
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Unit' : 'Add Unit'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-1">Unit Name</label>
            <input
              type="text"
              value={formData.unitName}
              onChange={(e) => setFormData({ ...formData, unitName: e.target.value })}
              className="input-field"
              placeholder="e.g., Kilograms"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-1">Unit Code</label>
            <input
              type="text"
              value={formData.unitCode}
              onChange={(e) => setFormData({ ...formData, unitCode: e.target.value })}
              className="input-field"
              placeholder="e.g., kg"
              required
            />
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

export default Units;
