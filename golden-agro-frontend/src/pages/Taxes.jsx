import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taxApi } from '../api/businessApi';
import { safeQueryData } from '../api/queryHelpers';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';

const Taxes = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ taxName: '', taxRate: '' });

  const { data: taxes, isLoading } = useQuery({
    queryKey: ['taxes'],
    queryFn: () => safeQueryData(() => taxApi.getAll())
  });

  const createMutation = useMutation({
    mutationFn: (data) => taxApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['taxes']);
      toast.success('Tax created successfully');
      closeModal();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to create tax')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => taxApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['taxes']);
      toast.success('Tax updated successfully');
      closeModal();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update tax')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => taxApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['taxes']);
      toast.success('Tax deleted successfully');
    }
  });

  const openModal = (tax = null) => {
    if (tax) {
      setEditing(tax);
      setFormData({ taxName: tax.taxName, taxRate: tax.taxRate });
    } else {
      setEditing(null);
      setFormData({ taxName: '', taxRate: '' });
    }
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const taxData = {
      ...formData,
      taxRate: parseFloat(formData.taxRate)
    };
    editing ? updateMutation.mutate({ id: editing.taxId, data: taxData }) : createMutation.mutate(taxData);
  };

  const columns = [
    { key: 'taxId', label: 'ID' },
    { key: 'taxName', label: 'Tax Name' },
    { key: 'taxRate', label: 'Tax Rate', render: (val) => `${val}%` },
    { key: 'createdAt', label: 'Created', render: (val) => val ? new Date(val).toLocaleDateString() : '-' }
  ];

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-400">Taxes</h1>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Add Tax
        </button>
      </div>

      <div className="card">
        <Table
          columns={columns}
          data={taxes || []}
          actions={(row) => (
            <div className="flex gap-2">
              <button onClick={() => openModal(row)} className="text-primary-400 hover:text-primary-300">
                <Edit size={18} />
              </button>
              <button onClick={() => confirm('Delete this tax? This may affect existing products and invoices.') && deleteMutation.mutate(row.taxId)} className="text-red-400 hover:text-red-300">
                <Trash2 size={18} />
              </button>
            </div>
          )}
        />
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Tax' : 'Add Tax'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-1">Tax Name</label>
            <input
              type="text"
              value={formData.taxName}
              onChange={(e) => setFormData({ ...formData, taxName: e.target.value })}
              className="input-field"
              placeholder="e.g., GST 18%"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-1">Tax Rate (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.taxRate}
              onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
              className="input-field"
              placeholder="e.g., 18"
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

export default Taxes;
