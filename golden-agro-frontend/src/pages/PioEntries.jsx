import { useState } from 'react';
import {
    useQuery,
    useMutation,
    useQueryClient
} from '@tanstack/react-query';

import toast from 'react-hot-toast';

import {
    Plus,
    Edit,
    Trash2,
    Send
} from 'lucide-react';

import {
    pioProductionApi,
    pioSaleApi,
    customerApi,
    notificationApi
} from '../api/businessApi';

import { safeQueryData } from '../api/queryHelpers';

import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Loading from '../components/common/Loading';

const PioEntries = () => {

    const queryClient = useQueryClient();

    const [productionModalOpen, setProductionModalOpen] = useState(false);
    const [saleModalOpen, setSaleModalOpen] = useState(false);

    const [editingProduction, setEditingProduction] = useState(null);
    const [editingSale, setEditingSale] = useState(null);

    const [productionFormData, setProductionFormData] = useState({
        entryDate: new Date().toISOString().split('T')[0],
        productionBoxes: '',
        notes: ''
    });

    const [saleFormData, setSaleFormData] = useState({
        entryDate: new Date().toISOString().split('T')[0],
        customerId: '',
        boxesSold: '',
        rate: '',
        notes: ''
    });


    /*
     * =========================
     * DATA QUERIES
     * =========================
     */

    const {
        data: productions,
        isLoading: productionsLoading
    } = useQuery({
        queryKey: ['pio-productions'],
        queryFn: () =>
            safeQueryData(() =>
                pioProductionApi.getAll()
            )
    });

    const {
        data: sales,
        isLoading: salesLoading
    } = useQuery({
        queryKey: ['pio-sales'],
        queryFn: () =>
            safeQueryData(() =>
                pioSaleApi.getAll()
            )
    });

    const {
        data: stockSummary,
        isLoading: stockLoading
    } = useQuery({
        queryKey: ['pio-stock-summary'],
        queryFn: () =>
            safeQueryData(() =>
                pioSaleApi.getStockSummary()
            )
    });

    const {
        data: customers
    } = useQuery({
        queryKey: ['customers'],
        queryFn: () =>
            safeQueryData(() =>
                customerApi.getActive()
            )
    });


    /*
     * =========================
     * PRODUCTION MUTATIONS
     * =========================
     */

    const createProductionMutation = useMutation({

        mutationFn: (data) =>
            pioProductionApi.create(data),

        onSuccess: () => {

            queryClient.invalidateQueries({
                queryKey: ['pio-productions']
            });

            queryClient.invalidateQueries({
                queryKey: ['pio-stock-summary']
            });

            toast.success(
                'PIO production entry created successfully'
            );

            closeProductionModal();
        },

        onError: (error) => {

            toast.error(
                error?.response?.data?.message ||
                'Failed to create production entry'
            );
        }
    });


    const updateProductionMutation = useMutation({

        mutationFn: ({ id, data }) =>
            pioProductionApi.update(id, data),

        onSuccess: () => {

            queryClient.invalidateQueries({
                queryKey: ['pio-productions']
            });

            queryClient.invalidateQueries({
                queryKey: ['pio-stock-summary']
            });

            toast.success(
                'PIO production entry updated successfully'
            );

            closeProductionModal();
        },

        onError: (error) => {

            toast.error(
                error?.response?.data?.message ||
                'Failed to update production entry'
            );
        }
    });


    const deleteProductionMutation = useMutation({

        mutationFn: (id) =>
            pioProductionApi.delete(id),

        onSuccess: () => {

            queryClient.invalidateQueries({
                queryKey: ['pio-productions']
            });

            queryClient.invalidateQueries({
                queryKey: ['pio-stock-summary']
            });

            toast.success(
                'PIO production entry deleted successfully'
            );
        },

        onError: (error) => {

            toast.error(
                error?.response?.data?.message ||
                'Failed to delete production entry'
            );
        }
    });


    /*
     * =========================
     * SALE MUTATIONS
     * =========================
     */

    const createSaleMutation = useMutation({

        mutationFn: (data) =>
            pioSaleApi.create(data),

        onSuccess: () => {

            queryClient.invalidateQueries({
                queryKey: ['pio-sales']
            });

            queryClient.invalidateQueries({
                queryKey: ['pio-stock-summary']
            });

            toast.success(
                'PIO sale entry created successfully'
            );

            closeSaleModal();
        },

        onError: (error) => {

            toast.error(
                error?.response?.data?.message ||
                'Failed to create PIO sale entry'
            );
        }
    });


    const updateSaleMutation = useMutation({

        mutationFn: ({ id, data }) =>
            pioSaleApi.update(id, data),

        onSuccess: () => {

            queryClient.invalidateQueries({
                queryKey: ['pio-sales']
            });

            queryClient.invalidateQueries({
                queryKey: ['pio-stock-summary']
            });

            toast.success(
                'PIO sale entry updated successfully'
            );

            closeSaleModal();
        },

        onError: (error) => {

            toast.error(
                error?.response?.data?.message ||
                'Failed to update PIO sale entry'
            );
        }
    });


    const deleteSaleMutation = useMutation({

        mutationFn: (id) =>
            pioSaleApi.delete(id),

        onSuccess: () => {

            queryClient.invalidateQueries({
                queryKey: ['pio-sales']
            });

            queryClient.invalidateQueries({
                queryKey: ['pio-stock-summary']
            });

            toast.success(
                'PIO sale entry deleted successfully'
            );
        },

        onError: (error) => {

            toast.error(
                error?.response?.data?.message ||
                'Failed to delete PIO sale entry'
            );
        }
    });


    /*
     * =========================
     * SEND MESSAGE MUTATION
     * =========================
     */

    const sendMessageMutation = useMutation({

        mutationFn: (saleId) =>
            notificationApi.sendPioSaleMessage(saleId),

        onSuccess: (response) => {

            const data = response?.data;

            /*
             * For now the backend is returning a temporary
             * notification response.
             *
             * Later, when SMS and WhatsApp are connected,
             * smsSent and whatsappSent can be used here.
             */

            if (
                data?.smsSent === true &&
                data?.whatsappSent === true
            ) {

                toast.success(
                    'SMS and WhatsApp message sent successfully'
                );

            } else if (
                data?.message
            ) {

                toast.success(
                    data.message
                );

            } else {

                toast.success(
                    'Notification request sent successfully'
                );
            }
        },

        onError: (error) => {

            toast.error(
                error?.response?.data?.message ||
                'Failed to send customer message'
            );
        }
    });


    /*
     * =========================
     * PRODUCTION FORM
     * =========================
     */

    const resetProductionForm = () => {

        setProductionFormData({

            entryDate:
                new Date()
                    .toISOString()
                    .split('T')[0],

            productionBoxes: '',

            notes: ''
        });
    };


    const openProductionModal = (entry = null) => {

        if (entry) {

            setEditingProduction(entry);

            setProductionFormData({

                entryDate:
                    entry.entryDate
                        ? String(entry.entryDate).split('T')[0]
                        : '',

                productionBoxes:
                    entry.productionBoxes ?? '',

                notes:
                    entry.notes || ''
            });

        } else {

            setEditingProduction(null);

            resetProductionForm();
        }

        setProductionModalOpen(true);
    };


    const closeProductionModal = () => {

        setProductionModalOpen(false);

        setEditingProduction(null);

        resetProductionForm();
    };


    const handleProductionSubmit = (e) => {

        e.preventDefault();

        const payload = {

            entryDate:
                productionFormData.entryDate,

            productionBoxes:
                Number(
                    productionFormData.productionBoxes
                ),

            notes:
                productionFormData.notes
        };


        if (editingProduction) {

            updateProductionMutation.mutate({

                id:
                    editingProduction.pioProductionId,

                data:
                    payload
            });

        } else {

            createProductionMutation.mutate(payload);
        }
    };


    const handleDeleteProduction = (entry) => {

        const confirmed = window.confirm(
            'Are you sure you want to delete this production entry?'
        );

        if (!confirmed) {
            return;
        }

        deleteProductionMutation.mutate(
            entry.pioProductionId
        );
    };


    /*
     * =========================
     * SALE FORM
     * =========================
     */

    const resetSaleForm = () => {

        setSaleFormData({

            entryDate:
                new Date()
                    .toISOString()
                    .split('T')[0],

            customerId: '',

            boxesSold: '',

            rate: '',

            notes: ''
        });
    };


    const openSaleModal = (entry = null) => {

        if (entry) {

            setEditingSale(entry);

            setSaleFormData({

                entryDate:
                    entry.entryDate
                        ? String(entry.entryDate).split('T')[0]
                        : '',

                customerId:
                    entry.customer?.customerId || '',

                boxesSold:
                    entry.boxesSold ?? '',

                rate:
                    entry.rate ?? '',

                notes:
                    entry.notes || ''
            });

        } else {

            setEditingSale(null);

            resetSaleForm();
        }

        setSaleModalOpen(true);
    };


    const closeSaleModal = () => {

        setSaleModalOpen(false);

        setEditingSale(null);

        resetSaleForm();
    };


    const handleSaleSubmit = (e) => {

        e.preventDefault();

        const payload = {

            entryDate:
                saleFormData.entryDate,

            customerId:
                Number(saleFormData.customerId),

            boxesSold:
                Number(saleFormData.boxesSold),

            rate:
                Number(saleFormData.rate),

            notes:
                saleFormData.notes
        };


        if (editingSale) {

            updateSaleMutation.mutate({

                id:
                    editingSale.pioSaleId,

                data:
                    payload
            });

        } else {

            createSaleMutation.mutate(payload);
        }
    };


    const handleDeleteSale = (entry) => {

        const confirmed = window.confirm(
            'Are you sure you want to delete this sale entry?'
        );

        if (!confirmed) {
            return;
        }

        deleteSaleMutation.mutate(
            entry.pioSaleId
        );
    };


    /*
     * =========================
     * SEND CUSTOMER MESSAGE
     * =========================
     */

    const handleSendMessage = (entry) => {

        const customerName =
            entry.customer?.customerName ||
            'this customer';

        const confirmed = window.confirm(
            `Send SMS and WhatsApp message to ${customerName}?`
        );

        if (!confirmed) {
            return;
        }

        sendMessageMutation.mutate(
            entry.pioSaleId
        );
    };


    /*
     * =========================
     * SALE TOTAL
     * =========================
     */

    const saleTotalAmount =
        (Number(saleFormData.boxesSold) || 0) *
        (Number(saleFormData.rate) || 0);


    /*
     * =========================
     * LOADING
     * =========================
     */

    if (
        productionsLoading ||
        salesLoading ||
        stockLoading
    ) {

        return <Loading />;
    }


    return (

        <div>


            {/* PAGE HEADER */}

            <div className="flex justify-between items-center mb-6">

                <h1 className="text-2xl font-bold text-primary-400">
                    PIO Entries
                </h1>

            </div>


            {/* STOCK SUMMARY */}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

                <div className="card">

                    <p className="text-sm text-theme-muted">
                        Total Production
                    </p>

                    <p className="text-2xl font-bold text-primary-400">
                        {stockSummary?.totalProduction ?? 0}
                    </p>

                    <p className="text-xs text-theme-muted mt-1">
                        Boxes
                    </p>

                </div>


                <div className="card">

                    <p className="text-sm text-theme-muted">
                        Total Boxes Sold
                    </p>

                    <p className="text-2xl font-bold text-primary-400">
                        {stockSummary?.totalBoxesSold ?? 0}
                    </p>

                    <p className="text-xs text-theme-muted mt-1">
                        Boxes
                    </p>

                </div>


                <div className="card">

                    <p className="text-sm text-theme-muted">
                        Available Stock
                    </p>

                    <p className="text-2xl font-bold text-green-400">
                        {stockSummary?.currentStock ?? 0}
                    </p>

                    <p className="text-xs text-theme-muted mt-1">
                        Boxes
                    </p>

                </div>

            </div>


            {/* PRODUCTION SECTION */}

            <div className="flex justify-between items-center mb-4">

                <h2 className="text-xl font-bold text-primary-400">
                    PIO Production
                </h2>

                <button
                    onClick={() => openProductionModal()}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    Add Production
                </button>

            </div>


            <div className="card mb-8">

                <Table

                    columns={[

                        {
                            key: 'pioProductionId',
                            label: 'ID'
                        },

                        {
                            key: 'entryDate',
                            label: 'Date'
                        },

                        {
                            key: 'season',
                            label: 'Season'
                        },

                        {
                            key: 'productionBoxes',
                            label: 'Production Boxes'
                        },

                        {
                            key: 'notes',
                            label: 'Notes',
                            render: (value) =>
                                value || '-'
                        }

                    ]}

                    data={productions || []}

                    actions={(row) => (

                        <div className="flex gap-3">

                            <button
                                onClick={() =>
                                    openProductionModal(row)
                                }
                                className="text-primary-400 hover:text-primary-300"
                                title="Edit"
                            >
                                <Edit size={18} />
                            </button>


                            <button
                                onClick={() =>
                                    handleDeleteProduction(row)
                                }
                                className="text-red-400 hover:text-red-300"
                                title="Delete"
                            >
                                <Trash2 size={18} />
                            </button>

                        </div>

                    )}

                />

            </div>


            {/* SALES SECTION */}

            <div className="flex justify-between items-center mb-4">

                <h2 className="text-xl font-bold text-primary-400">
                    PIO Sales
                </h2>

                <button
                    onClick={() => openSaleModal()}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    Add Sale
                </button>

            </div>


            <div className="card">

                <Table

                    columns={[

                        {
                            key: 'pioSaleId',
                            label: 'ID'
                        },

                        {
                            key: 'entryDate',
                            label: 'Date'
                        },

                        {
                            key: 'season',
                            label: 'Season'
                        },

                        {
                            key: 'customer',
                            label: 'Customer',
                            render: (value) =>
                                value?.customerName || '-'
                        },

                        {
                            key: 'boxesSold',
                            label: 'Boxes Sold'
                        },

                        {
                            key: 'rate',
                            label: 'Rate'
                        },

                        {
                            key: 'totalAmount',
                            label: 'Total Amount'
                        },

                        {
                            key: 'notes',
                            label: 'Notes',
                            render: (value) =>
                                value || '-'
                        }

                    ]}

                    data={sales || []}

                    actions={(row) => (

                        <div className="flex gap-3">


                            {/* SEND MESSAGE */}

                            <button
                                onClick={() =>
                                    handleSendMessage(row)
                                }
                                className="text-green-400 hover:text-green-300"
                                title="Send SMS and WhatsApp"
                                disabled={
                                    sendMessageMutation.isPending
                                }
                            >
                                <Send size={18} />
                            </button>


                            {/* EDIT */}

                            <button
                                onClick={() =>
                                    openSaleModal(row)
                                }
                                className="text-primary-400 hover:text-primary-300"
                                title="Edit"
                            >
                                <Edit size={18} />
                            </button>


                            {/* DELETE */}

                            <button
                                onClick={() =>
                                    handleDeleteSale(row)
                                }
                                className="text-red-400 hover:text-red-300"
                                title="Delete"
                            >
                                <Trash2 size={18} />
                            </button>

                        </div>

                    )}

                />

            </div>


            {/* PRODUCTION MODAL */}

            <Modal

                isOpen={productionModalOpen}

                onClose={closeProductionModal}

                title={
                    editingProduction
                        ? 'Edit PIO Production'
                        : 'Add PIO Production'
                }
            >

                <form
                    onSubmit={handleProductionSubmit}
                    className="space-y-4"
                >


                    <div>

                        <label className="block text-sm font-medium text-primary-400/90 mb-1">
                            Entry Date
                        </label>

                        <input
                            type="date"
                            value={productionFormData.entryDate}
                            onChange={(e) =>
                                setProductionFormData({

                                    ...productionFormData,

                                    entryDate:
                                        e.target.value
                                })
                            }
                            className="input-field"
                            required
                        />

                    </div>


                    <div>

                        <label className="block text-sm font-medium text-primary-400/90 mb-1">
                            Production Boxes
                        </label>

                        <input
                            type="number"
                            min="0"
                            value={
                                productionFormData.productionBoxes
                            }
                            onChange={(e) =>
                                setProductionFormData({

                                    ...productionFormData,

                                    productionBoxes:
                                        e.target.value
                                })
                            }
                            className="input-field"
                            required
                        />

                    </div>


                    <div>

                        <label className="block text-sm font-medium text-primary-400/90 mb-1">
                            Notes
                        </label>

                        <textarea
                            value={productionFormData.notes}
                            onChange={(e) =>
                                setProductionFormData({

                                    ...productionFormData,

                                    notes:
                                        e.target.value
                                })
                            }
                            className="input-field"
                            rows={3}
                        />

                    </div>


                    <div className="flex justify-end gap-2 pt-4">

                        <button
                            type="button"
                            onClick={closeProductionModal}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={
                                createProductionMutation.isPending ||
                                updateProductionMutation.isPending
                            }
                        >
                            {
                                editingProduction
                                    ? 'Update'
                                    : 'Create'
                            }
                        </button>

                    </div>

                </form>

            </Modal>


            {/* SALE MODAL */}

            <Modal

                isOpen={saleModalOpen}

                onClose={closeSaleModal}

                title={
                    editingSale
                        ? 'Edit PIO Sale'
                        : 'Add PIO Sale'
                }
            >

                <form
                    onSubmit={handleSaleSubmit}
                    className="space-y-4"
                >


                    <div>

                        <label className="block text-sm font-medium text-primary-400/90 mb-1">
                            Entry Date
                        </label>

                        <input
                            type="date"
                            value={saleFormData.entryDate}
                            onChange={(e) =>
                                setSaleFormData({

                                    ...saleFormData,

                                    entryDate:
                                        e.target.value
                                })
                            }
                            className="input-field"
                            required
                        />

                    </div>


                    <div>

                        <label className="block text-sm font-medium text-primary-400/90 mb-1">
                            Customer
                        </label>

                        <select
                            value={saleFormData.customerId}
                            onChange={(e) =>
                                setSaleFormData({

                                    ...saleFormData,

                                    customerId:
                                        e.target.value
                                })
                            }
                            className="input-field"
                            required
                        >

                            <option value="">
                                Select Customer
                            </option>

                            {(customers || []).map(
                                (customer) => (

                                    <option
                                        key={customer.customerId}
                                        value={customer.customerId}
                                    >
                                        {customer.customerName}
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    <div>

                        <label className="block text-sm font-medium text-primary-400/90 mb-1">
                            Boxes Sold
                        </label>

                        <input
                            type="number"
                            min="0"
                            value={saleFormData.boxesSold}
                            onChange={(e) =>
                                setSaleFormData({

                                    ...saleFormData,

                                    boxesSold:
                                        e.target.value
                                })
                            }
                            className="input-field"
                            required
                        />

                    </div>


                    <div>

                        <label className="block text-sm font-medium text-primary-400/90 mb-1">
                            Rate
                        </label>

                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={saleFormData.rate}
                            onChange={(e) =>
                                setSaleFormData({

                                    ...saleFormData,

                                    rate:
                                        e.target.value
                                })
                            }
                            className="input-field"
                            required
                        />

                    </div>


                    <div>

                        <label className="block text-sm font-medium text-primary-400/90 mb-1">
                            Total Amount
                        </label>

                        <input
                            type="text"
                            value={
                                saleTotalAmount.toFixed(2)
                            }
                            className="input-field opacity-70"
                            readOnly
                        />

                    </div>


                    <div>

                        <label className="block text-sm font-medium text-primary-400/90 mb-1">
                            Notes
                        </label>

                        <textarea
                            value={saleFormData.notes}
                            onChange={(e) =>
                                setSaleFormData({

                                    ...saleFormData,

                                    notes:
                                        e.target.value
                                })
                            }
                            className="input-field"
                            rows={3}
                        />

                    </div>


                    <div className="flex justify-end gap-2 pt-4">

                        <button
                            type="button"
                            onClick={closeSaleModal}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={
                                createSaleMutation.isPending ||
                                updateSaleMutation.isPending
                            }
                        >
                            {
                                editingSale
                                    ? 'Update'
                                    : 'Create'
                            }
                        </button>

                    </div>

                </form>

            </Modal>

        </div>
    );
};

export default PioEntries;