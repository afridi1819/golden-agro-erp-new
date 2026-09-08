import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { rasnaEntryApi } from '../api/businessApi';
import { safeQueryData } from '../api/queryHelpers';
import Loading from '../components/common/Loading';
import Table from '../components/common/Table';

const CustomerDetails = () => {
    const { customerId } = useParams();
    const navigate = useNavigate();

    const { data: summary, isLoading } = useQuery({
        queryKey: ['customer-rasna-summary', customerId],
        queryFn: () =>
            safeQueryData(() =>
                rasnaEntryApi.getCustomerSummary(customerId)
            ),
        enabled: !!customerId
    });

    if (isLoading) {
        return <Loading />;
    }

    if (!summary) {
        return (
            <div className="text-center text-theme-muted">
                Customer details not found
            </div>
        );
    }

    const formatAmount = (amount) =>
        Number(amount || 0).toFixed(2);

    return (
        <div>

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">

                <button
                    onClick={() => navigate(-1)}
                    className="btn-secondary flex items-center gap-2"
                >
                    <ArrowLeft size={18} />
                    Back
                </button>

                <div>
                    <h1 className="text-2xl font-bold text-primary-400">
                        {summary.customerName}
                    </h1>

                    <p className="text-theme-muted">
                        Rasna Customer Transaction Summary — {summary.season}
                    </p>
                </div>

            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

                <div className="card p-4">
                    <p className="text-theme-muted text-sm">
                        Total Entries
                    </p>

                    <p className="text-2xl font-bold text-primary-400">
                        {summary.totalEntries || 0}
                    </p>
                </div>

                <div className="card p-4">
                    <p className="text-theme-muted text-sm">
                        Filled Crates Sold
                    </p>

                    <p className="text-2xl font-bold text-green-400">
                        {summary.totalCratesSold || 0}
                    </p>
                </div>

                <div className="card p-4">
                    <p className="text-theme-muted text-sm">
                        Empty Crates Returned
                    </p>

                    <p className="text-2xl font-bold text-blue-400">
                        {summary.totalEmptyCratesReturned || 0}
                    </p>
                </div>

                <div className="card p-4">
                    <p className="text-theme-muted text-sm">
                        Total Broken Bottles
                    </p>

                    <p className="text-2xl font-bold text-red-400">
                        {summary.totalBrokenBottles || 0}
                    </p>
                </div>

                <div className="card p-4">
                    <p className="text-theme-muted text-sm">
                        Broken Bottles Paid
                    </p>

                    <p className="text-2xl font-bold text-green-400">
                        {summary.paidBrokenBottleCount || 0}
                    </p>
                </div>

                <div className="card p-4">
                    <p className="text-theme-muted text-sm">
                        Broken Bottles Unpaid
                    </p>

                    <p className="text-2xl font-bold text-red-400">
                        {summary.unpaidBrokenBottleCount || 0}
                    </p>
                </div>

                <div className="card p-4">
                    <p className="text-theme-muted text-sm">
                        Total Rasna Sales
                    </p>

                    <p className="text-2xl font-bold text-primary-400">
                        ₹ {formatAmount(summary.totalSalesAmount)}
                    </p>
                </div>

            </div>

            {/* Transaction History */}
            <div className="card">

                <div className="p-4 border-b border-theme-border">
                    <h2 className="text-lg font-bold text-primary-400">
                        Transaction History
                    </h2>
                </div>

                <Table
                    columns={[
                        {
                            key: 'entryDate',
                            label: 'Date'
                        },
                        {
                            key: 'filledCratesSold',
                            label: 'Crates Sold'
                        },
                        {
                            key: 'emptyCratesReturned',
                            label: 'Crates Returned'
                        },
                        {
                            key: 'brokenBottles',
                            label: 'Broken Bottles'
                        },
                        {
                            key: 'brokenBottlePaymentStatus',
                            label: 'Broken Bottle Payment',
                            render: (value) => (
                                <span
                                    className={`px-2 py-1 rounded-full text-xs ${value === 'paid'
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-red-500/20 text-red-400'
                                        }`}
                                >
                                    {value === 'paid'
                                        ? 'Paid'
                                        : 'Unpaid'}
                                </span>
                            )
                        },
                        {
                            key: 'rate',
                            label: 'Rate',
                            render: (value) =>
                                `₹ ${formatAmount(value)}`
                        },
                        {
                            key: 'totalAmount',
                            label: 'Total Amount',
                            render: (value) =>
                                `₹ ${formatAmount(value)}`
                        },
                        {
                            key: 'notes',
                            label: 'Notes',
                            render: (value) =>
                                value || '-'
                        }
                    ]}
                    data={summary.entries || []}
                />

            </div>

        </div>
    );
};

export default CustomerDetails;