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
    rasnaEntryApi,
    customerApi,
    notificationApi
} from '../api/businessApi';

import { safeQueryData } from '../api/queryHelpers';

import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Loading from '../components/common/Loading';

const RasnaEntries = () => {

    const queryClient = useQueryClient();

    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);

    const [formData, setFormData] = useState({
        entryDate: new Date().toISOString().split('T')[0],
        customerId: '',
        filledCratesSold: '',
        emptyCratesReturned: '',
        brokenBottles: '',
        brokenBottlePaymentStatus: 'unpaid',
        rate: '',
        notes: ''
    });


    /*
     * =========================
     * DATA QUERIES
     * =========================
     */

    const {
        data: entries,
        isLoading
    } = useQuery({
        queryKey: ['rasna-entries'],
        queryFn: () =>
            safeQueryData(() =>
                rasnaEntryApi.getAll()
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
     * CREATE ENTRY
     * =========================
     */

    const createMutation = useMutation({

        mutationFn: (data) =>
            rasnaEntryApi.create(data),

        onSuccess: () => {

            queryClient.invalidateQueries({
                queryKey: ['rasna-entries']
            });

            toast.success(
                'Rasna entry created successfully'
            );

            closeModal();
        },

        onError: (error) => {

            toast.error(
                error?.response?.data?.message ||
                'Failed to create Rasna entry'
            );
        }
    });


    /*
     * =========================
     * UPDATE ENTRY
     * =========================
     */

    const updateMutation = useMutation({

        mutationFn: ({ id, data }) =>
            rasnaEntryApi.update(
                id,
                data
            ),

        onSuccess: () => {

            queryClient.invalidateQueries({
                queryKey: ['rasna-entries']
            });

            toast.success(
                'Rasna entry updated successfully'
            );

            closeModal();
        },

        onError: (error) => {

            toast.error(
                error?.response?.data?.message ||
                'Failed to update Rasna entry'
            );
        }
    });


    /*
     * =========================
     * DELETE ENTRY
     * =========================
     */

    const deleteMutation = useMutation({

        mutationFn: (id) =>
            rasnaEntryApi.delete(id),

        onSuccess: () => {

            queryClient.invalidateQueries({
                queryKey: ['rasna-entries']
            });

            toast.success(
                'Rasna entry deleted successfully'
            );
        },

        onError: (error) => {

            toast.error(
                error?.response?.data?.message ||
                'Failed to delete Rasna entry'
            );
        }
    });


    /*
     * =========================
     * RESET FORM
     * =========================
     */

    const resetForm = () => {

        setFormData({

            entryDate:
                new Date()
                    .toISOString()
                    .split('T')[0],

            customerId: '',

            filledCratesSold: '',

            emptyCratesReturned: '',

            brokenBottles: '',

            brokenBottlePaymentStatus:
                'unpaid',

            rate: '',

            notes: ''
        });
    };


    /*
     * =========================
     * OPEN MODAL
     * =========================
     */

    const openModal = (entry = null) => {

        if (entry) {

            setEditing(entry);

            setFormData({

                entryDate:
                    entry.entryDate
                        ? String(entry.entryDate)
                            .split('T')[0]
                        : '',

                customerId:
                    entry.customer?.customerId || '',

                filledCratesSold:
                    entry.filledCratesSold ?? '',

                emptyCratesReturned:
                    entry.emptyCratesReturned ?? '',

                brokenBottles:
                    entry.brokenBottles ?? '',

                brokenBottlePaymentStatus:
                    entry.brokenBottlePaymentStatus ||
                    'unpaid',

                rate:
                    entry.rate ?? '',

                notes:
                    entry.notes || ''
            });

        } else {

            setEditing(null);

            resetForm();
        }

        setModalOpen(true);
    };


    /*
     * =========================
     * CLOSE MODAL
     * =========================
     */

    const closeModal = () => {

        setModalOpen(false);

        setEditing(null);

        resetForm();
    };


    /*
     * =========================
     * SUBMIT FORM
     * =========================
     */

    const handleSubmit = (e) => {

        e.preventDefault();

        const payload = {

            ...formData,

            customerId:
                Number(formData.customerId),

            filledCratesSold:
                formData.filledCratesSold === ''
                    ? 0
                    : Number(
                        formData.filledCratesSold
                    ),

            emptyCratesReturned:
                formData.emptyCratesReturned === ''
                    ? 0
                    : Number(
                        formData.emptyCratesReturned
                    ),

            brokenBottles:
                formData.brokenBottles === ''
                    ? 0
                    : Number(
                        formData.brokenBottles
                    ),

            rate:
                formData.rate === ''
                    ? 0
                    : Number(
                        formData.rate
                    )
        };


        if (editing) {

            updateMutation.mutate({

                id:
                    editing.rasnaEntryId,

                data:
                    payload
            });

        } else {

            createMutation.mutate(
                payload
            );
        }
    };


    /*
     * =========================
     * DELETE
     * =========================
     */

    const handleDelete = (entry) => {

        const customerName =
            entry.customer?.customerName ||
            'this customer';

        const confirmed =
            window.confirm(
                `Are you sure you want to delete this Rasna entry for ${customerName}?`
            );

        if (!confirmed) {
            return;
        }

        deleteMutation.mutate(
            entry.rasnaEntryId
        );
    };


    /*
     * =========================
     * SEND NOTIFICATION
     * =========================
     */

    const handleSendNotification = (entry) => {

        const customerName =
            entry.customer?.customerName ||
            'this customer';

        const confirmed =
            window.confirm(
                `Send SMS and WhatsApp message to ${customerName}?`
            );

        if (!confirmed) {
            return;
        }

        // Immediately show confirmation like PIO Entries
        toast.success(
            `Notification request received for ${customerName}`
        );

        notificationApi
            .sendRasnaEntry(
                entry.rasnaEntryId
            )
            .catch((error) => {

                console.error(
                    'Notification error:',
                    error
                );

            });
    };


    /*
     * =========================
     * TOTAL AMOUNT
     * =========================
     */

    const totalAmount =
        (Number(
            formData.filledCratesSold
        ) || 0)
        *
        (Number(
            formData.rate
        ) || 0);


    /*
     * =========================
     * LOADING
     * =========================
     */

    if (isLoading) {

        return <Loading />;
    }


    return (

        <div>


            {/* PAGE HEADER */}

            <div className="flex justify-between items-center mb-6">

                <h1 className="text-2xl font-bold text-primary-400">

                    Rasna Entries

                </h1>


                <button
                    onClick={() =>
                        openModal()
                    }
                    className="btn-primary flex items-center gap-2"
                >

                    <Plus size={20} />

                    Add Rasna Entry

                </button>

            </div>


            {/* ENTRIES TABLE */}

            <div className="card">

                <Table

                    columns={[

                        {
                            key:
                                'rasnaEntryId',

                            label:
                                'ID'
                        },

                        {
                            key:
                                'entryDate',

                            label:
                                'Date'
                        },

                        {
                            key:
                                'season',

                            label:
                                'Season'
                        },

                        {
                            key:
                                'customer',

                            label:
                                'Customer',

                            render:
                                (value) =>
                                    value?.customerName ||
                                    '-'
                        },

                        {
                            key:
                                'filledCratesSold',

                            label:
                                'Crates Sold'
                        },

                        {
                            key:
                                'emptyCratesReturned',

                            label:
                                'Empty Crates Returned'
                        },

                        {
                            key:
                                'brokenBottles',

                            label:
                                'Broken Bottles'
                        },

                        {
                            key:
                                'brokenBottlePaymentStatus',

                            label:
                                'Broken Bottle Payment',

                            render:
                                (value) => (

                                    <span
                                        className={`px-2 py-1 rounded-full text-xs ${String(value)
                                            .toLowerCase() ===
                                            'paid'

                                            ? 'bg-green-500/20 text-green-400'

                                            : 'bg-red-500/20 text-red-400'
                                            }`}
                                    >

                                        {
                                            String(value)
                                                .toLowerCase() ===
                                                'paid'

                                                ? 'Paid'

                                                : 'Unpaid'
                                        }

                                    </span>

                                )
                        },

                        {
                            key:
                                'rate',

                            label:
                                'Rate'
                        },

                        {
                            key:
                                'totalAmount',

                            label:
                                'Total Amount'
                        },

                        {
                            key:
                                'notes',

                            label:
                                'Notes',

                            render:
                                (value) =>
                                    value || '-'
                        }

                    ]}


                    data={
                        entries || []
                    }


                    actions={(row) => (

                        <div className="flex items-center gap-3">


                            {/* SEND */}

                            <button
                                onClick={() =>
                                    handleSendNotification(
                                        row
                                    )
                                }
                                className="text-green-400 hover:text-green-300"
                                title="Send SMS and WhatsApp"
                            >

                                <Send size={18} />

                            </button>


                            {/* EDIT */}

                            <button
                                onClick={() =>
                                    openModal(
                                        row
                                    )
                                }
                                className="text-primary-400 hover:text-primary-300"
                                title="Edit"
                            >

                                <Edit size={18} />

                            </button>


                            {/* DELETE */}

                            <button
                                onClick={() =>
                                    handleDelete(
                                        row
                                    )
                                }
                                className="text-red-400 hover:text-red-300"
                                title="Delete"
                                disabled={
                                    deleteMutation.isPending
                                }
                            >

                                <Trash2 size={18} />

                            </button>

                        </div>

                    )}

                />

            </div>


            {/* MODAL */}

            <Modal

                isOpen={
                    modalOpen
                }

                onClose={
                    closeModal
                }

                title={
                    editing
                        ? 'Edit Rasna Entry'
                        : 'Add Rasna Entry'
                }

            >


                <form
                    onSubmit={
                        handleSubmit
                    }
                    className="space-y-4"
                >


                    {/* ENTRY DATE */}

                    <div>

                        <label className="block text-sm font-medium text-primary-400/90 mb-1">

                            Entry Date

                        </label>


                        <input
                            type="date"

                            value={
                                formData.entryDate
                            }

                            onChange={(e) =>
                                setFormData({

                                    ...formData,

                                    entryDate:
                                        e.target.value
                                })
                            }

                            className="input-field"

                            required
                        />

                    </div>


                    {/* CUSTOMER */}

                    <div>

                        <label className="block text-sm font-medium text-primary-400/90 mb-1">

                            Customer

                        </label>


                        <select

                            value={
                                formData.customerId
                            }

                            onChange={(e) =>
                                setFormData({

                                    ...formData,

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
                                        key={
                                            customer.customerId
                                        }

                                        value={
                                            customer.customerId
                                        }
                                    >

                                        {
                                            customer.customerName
                                        }

                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* CRATES SOLD */}

                    <div>

                        <label className="block text-sm font-medium text-primary-400/90 mb-1">

                            Crates Sold

                        </label>


                        <input

                            type="number"

                            min="0"

                            value={
                                formData.filledCratesSold
                            }

                            onChange={(e) =>
                                setFormData({

                                    ...formData,

                                    filledCratesSold:
                                        e.target.value
                                })
                            }

                            className="input-field"

                            required

                        />

                    </div>


                    {/* EMPTY CRATES */}

                    <div>

                        <label className="block text-sm font-medium text-primary-400/90 mb-1">

                            Empty Crates Returned

                        </label>


                        <input

                            type="number"

                            min="0"

                            value={
                                formData.emptyCratesReturned
                            }

                            onChange={(e) =>
                                setFormData({

                                    ...formData,

                                    emptyCratesReturned:
                                        e.target.value
                                })
                            }

                            className="input-field"

                            required

                        />

                    </div>


                    {/* BROKEN BOTTLES */}

                    <div>

                        <label className="block text-sm font-medium text-primary-400/90 mb-1">

                            Broken Bottles

                        </label>


                        <input

                            type="number"

                            min="0"

                            value={
                                formData.brokenBottles
                            }

                            onChange={(e) =>
                                setFormData({

                                    ...formData,

                                    brokenBottles:
                                        e.target.value
                                })
                            }

                            className="input-field"

                            required

                        />

                    </div>


                    {/* PAYMENT STATUS */}

                    <div>

                        <label className="block text-sm font-medium text-primary-400/90 mb-2">

                            Broken Bottle Payment

                        </label>


                        <div className="flex gap-3">


                            <button

                                type="button"

                                onClick={() =>
                                    setFormData({

                                        ...formData,

                                        brokenBottlePaymentStatus:
                                            'paid'
                                    })
                                }

                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${formData
                                    .brokenBottlePaymentStatus ===
                                    'paid'

                                    ? 'bg-green-600 text-white'

                                    : 'bg-theme-border text-theme-muted hover:bg-green-600/30'
                                    }`}

                            >

                                Paid

                            </button>


                            <button

                                type="button"

                                onClick={() =>
                                    setFormData({

                                        ...formData,

                                        brokenBottlePaymentStatus:
                                            'unpaid'
                                    })
                                }

                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${formData
                                    .brokenBottlePaymentStatus ===
                                    'unpaid'

                                    ? 'bg-red-600 text-white'

                                    : 'bg-theme-border text-theme-muted hover:bg-red-600/30'
                                    }`}

                            >

                                Unpaid

                            </button>

                        </div>

                    </div>


                    {/* RATE */}

                    <div>

                        <label className="block text-sm font-medium text-primary-400/90 mb-1">

                            Rate

                        </label>


                        <input

                            type="number"

                            min="0"

                            step="0.01"

                            value={
                                formData.rate
                            }

                            onChange={(e) =>
                                setFormData({

                                    ...formData,

                                    rate:
                                        e.target.value
                                })
                            }

                            className="input-field"

                            required

                        />

                    </div>


                    {/* TOTAL */}

                    <div>

                        <label className="block text-sm font-medium text-primary-400/90 mb-1">

                            Total Amount

                        </label>


                        <input

                            type="text"

                            value={
                                totalAmount.toFixed(2)
                            }

                            className="input-field opacity-70"

                            readOnly

                        />

                    </div>


                    {/* NOTES */}

                    <div>

                        <label className="block text-sm font-medium text-primary-400/90 mb-1">

                            Notes

                        </label>


                        <textarea

                            value={
                                formData.notes
                            }

                            onChange={(e) =>
                                setFormData({

                                    ...formData,

                                    notes:
                                        e.target.value
                                })
                            }

                            className="input-field"

                            rows={3}

                        />

                    </div>


                    {/* BUTTONS */}

                    <div className="flex justify-end gap-2 pt-4">


                        <button

                            type="button"

                            onClick={
                                closeModal
                            }

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

                            {
                                editing
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

export default RasnaEntries;