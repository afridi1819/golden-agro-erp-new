import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '../api/businessApi';
import { safeQueryData } from '../api/queryHelpers';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Categories = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ categoryName: '', description: '' });

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => safeQueryData(() => categoryApi.getAll())
  });

  const createMutation = useMutation({
    mutationFn: (data) => categoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Category created');
      closeModal();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => categoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Category updated');
      closeModal();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => categoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      toast.success('Category deleted');
    }
  });

  const openModal = (category = null) => {
    if (category) {
      setEditing(category);
      setFormData({ categoryName: category.categoryName, description: category.description || '' });
    } else {
      setEditing(null);
      setFormData({ categoryName: '', description: '' });
    }
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSubmit = (e) => {
    e.preventDefault();
    editing ? updateMutation.mutate({ id: editing.categoryId, data: formData }) : createMutation.mutate(formData);
  };

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-400">Categories</h1>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus size={20} /> Add Category
        </button>
      </div>

      <div className="card">
        <Table
          columns={[
            { key: 'categoryId', label: 'ID' },
            { key: 'categoryName', label: 'Name' },
            { key: 'description', label: 'Description' }
          ]}
          data={categories || []}
          actions={(row) => (
            <div className="flex gap-2">
              <button onClick={() => openModal(row)} className="text-primary-400 hover:text-primary-300"><Edit size={18} /></button>
              <button onClick={() => confirm('Delete?') && deleteMutation.mutate(row.categoryId)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
            </div>
          )}
        />
      </div>

      <Modal isOpen={modalOpen} onClose={closeModal} title={editing ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-1">Name</label>
            <input type="text" value={formData.categoryName} onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input-field" rows={3} />
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

export default Categories;