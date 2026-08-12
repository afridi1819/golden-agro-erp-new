import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { retailerApi } from '../api/businessApi';
import { useAuth } from '../context/AuthContext';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Retailers = () => {
  const { isAdmin, isManufacturer } = useAuth();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRetailer, setEditingRetailer] = useState(null);
  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    phone: '',
    email: '',
    address: '',
    gstNumber: '',
    status: 'active'
  });

  const { data: retailers, isLoading } = useQuery({
    queryKey: ['retailers'],
    queryFn: async () => {
      const res = await retailerApi.getAll();
      return res?.data?.data ?? [];
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 5000,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (data) => retailerApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['retailers']);
      toast.success('Retailer created successfully');
      closeModal();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => retailerApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['retailers']);
      toast.success('Retailer updated successfully');
      closeModal();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => retailerApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['retailers']);
      toast.success('Retailer deleted successfully');
    }
  });

  const openModal = (retailer = null) => {
    if (retailer) {
      setEditingRetailer(retailer);
      setFormData({
        shopName: retailer.shopName || '',
        ownerName: retailer.ownerName || '',
        phone: retailer.phone || '',
        email: retailer.email || '',
        address: retailer.address || '',
        gstNumber: retailer.gstNumber || '',
        status: retailer.status || 'active'
      });
    } else {
      setEditingRetailer(null);
      setFormData({ shopName: '', ownerName: '', phone: '', email: '', address: '', gstNumber: '', status: 'active' });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRetailer(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRetailer) {
      updateMutation.mutate({ id: editingRetailer.retailerId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const columns = [
    { key: 'retailerId', label: 'ID' },
    { key: 'shopName', label: 'Shop Name' },
    { key: 'ownerName', label: 'Owner Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'gstNumber', label: 'GST Number' },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => (
        <span className={`px-2 py-1 rounded-full text-xs ${val === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {val === 'active' ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-400">Retailers</h1>
      </div>

      <div className="card">
        <Table
          columns={columns}
          data={retailers || []}
          actions={(row) => (isAdmin || isManufacturer) && (
            <div className="flex gap-2">
              <button onClick={() => openModal(row)} className="text-primary-400 hover:text-primary-300">
                <Edit size={18} />
              </button>
              <button 
                onClick={() => confirm('Delete this retailer?') && deleteMutation.mutate(row.retailerId)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}
        />
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editingRetailer ? 'Edit Retailer' : 'Add Retailer'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-1">Shop Name</label>
            <input
              type="text"
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-1">Owner Name</label>
            <input
              type="text"
              value={formData.ownerName}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-1">Phone (10 digits)</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                setFormData({ ...formData, phone: value });
              }}
              pattern="[0-9]{10}"
              maxLength={10}
              placeholder="Enter 10 digit phone number"
              className="input-field"
            />
            {formData.phone && formData.phone.length !== 10 && (
              <p className="text-red-400 text-xs mt-1">Phone must be exactly 10 digits</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-1">GST Number</label>
            <input
              type="text"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-1">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input-field"
              rows={2}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="status"
              checked={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
            />
            <label htmlFor="status" className="text-primary-400/90">Active</label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingRetailer ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Retailers;