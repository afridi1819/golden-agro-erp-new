import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';

import {
    customerApi,
    rasnaEntryApi,
    notificationApi
} from '../api/businessApi';

import { safeQueryData } from '../api/queryHelpers';
import Loading from '../components/common/Loading';

const RasnaCustomerSummary = () => {
    const currentSeason = String(new Date().getFullYear());

    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [selectedSeason, setSelectedSeason] = useState(currentSeason);

    /*
     * =========================
     * CUSTOMERS
     * =========================
     */

    const {
        data: customers,
        isLoading: customersLoading
    } = useQuery({
        queryKey: ['customers'],

        queryFn: () =>
            safeQueryData(() =>
                customerApi.getActive()
            )
    });

    /*
     * =========================
     * RASNA ENTRIES
     * =========================
     */

    const {
        data: allEntries,
        isLoading: entriesLoading
    } = useQuery({
        queryKey: ['rasna-entries'],

        queryFn: () =>
            safeQueryData(() =>
                rasnaEntryApi.getAll()
            ),

        onError: () => {
            toast.error('Failed to load Rasna entries');
        }
    });

    /*
     * =========================
     * CUSTOMER ENTRIES
     * =========================
     */

    const customerEntries = useMemo(() => {
        if (!selectedCustomerId) {
            return [];
        }

        return (allEntries || []).filter(
            (entry) =>
                String(entry.customer?.customerId) ===
                String(selectedCustomerId)
        );
    }, [allEntries, selectedCustomerId]);

    /*
     * =========================
     * AVAILABLE SEASONS
     * =========================
     */

    const seasons = useMemo(() => {
        const uniqueSeasons = [
            ...new Set(
                customerEntries
                    .map((entry) => entry.season)
                    .filter(Boolean)
            )
        ];

        return uniqueSeasons.sort(
            (a, b) =>
                String(b).localeCompare(
                    String(a),
                    undefined,
                    { numeric: true }
                )
        );
    }, [customerEntries]);

    /*
     * =========================
     * FILTERED ENTRIES
     * =========================
     */

    const filteredEntries = useMemo(() => {
        if (selectedSeason === 'all') {
            return customerEntries;
        }

        return customerEntries.filter(
            (entry) =>
                String(entry.season) ===
                String(selectedSeason)
        );
    }, [customerEntries, selectedSeason]);

    /*
     * =========================
     * SELECTED CUSTOMER
     * =========================
     */

    const selectedCustomer = useMemo(() => {
        return (customers || []).find(
            (customer) =>
                String(customer.customerId) ===
                String(selectedCustomerId)
        );
    }, [customers, selectedCustomerId]);

    /*
     * =========================
     * SELECTED SEASON TOTALS
     * =========================
     */

    const summaryTotals = useMemo(() => {
        const totalEntries = filteredEntries.length;

        const totalCratesSold = filteredEntries.reduce(
            (total, entry) =>
                total +
                Number(entry.filledCratesSold || 0),
            0
        );

        const totalEmptyCratesReturned =
            filteredEntries.reduce(
                (total, entry) =>
                    total +
                    Number(entry.emptyCratesReturned || 0),
                0
            );

        const totalBrokenBottles =
            filteredEntries.reduce(
                (total, entry) =>
                    total +
                    Number(entry.brokenBottles || 0),
                0
            );

        const paidBrokenBottleCount =
            filteredEntries
                .filter(
                    (entry) =>
                        String(
                            entry.brokenBottlePaymentStatus
                        ).toLowerCase() === 'paid'
                )
                .reduce(
                    (total, entry) =>
                        total +
                        Number(entry.brokenBottles || 0),
                    0
                );

        const unpaidBrokenBottleCount =
            filteredEntries
                .filter(
                    (entry) =>
                        String(
                            entry.brokenBottlePaymentStatus
                        ).toLowerCase() !== 'paid'
                )
                .reduce(
                    (total, entry) =>
                        total +
                        Number(entry.brokenBottles || 0),
                    0
                );

        const totalSalesAmount =
            filteredEntries.reduce(
                (total, entry) => {
                    const crates = Number(
                        entry.filledCratesSold || 0
                    );

                    const rate = Number(
                        entry.rate || 0
                    );

                    return total + crates * rate;
                },
                0
            );

        return {
            totalEntries,
            totalCratesSold,
            totalEmptyCratesReturned,
            totalBrokenBottles,
            paidBrokenBottleCount,
            unpaidBrokenBottleCount,
            totalSalesAmount
        };
    }, [filteredEntries]);

    /*
     * =========================
     * SEASON-WISE SUMMARY
     * =========================
     */

    const seasonWiseSummary = useMemo(() => {
        const summaryMap = {};

        customerEntries.forEach((entry) => {
            const season =
                entry.season || 'Unknown';

            if (!summaryMap[season]) {
                summaryMap[season] = {
                    season,
                    totalEntries: 0,
                    totalCratesSold: 0,
                    totalEmptyCratesReturned: 0,
                    totalBrokenBottles: 0,
                    paidBrokenBottles: 0,
                    unpaidBrokenBottles: 0,
                    totalSalesAmount: 0
                };
            }

            const crates = Number(
                entry.filledCratesSold || 0
            );

            const emptyCrates = Number(
                entry.emptyCratesReturned || 0
            );

            const brokenBottles = Number(
                entry.brokenBottles || 0
            );

            const rate = Number(
                entry.rate || 0
            );

            const isPaid =
                String(
                    entry.brokenBottlePaymentStatus
                ).toLowerCase() === 'paid';

            summaryMap[season].totalEntries += 1;

            summaryMap[season].totalCratesSold +=
                crates;

            summaryMap[
                season
            ].totalEmptyCratesReturned +=
                emptyCrates;

            summaryMap[
                season
            ].totalBrokenBottles +=
                brokenBottles;

            if (isPaid) {
                summaryMap[
                    season
                ].paidBrokenBottles +=
                    brokenBottles;
            } else {
                summaryMap[
                    season
                ].unpaidBrokenBottles +=
                    brokenBottles;
            }

            summaryMap[
                season
            ].totalSalesAmount +=
                crates * rate;
        });

        return Object.values(summaryMap).sort(
            (a, b) =>
                String(b.season).localeCompare(
                    String(a.season),
                    undefined,
                    {
                        numeric: true
                    }
                )
        );
    }, [customerEntries]);

    /*
     * =========================
     * SEND COMPLETE SUMMARY
     * =========================
     */

    const handleSendSummary = async () => {
        if (!selectedCustomerId) {
            toast.error(
                'Please select a customer first'
            );

            return;
        }

        if (filteredEntries.length === 0) {
            toast.error(
                'No Rasna entries available for this season'
            );

            return;
        }

        const customerName =
            selectedCustomer?.customerName ||
            'this customer';

        const seasonText =
            selectedSeason === 'all'
                ? 'all seasons'
                : `season ${selectedSeason}`;

        const confirmed = window.confirm(
            `Send Rasna summary for ${seasonText} to ${customerName} through SMS and WhatsApp?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await notificationApi.sendRasnaCustomerSummary(
                selectedCustomerId,
                selectedSeason
            );

            toast.success(
                `Notification request received for ${customerName}`
            );
        } catch (error) {
            console.error(
                'Notification error:',
                error
            );

            toast.error(
                'Failed to send notification'
            );
        }
    };

    /*
     * =========================
     * SEND PARTICULAR SEASON
     * =========================
     */

    const handleSendSeasonSummary = async (
        season
    ) => {
        if (!selectedCustomerId) {
            toast.error(
                'Please select a customer first'
            );

            return;
        }

        const customerName =
            selectedCustomer?.customerName ||
            'this customer';

        const confirmed = window.confirm(
            `Send Rasna summary for season ${season} to ${customerName} through SMS and WhatsApp?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await notificationApi.sendRasnaCustomerSummary(
                selectedCustomerId,
                season
            );

            toast.success(
                `Season ${season} notification request received for ${customerName}`
            );
        } catch (error) {
            console.error(
                'Season notification error:',
                error
            );

            toast.error(
                'Failed to send season notification'
            );
        }
    };

    /*
     * =========================
     * SEND INDIVIDUAL ENTRY
     * =========================
     */

    const handleSendEntry = async (
        entry
    ) => {
        const customerName =
            selectedCustomer?.customerName ||
            entry.customer?.customerName ||
            'this customer';

        const confirmed = window.confirm(
            `Send this Rasna entry to ${customerName} through SMS and WhatsApp?`
        );

        if (!confirmed) {
            return;
        }

        try {
            await notificationApi.sendRasnaEntry(
                entry.rasnaEntryId
            );

            toast.success(
                `Notification request received for ${customerName}`
            );
        } catch (error) {
            console.error(
                'Entry notification error:',
                error
            );

            toast.error(
                'Failed to send entry notification'
            );
        }
    };

    /*
     * =========================
     * LOADING
     * =========================
     */

    if (
        customersLoading ||
        entriesLoading
    ) {
        return <Loading />;
    }

    return (
        <div>
            {/* PAGE HEADER */}

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-primary-400">
                    Rasna Customer Summary
                </h1>

                <p className="text-theme-muted mt-1">
                    View customer-wise and season-wise Rasna transactions
                </p>
            </div>

            {/* FILTERS */}

            <div className="card mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* CUSTOMER */}

                    <div>
                        <label className="block text-sm font-medium text-primary-400/90 mb-2">
                            Select Customer
                        </label>

                        <select
                            value={selectedCustomerId}
                            onChange={(e) => {
                                setSelectedCustomerId(
                                    e.target.value
                                );

                                setSelectedSeason(
                                    currentSeason
                                );
                            }}
                            className="input-field"
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
                                        {customer.customerName}
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    {/* SEASON */}

                    <div>
                        <label className="block text-sm font-medium text-primary-400/90 mb-2">
                            Select Season / Year
                        </label>

                        <select
                            value={selectedSeason}
                            onChange={(e) =>
                                setSelectedSeason(
                                    e.target.value
                                )
                            }
                            className="input-field"
                            disabled={!selectedCustomerId}
                        >
                            <option value="all">
                                All Seasons
                            </option>

                            {seasons.map(
                                (season) => (
                                    <option
                                        key={season}
                                        value={season}
                                    >
                                        {season}
                                    </option>
                                )
                            )}
                        </select>
                    </div>
                </div>
            </div>

            {/* NO CUSTOMER */}

            {!selectedCustomerId && (
                <div className="card text-center py-10">
                    <p className="text-theme-muted">
                        Select a customer to view their Rasna summary.
                    </p>
                </div>
            )}

            {/* CUSTOMER DATA */}

            {selectedCustomerId && (
                <>
                    {/* CUSTOMER INFORMATION */}

                    <div className="card mb-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                            <div>
                                <h2 className="text-xl font-semibold text-primary-400">
                                    {selectedCustomer?.customerName ||
                                        'Customer'}
                                </h2>

                                <p className="text-theme-muted mt-2">
                                    Viewing:{' '}

                                    {selectedSeason === 'all'
                                        ? 'All Seasons'
                                        : `Season ${selectedSeason}`}
                                </p>
                            </div>

                            {/* KEEP COMMON SEND SUMMARY BUTTON */}

                            <button
                                onClick={
                                    handleSendSummary
                                }
                                className="btn-primary flex items-center justify-center gap-2"
                            >
                                <Send size={18} />

                                Send Summary
                            </button>
                        </div>
                    </div>

                    {/* SEASON WISE SUMMARY */}

                    <div className="card mb-6">
                        <h2 className="text-xl font-semibold text-primary-400 mb-4">
                            Season Wise Summary
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1050px]">
                                <thead>
                                    <tr className="border-b border-gray-700">

                                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-400 uppercase">
                                            Season
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-400 uppercase">
                                            Entries
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-400 uppercase">
                                            Crates Sold
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-400 uppercase">
                                            Empty Crates Returned
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-400 uppercase">
                                            Broken Bottles
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-400 uppercase">
                                            Paid
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-400 uppercase">
                                            Unpaid
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-400 uppercase">
                                            Total Sales
                                        </th>

                                        {/* NEW ACTION COLUMN */}

                                        <th className="px-4 py-3 text-center text-xs font-semibold text-primary-400 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {seasonWiseSummary.map(
                                        (summary) => (
                                            <tr
                                                key={
                                                    summary.season
                                                }
                                                className="border-b border-gray-800"
                                            >
                                                <td className="px-4 py-3">
                                                    {summary.season}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {summary.totalEntries}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {summary.totalCratesSold}
                                                </td>

                                                <td className="px-4 py-3">
                                                    {
                                                        summary.totalEmptyCratesReturned
                                                    }
                                                </td>

                                                <td className="px-4 py-3 text-red-400">
                                                    {
                                                        summary.totalBrokenBottles
                                                    }
                                                </td>

                                                <td className="px-4 py-3 text-green-400">
                                                    {
                                                        summary.paidBrokenBottles
                                                    }
                                                </td>

                                                <td className="px-4 py-3 text-red-400">
                                                    {
                                                        summary.unpaidBrokenBottles
                                                    }
                                                </td>

                                                <td className="px-4 py-3 text-primary-400">
                                                    ₹{' '}

                                                    {summary.totalSalesAmount.toFixed(
                                                        2
                                                    )}
                                                </td>

                                                {/* SEASON SEND BUTTON */}

                                                <td className="px-4 py-3 text-center">
                                                    <button
                                                        onClick={() =>
                                                            handleSendSeasonSummary(
                                                                summary.season
                                                            )
                                                        }
                                                        className="p-2 rounded-lg text-primary-400 hover:bg-primary-500/10 transition-colors"
                                                        title={`Send Season ${summary.season} Summary`}
                                                    >
                                                        <Send size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    )}

                                    {seasonWiseSummary.length ===
                                        0 && (
                                            <tr>
                                                <td
                                                    colSpan="9"
                                                    className="px-4 py-8 text-center text-theme-muted"
                                                >
                                                    No season summary available.
                                                </td>
                                            </tr>
                                        )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* DAILY ENTRIES */}

                    <div className="card">
                        <h2 className="text-xl font-semibold text-primary-400 mb-4">
                            Rasna Transactions
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1150px]">

                                <thead>
                                    <tr className="border-b border-gray-700">

                                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-400 uppercase">
                                            Date
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-400 uppercase">
                                            Crates Sold
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-400 uppercase">
                                            Empty Crates
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-400 uppercase">
                                            Broken Bottles
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-400 uppercase">
                                            Payment
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-400 uppercase">
                                            Rate
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-400 uppercase">
                                            Total Amount
                                        </th>

                                        <th className="px-4 py-3 text-left text-xs font-semibold text-primary-400 uppercase">
                                            Notes
                                        </th>

                                        {/* NEW ACTION COLUMN */}

                                        <th className="px-4 py-3 text-center text-xs font-semibold text-primary-400 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredEntries.map(
                                        (entry) => {
                                            const rate = Number(
                                                entry.rate || 0
                                            );

                                            const totalAmount =
                                                Number(
                                                    entry.filledCratesSold ||
                                                    0
                                                ) * rate;

                                            const isPaid =
                                                String(
                                                    entry.brokenBottlePaymentStatus
                                                ).toLowerCase() ===
                                                'paid';

                                            return (
                                                <tr
                                                    key={
                                                        entry.rasnaEntryId
                                                    }
                                                    className="border-b border-gray-800"
                                                >
                                                    <td className="px-4 py-3">
                                                        {entry.entryDate}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        {
                                                            entry.filledCratesSold ||
                                                            0
                                                        }
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        {
                                                            entry.emptyCratesReturned ||
                                                            0
                                                        }
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        {
                                                            entry.brokenBottles ||
                                                            0
                                                        }
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`px-2 py-1 rounded-full text-xs ${isPaid
                                                                    ? 'bg-green-500/20 text-green-400'
                                                                    : 'bg-red-500/20 text-red-400'
                                                                }`}
                                                        >
                                                            {isPaid
                                                                ? 'Paid'
                                                                : 'Unpaid'}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        ₹{' '}

                                                        {rate.toFixed(2)}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        ₹{' '}

                                                        {totalAmount.toFixed(
                                                            2
                                                        )}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        {entry.notes || '-'}
                                                    </td>

                                                    {/* INDIVIDUAL ENTRY SEND BUTTON */}

                                                    <td className="px-4 py-3 text-center">
                                                        <button
                                                            onClick={() =>
                                                                handleSendEntry(
                                                                    entry
                                                                )
                                                            }
                                                            className="p-2 rounded-lg text-primary-400 hover:bg-primary-500/10 transition-colors"
                                                            title="Send Entry"
                                                        >
                                                            <Send size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}

                                    {filteredEntries.length ===
                                        0 && (
                                            <tr>
                                                <td
                                                    colSpan="9"
                                                    className="px-4 py-8 text-center text-theme-muted"
                                                >
                                                    No Rasna transactions found for this season.
                                                </td>
                                            </tr>
                                        )}
                                </tbody>

                                {filteredEntries.length > 0 && (
                                    <tfoot>
                                        <tr className="border-t-2 border-primary-500 font-bold">

                                            <td className="px-4 py-4 text-primary-400">
                                                TOTAL

                                                <div className="text-xs text-theme-muted font-normal mt-1">
                                                    {
                                                        summaryTotals.totalEntries
                                                    }{' '}
                                                    Entries
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 text-primary-400">
                                                {
                                                    summaryTotals.totalCratesSold
                                                }
                                            </td>

                                            <td className="px-4 py-4 text-primary-400">
                                                {
                                                    summaryTotals.totalEmptyCratesReturned
                                                }
                                            </td>

                                            <td className="px-4 py-4 text-red-400">
                                                {
                                                    summaryTotals.totalBrokenBottles
                                                }
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex flex-col gap-1">

                                                    <span className="text-green-400 text-sm">
                                                        Paid:{' '}

                                                        {
                                                            summaryTotals.paidBrokenBottleCount
                                                        }
                                                    </span>

                                                    <span className="text-red-400 text-sm">
                                                        Unpaid:{' '}

                                                        {
                                                            summaryTotals.unpaidBrokenBottleCount
                                                        }
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4">
                                                -
                                            </td>

                                            <td className="px-4 py-4 text-primary-400">
                                                ₹{' '}

                                                {
                                                    summaryTotals.totalSalesAmount.toFixed(
                                                        2
                                                    )
                                                }
                                            </td>

                                            <td className="px-4 py-4">
                                                -
                                            </td>

                                            {/* ACTION TOTAL */}

                                            <td className="px-4 py-4">
                                                -
                                            </td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default RasnaCustomerSummary;