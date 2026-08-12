import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplierApi } from '../api/businessApi';
import { safeQueryData } from '../api/queryHelpers';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Suppliers = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ supplierName: '', contactPerson: '', phone: '', email: '', gstNumber: '', address: '', status: 'active' });

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => safeQueryData(() => supplierApi.getAll())
  });

  const createMutation = useMutation({
    mutationFn: (data) => supplierApi.create(data),
    onSuccess: () => { queryClient.invalidateQueries(['suppliers']); toast.success('Supplier created'); closeModal(); }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => supplierApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries(['suppliers']); toast.success('Supplier updated'); closeModal(); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => supplierApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['suppliers']); toast.success('Supplier deleted'); }
  });

  const openModal = (supplier = null) => {
    if (supplier) {
      setEditing(supplier);
      setFormData({
        supplierName: supplier.supplierName,
        contactPerson: supplier.contactPerson,
        phone: supplier.phone || '',
        email: supplier.email,
        gstNumber: supplier.gstNumber || '',
        address: supplier.address || '',
        status: supplier.status
      });
    } else {
      setEditing(null);
      setFormData({ supplierName: '', contactPerson: '', phone: '', email: '', gstNumber: '', address: '', status: 'active' });
    }
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.phone && formData.phone.length !== 10) {
      toast.error('Phone must be exactly 10 digits');
      return;
    }

    editing ? updateMutation.mutate({ id: editing.supplierId, data: formData }) : createMutation.mutate(formData);
  };

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-400">Suppliers</h1>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2"><Plus size={20} /> Add Supplier</button>
      </div>
      <div className="card">
        <Table
          columns={[
            { key: 'supplierId', label: 'ID' },
            { key: 'supplierName', label: 'Supplier Name' },
            { key: 'contactPerson', label: 'Contact Person' },
            { key: 'phone', label: 'Phone' },
            { key: 'email', label: 'Email' },
            { key: 'gstNumber', label: 'GST' },
            { key: 'status', label: 'Status', render: (val) => <span className={`px-2 py-1 rounded-full text-xs ${val === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{val === 'active' ? 'Active' : 'Inactive'}</span> }
          ]}
          data={suppliers || []}
          actions={(row) => (
            <div className="flex gap-2">
              <button onClick={() => openModal(row)} className="text-primary-400 hover:text-primary-300"><Edit size={18} /></button>
              <button onClick={() => confirm('Delete?') && deleteMutation.mutate(row.supplierId)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
            </div>
          )}
        />
      </div>
      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Supplier' : 'Add Supplier'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-primary-400/90 mb-1">Supplier Name</label><input type="text" value={formData.supplierName} onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })} className="input-field" required /></div>
          <div><label className="block text-sm font-medium text-primary-400/90 mb-1">Contact Person</label><input type="text" value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} className="input-field" /></div>
          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-1">Phone (10 digits)</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                const phoneValue = e.target.value.replace(/\D/g, '').slice(0, 10);
                setFormData({ ...formData, phone: phoneValue });
              }}
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength={10}
              placeholder="Enter 10 digit phone number"
              className="input-field"
            />
            {formData.phone && formData.phone.length !== 10 && (
              <p className="text-red-400 text-xs mt-1">Phone must be exactly 10 digits</p>
            )}
          </div>
          <div><label className="block text-sm font-medium text-primary-400/90 mb-1">Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-primary-400/90 mb-1">GST Number</label><input type="text" value={formData.gstNumber} onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-primary-400/90 mb-1">Address</label><textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="input-field" rows={2} /></div>
          <div className="flex items-center gap-2"><input type="checkbox" checked={formData.status === 'active'} onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })} /><label className="text-primary-400/90">Active</label></div>
          <div className="flex justify-end gap-2 pt-4"><button type="button" onClick={closeModal} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">{editing ? 'Update' : 'Create'}</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default Suppliers;
