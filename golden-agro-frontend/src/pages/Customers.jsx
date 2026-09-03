import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '../api/businessApi';
import { safeQueryData } from '../api/queryHelpers';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Customers = () => {
    const queryClient = useQueryClient();

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const initialFormData = {
        customerName: '',
        phone: '',
        email: '',
        gstNumber: '',
        address: '',
        status: 'active'
    };

    const [formData, setFormData] = useState(initialFormData);

    const { data: customers, isLoading } = useQuery({
        queryKey: ['customers'],
        queryFn: () => safeQueryData(() => customerApi.getAll())
    });

    const createMutation = useMutation({
        mutationFn: (data) => customerApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['customers']);
            toast.success('Customer created');
            closeModal();
        },
        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                'Failed to create customer'
            );
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => customerApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['customers']);
            toast.success('Customer updated');
            closeModal();
        },
        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                'Failed to update customer'
            );
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => customerApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['customers']);
            toast.success('Customer deleted');
        },
        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                'Failed to delete customer'
            );
        }
    });

    const openModal = (customer = null) => {
        if (customer) {
            setEditing(customer);

            setFormData({
                customerName: customer.customerName || '',
                phone: customer.phone || '',
                email: customer.email || '',
                gstNumber: customer.gstNumber || '',
                address: customer.address || '',
                status: customer.status || 'active'
            });
        } else {
            setEditing(null);
            setFormData(initialFormData);
        }

        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditing(null);
        setFormData(initialFormData);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.phone && formData.phone.length !== 10) {
            toast.error('Phone must be exactly 10 digits');
            return;
        }

        if (editing) {
            updateMutation.mutate({
                id: editing.customerId,
                data: formData
            });
        } else {
            createMutation.mutate(formData);
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-primary-400">
                    Customers
                </h1>

                <button
                    onClick={() => openModal()}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    Add Customer
                </button>
            </div>

            <div className="card">
                <Table
                    columns={[
                        {
                            key: 'customerId',
                            label: 'ID'
                        },
                        {
                            key: 'customerName',
                            label: 'Customer Name'
                        },
                        {
                            key: 'phone',
                            label: 'Phone'
                        },
                        {
                            key: 'email',
                            label: 'Email'
                        },
                        {
                            key: 'gstNumber',
                            label: 'GST'
                        },
                        {
                            key: 'status',
                            label: 'Status',
                            render: (val) => (
                                <span
                                    className={`px-2 py-1 rounded-full text-xs ${val === 'active'
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-red-500/20 text-red-400'
                                        }`}
                                >
                                    {val === 'active' ? 'Active' : 'Inactive'}
                                </span>
                            )
                        }
                    ]}
                    data={customers || []}
                    actions={(row) => (
                        <div className="flex gap-2">
                            <button
                                onClick={() => openModal(row)}
                                className="text-primary-400 hover:text-primary-300"
                                title="Edit Customer"
                            >
                                <Edit size={18} />
                            </button>

                            <button
                                onClick={() => {
                                    if (confirm(`Delete ${row.customerName}?`)) {
                                        deleteMutation.mutate(row.customerId);
                                    }
                                }}
                                className="text-red-400 hover:text-red-300"
                                title="Delete Customer"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    )}
                />
            </div>

            <Modal
                isOpen={modalOpen}
                onClose={closeModal}
                title={editing ? 'Edit Customer' : 'Add Customer'}
            >
                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >
                    <div>
                        <label className="block text-sm font-medium text-primary-400/90 mb-1">
                            Customer Name
                        </label>

                        <input
                            type="text"
                            value={formData.customerName}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    customerName: e.target.value
                                })
                            }
                            className="input-field"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-primary-400/90 mb-1">
                            Phone (10 digits)
                        </label>

                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => {
                                const phoneValue = e.target.value
                                    .replace(/\D/g, '')
                                    .slice(0, 10);

                                setFormData({
                                    ...formData,
                                    phone: phoneValue
                                });
                            }}
                            inputMode="numeric"
                            pattern="[0-9]{10}"
                            maxLength={10}
                            placeholder="Enter 10 digit phone number"
                            className="input-field"
                        />

                        {formData.phone &&
                            formData.phone.length !== 10 && (
                                <p className="text-red-400 text-xs mt-1">
                                    Phone must be exactly 10 digits
                                </p>
                            )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-primary-400/90 mb-1">
                            Email
                        </label>

                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    email: e.target.value
                                })
                            }
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-primary-400/90 mb-1">
                            GST Number
                        </label>

                        <input
                            type="text"
                            value={formData.gstNumber}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    gstNumber: e.target.value
                                })
                            }
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-primary-400/90 mb-1">
                            Address
                        </label>

                        <textarea
                            value={formData.address}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    address: e.target.value
                                })
                            }
                            className="input-field"
                            rows={2}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.status === 'active'}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    status: e.target.checked
                                        ? 'active'
                                        : 'inactive'
                                })
                            }
                        />

                        <label className="text-primary-400/90">
                            Active
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={
                                createMutation.isPending ||
                                updateMutation.isPending
                            }
                        >
                            {editing ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Customers;