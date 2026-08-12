import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Loading from '../components/common/Loading';
import PasswordInput from '../components/common/PasswordInput';
import toast from 'react-hot-toast';
import { Plus, Edit, Power, RefreshCw } from 'lucide-react';

const Manufacturers = () => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  const { data: manufacturers, isLoading, refetch } = useQuery({
    queryKey: ['manufacturers'],
    queryFn: async () => {
      const res = await authApi.listManufacturers();
      return res?.data ?? [];
    },
    enabled: isAdmin,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 15000,
  });

  const createMutation = useMutation({
    mutationFn: (data) => authApi.createManufacturer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
      toast.success('Manufacturer created');
      closeModal();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to create manufacturer')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => authApi.updateManufacturer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
      toast.success('Manufacturer updated');
      closeModal();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update manufacturer')
  });

  const activeMutation = useMutation({
    mutationFn: ({ id, isActive }) => authApi.setManufacturerActive(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
      toast.success('Updated');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update status')
  });

  const openModal = (row = null) => {
    if (row) {
      setEditing(row);
      setFormData({
        email: row.email,
        password: '',
        firstName: row.firstName,
        lastName: row.lastName,
      });
    } else {
      setEditing(null);
      setFormData({ email: '', password: '', firstName: '', lastName: '' });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editing) {
      updateMutation.mutate({ id: editing.id, data: { firstName: formData.firstName, lastName: formData.lastName } });
      return;
    }

    createMutation.mutate(formData);
  };

  const columns = [
    { key: 'email', label: 'Email' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    {
      key: 'isActive',
      label: 'Status',
      render: (val) => (
        <span className={`px-2 py-1 rounded-full text-xs ${val ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {val ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (val) => val ? new Date(val).toLocaleString() : '-'
    }
  ];

  if (!isAdmin) return <div className="text-theme-muted">Not authorized.</div>;
  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary-400">Manufacturers</h1>
          <p className="text-theme-muted text-sm mt-1">Create, edit, activate/deactivate manufacturer accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="btn-secondary flex items-center gap-2"
            title="Refresh"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus size={20} /> Add Manufacturer
          </button>
        </div>
      </div>

      <div className="card">
        <Table
          columns={columns}
          data={manufacturers || []}
          actions={(row) => (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => openModal(row)}
                className="text-primary-400 hover:text-primary-300"
                title="Edit"
              >
                <Edit size={18} />
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = !row.isActive;
                  if (confirm(`${next ? 'Activate' : 'Deactivate'} ${row.email}?`)) {
                    activeMutation.mutate({ id: row.id, isActive: next });
                  }
                }}
                className="text-yellow-400 hover:text-yellow-300"
                title={row.isActive ? 'Deactivate' : 'Activate'}
                disabled={activeMutation.isPending}
              >
                <Power size={18} />
              </button>
            </div>
          )}
        />
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Manufacturer' : 'Add Manufacturer'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
              required
              disabled={!!editing}
            />
          </div>

          {!editing && (
            <div>
              <label className="block text-sm font-medium text-primary-400/90 mb-1">Password</label>
              <PasswordInput
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-400/90 mb-1">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-400/90 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="input-field"
                required
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

export default Manufacturers;
