import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi, categoryApi, taxApi, unitApi } from '../api/businessApi';
import { safeQueryData } from '../api/queryHelpers';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, ShoppingCart, RefreshCw } from 'lucide-react';

const Products = () => {
  const { isManufacturer, isRetailer } = useAuth();
  const { addToCart } = useCart();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    productName: '',
    sellingPrice: '',
    costPrice: '',
    taxId: '',
    categoryId: '',
    unitId: '',
    status: true,
  });

  const { data: products, isLoading, refetch: refetchProducts, isError, error } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: async () => {
      const res = await productApi.getWithStock();
      return res?.data?.data ?? [];
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
    retry: false,
  });

  // Force refetch when retailer/manufacturer opens Products page so new products appear
  useEffect(() => {
    refetchProducts();
  }, [refetchProducts]);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => safeQueryData(() => categoryApi.getAll())
  });

  const { data: taxes } = useQuery({
    queryKey: ['taxes'],
    queryFn: () => safeQueryData(() => taxApi.getAll())
  });

  const { data: units } = useQuery({
    queryKey: ['units'],
    queryFn: () => safeQueryData(() => unitApi.getAll())
  });

  const createMutation = useMutation({
    mutationFn: (data) => productApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'all'] });
      toast.success('Product created successfully');
      closeModal();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to create product')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => productApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'all'] });
      toast.success('Product updated successfully');
      closeModal();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to update product')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', 'all'] });
      toast.success('Product deleted successfully');
    }
  });

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        productName: product.productName,
        sellingPrice: product.sellingPrice,
        costPrice: product.costPrice || '',
        taxId: product.tax?.taxId || '',
        categoryId: product.category?.categoryId || '',
        unitId: product.unit?.unitId || '',
        status: product.status === "active",
      });
    } else {
      setEditingProduct(null);
      setFormData({
        productName: '',
        sellingPrice: '',
        costPrice: '',
        taxId: '',
        categoryId: '',
        unitId: '',
        status: true,
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      sellingPrice: parseFloat(formData.sellingPrice),
      costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
      taxId: formData.taxId || null,
      categoryId: formData.categoryId || null,
      unitId: formData.unitId || null,
      status: formData.status ? "active" : "inactive",
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.productId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns = [
    { key: 'productId', label: 'ID' },
    { key: 'productName', label: 'Name' },
    { 
      key: 'sellingPrice', 
      label: 'Price',
      render: (val) => `₹${val?.toFixed(2)}`
    },
    { 
      key: 'unit', 
      label: 'Unit',
      render: (val) => val?.unitName || '-'
    },
    { 
      key: 'availableStock', 
      label: 'Available Stock',
      render: (val, row) => {
        const stockClass = val > 10 ? 'text-green-400' : val > 0 ? 'text-yellow-400' : 'text-red-400';
        return <span className={stockClass}>{val ?? 0} {row.unit?.unitCode || 'units'}</span>;
      }
    },
    { 
      key: 'category', 
      label: 'Category',
      render: (val) => val?.categoryName || '-'
    },
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
      {isError && (
        <div className="card border-red-500/50 bg-red-500/10 mb-6 flex items-center justify-between flex-wrap gap-3">
          <p className="text-red-400 text-sm">
            Could not load products. {error?.response?.status === 403 ? 'Check that you are logged in and your session is valid.' : 'Please try again.'}
          </p>
          <button type="button" onClick={() => refetchProducts()} className="btn-secondary text-sm">
            Retry
          </button>
        </div>
      )}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-primary-400">Products</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetchProducts()}
            className="btn-secondary flex items-center gap-2"
            title="Refresh list to see latest products"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
          {isManufacturer && (
            <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
              <Plus size={20} /> Add Product
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <Table
          columns={columns}
          data={products || []}
          actions={(row) => (
            <div className="flex gap-2">
              {isRetailer && row.status && (
                <button
                  onClick={() => {
                    addToCart(row);
                    toast.success(`Added ${row.productName} to cart`);
                  }}
                  className="text-primary-400 hover:text-primary-300 flex items-center gap-1"
                  title="Add to cart"
                >
                  <ShoppingCart size={18} />
                  Add to cart
                </button>
              )}
              {isManufacturer && (
                <>
                  <button 
                    onClick={() => openModal(row)}
                    className="text-primary-400 hover:text-primary-300"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this product?')) {
                        deleteMutation.mutate(row.productId);
                      }
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}
            </div>
          )}
        />
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-1">Product Name</label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-400/90 mb-1">Selling Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-400/90 mb-1">Cost Price</label>
              <input
                type="number"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-400/90 mb-1">Category</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="input-field"
              >
                <option value="">Select Category</option>
                {categories?.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-400/90 mb-1">Unit (Sold In)</label>
              <select
                value={formData.unitId}
                onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                className="input-field"
              >
                <option value="">Select Unit</option>
                {units?.map((unit) => (
                  <option key={unit.unitId} value={unit.unitId}>{unit.unitName} ({unit.unitCode})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-400/90 mb-1">Tax</label>
              <select
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                className="input-field"
              >
                <option value="">Select Tax</option>
                {taxes?.map((tax) => (
                  <option key={tax.taxId} value={tax.taxId}>{tax.taxName} ({tax.taxPercentage}%)</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="status"
              checked={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="status" className="text-sm text-primary-400/90">Active</label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">
              {editingProduct ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Products;