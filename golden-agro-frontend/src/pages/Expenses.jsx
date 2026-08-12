import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseApi } from '../api/businessApi';
import { useAuth } from '../context/AuthContext';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, RefreshCw, DollarSign, Calendar, Tag } from 'lucide-react';

const Expenses = () => {
  const { isManufacturer, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const { data: expenses, isLoading, refetch: refetchExpenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const res = await expenseApi.getAll();
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
    mutationFn: (data) => expenseApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['profitTrend'] });
      queryClient.invalidateQueries({ queryKey: ['expenseBreakdown'] });
      toast.success('Expense added successfully');
      closeModal();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to add expense')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => expenseApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['profitTrend'] });
      queryClient.invalidateQueries({ queryKey: ['expenseBreakdown'] });
      toast.success('Expense updated successfully');
      closeModal();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update expense')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => expenseApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      queryClient.invalidateQueries({ queryKey: ['profitTrend'] });
      queryClient.invalidateQueries({ queryKey: ['expenseBreakdown'] });
      toast.success('Expense deleted successfully');
    }
  });

  const openModal = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        notes: expense.notes || ''
      });
    } else {
      setEditingExpense(null);
      setFormData({
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingExpense(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      amount: parseFloat(formData.amount)
    };

    if (editingExpense) {
      updateMutation.mutate({ id: editingExpense.expenseId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns = [
    { key: 'expenseId', label: 'ID' },
    { key: 'description', label: 'Description' },
    { 
      key: 'category', 
      label: 'Category',
      render: (val) => (
        <span className="px-2 py-1 rounded-full text-xs bg-blue-500/20 text-blue-400">
          {val || 'General'}
        </span>
      )
    },
    { 
      key: 'amount', 
      label: 'Amount',
      render: (val) => (
        <span className="font-semibold text-red-400">₹{val?.toFixed(2)}</span>
      )
    },
    { 
      key: 'date', 
      label: 'Date',
      render: (val) => val ? new Date(val).toLocaleDateString() : '-'
    },
    { 
      key: 'notes', 
      label: 'Notes',
      render: (val) => val ? (
        <span className="text-sm text-gray-400 truncate max-w-xs" title={val}>
          {val.length > 30 ? val.substring(0, 30) + '...' : val}
        </span>
      ) : '-'
    }
  ];

  const expenseCategories = [
    'Raw Materials',
    'Production',
    'Utilities',
    'Maintenance',
    'Salaries',
    'Marketing',
    'Transportation',
    'Office Supplies',
    'Rent',
    'Insurance',
    'Taxes',
    'Other'
  ];

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary-400">Expenses</h1>
          <p className="text-theme-muted text-sm mt-1">Track and manage business expenses</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetchExpenses()}
            className="btn-secondary flex items-center gap-2"
            title="Refresh list to see latest expenses"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          {(isManufacturer || isAdmin) && (
            <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
              <Plus size={20} /> Add Expense
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <Table
          columns={columns}
          data={expenses || []}
          actions={(row) => (isManufacturer || isAdmin) && (
            <div className="flex gap-2">
              <button onClick={() => openModal(row)} className="text-primary-400 hover:text-primary-300">
                <Edit size={18} />
              </button>
              <button 
                onClick={() => {
                  if (confirm('Are you sure you want to delete this expense?')) {
                    deleteMutation.mutate(row.expenseId);
                  }
                }}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}
        />
      </div>

      {/* Add/Edit Expense Modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editingExpense ? 'Edit Expense' : 'Add Expense'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              placeholder="e.g., Office rent, Raw material purchase"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-400/90 mb-1">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input-field"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-400/90 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
              >
                <option value="">Select Category</option>
                {expenseCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-1">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="Additional notes about this expense..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">
              {editingExpense ? 'Update' : 'Add'} Expense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Expenses;
