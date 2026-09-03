import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';

import {
    customerApi,
    pioSaleApi,
    notificationApi
} from '../api/businessApi';

import { safeQueryData } from '../api/queryHelpers';
import Table from '../components/common/Table';
import Loading from '../components/common/Loading';

const PioCustomerSummary = () => {

    const currentYear = new Date().getFullYear().toString();

    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [selectedSeason, setSelectedSeason] = useState(currentYear);


    /*
     * =========================
     * HELPER FUNCTIONS
     * =========================
     */

    const getSaleDate = (sale) => {

        return (
            sale.saleDate ||
            sale.entryDate ||
            sale.date ||
            null
        );

    };


    const getSaleSeason = (sale) => {

        if (sale.season) {
            return String(sale.season);
        }

        const date = getSaleDate(sale);

        if (!date) {
            return '';
        }

        /*
         * Handles YYYY-MM-DD without timezone problems
         */

        if (typeof date === 'string' && date.length >= 4) {
            return date.substring(0, 4);
        }

        return String(
            new Date(date).getFullYear()
        );

    };


    /*
     * =========================
     * ACTIVE CUSTOMERS
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
     * ALL PIO SALES
     * =========================
     */

    const {
        data: allSales,
        isLoading: salesLoading
    } = useQuery({

        queryKey: ['pio-sales'],

        queryFn: () =>
            safeQueryData(() =>
                pioSaleApi.getAll()
            )

    });


    /*
     * =========================
     * CUSTOMER SALES
     * =========================
     */

    const customerSales = useMemo(() => {

        if (
            !selectedCustomerId ||
            !allSales
        ) {
            return [];
        }


        return allSales.filter(

            (sale) =>
                String(
                    sale.customer?.customerId
                ) === String(
                    selectedCustomerId
                )

        );

    }, [
        allSales,
        selectedCustomerId
    ]);


    /*
     * =========================
     * AVAILABLE SEASONS
     * =========================
     */

    const availableSeasons = useMemo(() => {

        const seasons = new Set();


        customerSales.forEach(

            (sale) => {

                const season =
                    getSaleSeason(sale);

                if (season) {
                    seasons.add(season);
                }

            }

        );


        if (currentYear) {
            seasons.add(currentYear);
        }


        return Array
            .from(seasons)
            .sort(
                (a, b) =>
                    Number(b) -
                    Number(a)
            );

    }, [
        customerSales,
        currentYear
    ]);


    /*
     * =========================
     * FILTERED SALES
     * =========================
     */

    const filteredSales = useMemo(() => {

        if (
            selectedSeason === 'all'
        ) {
            return customerSales;
        }


        return customerSales.filter(

            (sale) =>

                String(
                    getSaleSeason(sale)
                ) === String(
                    selectedSeason
                )

        );

    }, [
        customerSales,
        selectedSeason
    ]);


    /*
     * =========================
     * SELECTED CUSTOMER
     * =========================
     */

    const selectedCustomer = useMemo(() => {

        return (
            customers || []
        ).find(

            (customer) =>
                String(
                    customer.customerId
                ) === String(
                    selectedCustomerId
                )

        );

    }, [
        customers,
        selectedCustomerId
    ]);


    /*
     * =========================
     * SEASON WISE SUMMARY
     * =========================
     */

    const seasonWiseSummary = useMemo(() => {

        const summaryMap = {};


        customerSales.forEach(

            (sale) => {

                const season =
                    getSaleSeason(sale) || '-';


                if (!summaryMap[season]) {

                    summaryMap[season] = {

                        season,

                        totalEntries: 0,

                        totalBoxesSold: 0,

                        totalSalesAmount: 0

                    };

                }


                summaryMap[
                    season
                ].totalEntries += 1;


                summaryMap[
                    season
                ].totalBoxesSold +=
                    Number(
                        sale.boxesSold || 0
                    );


                summaryMap[
                    season
                ].totalSalesAmount +=
                    Number(
                        sale.totalAmount || 0
                    );

            }

        );


        return Object
            .values(summaryMap)
            .sort(

                (a, b) =>
                    Number(b.season) -
                    Number(a.season)

            );

    }, [
        customerSales
    ]);


    /*
     * =========================
     * DISPLAY TOTALS
     * =========================
     */

    const displayTotals = useMemo(() => {

        return {

            totalEntries:
                filteredSales.length,


            totalBoxesSold:

                filteredSales.reduce(

                    (total, sale) =>

                        total +
                        Number(
                            sale.boxesSold || 0
                        ),

                    0

                ),


            totalSalesAmount:

                filteredSales.reduce(

                    (total, sale) =>

                        total +
                        Number(
                            sale.totalAmount || 0
                        ),

                    0

                )

        };

    }, [
        filteredSales
    ]);


    /*
     * =========================
     * CUSTOMER CHANGE
     * =========================
     */

    const handleCustomerChange = (
        customerId
    ) => {

        setSelectedCustomerId(
            customerId
        );


        /*
         * If current year exists for the customer,
         * show it by default.
         * Otherwise first available season can still
         * be selected manually.
         */

        setSelectedSeason(
            currentYear
        );

    };


    /*
     * =========================
     * SEND INDIVIDUAL SALE
     * =========================
     */

    const handleSendSale = (
        sale
    ) => {

        if (
            !sale?.pioSaleId
        ) {

            toast.error(
                'Invalid PIO sale'
            );

            return;

        }


        const customerName =

            sale.customer
                ?.customerName ||

            selectedCustomer
                ?.customerName ||

            'this customer';


        const confirmed =
            window.confirm(

                `Send this PIO entry to ${customerName} through SMS and WhatsApp?`

            );


        if (!confirmed) {
            return;
        }


        notificationApi
            .sendPioSaleMessage(

                sale.pioSaleId

            )

            .then(

                (response) => {

                    toast.success(

                        response
                            ?.data
                            ?.message ||

                        `Notification request received for ${customerName}`

                    );

                }

            )

            .catch(

                (error) => {

                    console.error(
                        'PIO notification error:',
                        error
                    );


                    toast.error(

                        error
                            ?.response
                            ?.data
                            ?.message ||

                        'Failed to send PIO entry notification'

                    );

                }

            );

    };


    /*
     * =========================
     * SEND SEASON SUMMARY
     * =========================
     */

    const handleSendSeasonSummary = (
        season
    ) => {

        if (
            !selectedCustomerId
        ) {

            toast.error(
                'Please select a customer first'
            );

            return;

        }


        const customerName =

            selectedCustomer
                ?.customerName ||

            'this customer';


        const confirmed =
            window.confirm(

                `Send PIO season ${season} summary to ${customerName} through SMS and WhatsApp?`

            );


        if (!confirmed) {
            return;
        }


        if (
            !notificationApi?.sendPioCustomerSummary
        ) {

            toast.error(
                'PIO summary notification API is not configured'
            );

            return;

        }


        notificationApi
            .sendPioCustomerSummary(

                selectedCustomerId,
                season

            )

            .then(

                (response) => {

                    toast.success(

                        response
                            ?.data
                            ?.message ||

                        `PIO season ${season} summary notification request received for ${customerName}`

                    );

                }

            )

            .catch(

                (error) => {

                    console.error(
                        'PIO summary notification error:',
                        error
                    );


                    toast.error(

                        error
                            ?.response
                            ?.data
                            ?.message ||

                        'Failed to send PIO season summary'

                    );

                }

            );

    };


    /*
     * =========================
     * SEND SELECTED SUMMARY
     * =========================
     */

    const handleSendSummary = () => {

        if (
            !selectedCustomerId
        ) {

            toast.error(
                'Please select a customer first'
            );

            return;

        }


        if (
            filteredSales.length === 0
        ) {

            toast.error(
                'No PIO sales available for this season'
            );

            return;

        }


        const customerName =

            selectedCustomer
                ?.customerName ||

            'this customer';


        const seasonText =

            selectedSeason === 'all'

                ? 'all seasons'

                : `season ${selectedSeason}`;


        const confirmed =
            window.confirm(

                `Send PIO summary for ${seasonText} to ${customerName} through SMS and WhatsApp?`

            );


        if (!confirmed) {
            return;
        }


        if (
            !notificationApi?.sendPioCustomerSummary
        ) {

            toast.error(
                'PIO summary notification API is not configured'
            );

            return;

        }


        notificationApi
            .sendPioCustomerSummary(

                selectedCustomerId,
                selectedSeason

            )

            .then(

                (response) => {

                    toast.success(

                        response
                            ?.data
                            ?.message ||

                        `PIO summary notification request received for ${customerName}`

                    );

                }

            )

            .catch(

                (error) => {

                    console.error(
                        'PIO summary notification error:',
                        error
                    );


                    toast.error(

                        error
                            ?.response
                            ?.data
                            ?.message ||

                        'Failed to send PIO summary'

                    );

                }

            );

    };


    /*
     * =========================
     * LOADING
     * =========================
     */

    if (
        customersLoading ||
        salesLoading
    ) {

        return (
            <Loading />
        );

    }


    return (

        <div>


            {/* PAGE HEADER */}

            <div className="mb-6">

                <h1 className="text-2xl font-bold text-primary-400">

                    PIO Customer Summary

                </h1>


                <p className="text-sm text-theme-muted mt-1">

                    View customer-wise PIO sales and season history.

                </p>

            </div>


            {/* FILTERS */}

            <div className="card mb-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                    {/* CUSTOMER */}

                    <div>

                        <label className="block text-sm font-medium text-primary-400/90 mb-1">

                            Customer

                        </label>


                        <select

                            value={selectedCustomerId}

                            onChange={
                                (e) =>
                                    handleCustomerChange(
                                        e.target.value
                                    )
                            }

                            className="input-field"

                        >

                            <option value="">

                                Select Customer

                            </option>


                            {
                                (customers || []).map(

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

                                )
                            }

                        </select>

                    </div>


                    {/* SEASON */}

                    <div>

                        <label className="block text-sm font-medium text-primary-400/90 mb-1">

                            Season / Year

                        </label>


                        <select

                            value={selectedSeason}

                            onChange={
                                (e) =>
                                    setSelectedSeason(
                                        e.target.value
                                    )
                            }

                            className="input-field"

                            disabled={
                                !selectedCustomerId
                            }

                        >

                            <option value="all">

                                All Seasons

                            </option>


                            {
                                availableSeasons.map(

                                    (season) => (

                                        <option

                                            key={season}

                                            value={season}

                                        >

                                            {season}

                                        </option>

                                    )

                                )
                            }

                        </select>

                    </div>


                </div>

            </div>


            {/* NO CUSTOMER */}

            {
                !selectedCustomerId && (

                    <div className="card text-center py-10">

                        <p className="text-theme-muted">

                            Select a customer to view their
                            PIO transaction summary.

                        </p>

                    </div>

                )
            }


            {/* CUSTOMER DATA */}

            {
                selectedCustomerId && (

                    <>


                        {/* CUSTOMER INFORMATION */}

                        <div className="card mb-6">

                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">


                                <div>

                                    <h2 className="text-xl font-semibold text-primary-400">

                                        {
                                            selectedCustomer
                                                ?.customerName ||
                                            'Customer'
                                        }

                                    </h2>


                                    <p className="text-theme-muted mt-2">

                                        Viewing:{' '}

                                        {
                                            selectedSeason === 'all'
                                                ? 'All Seasons'
                                                : `Season ${selectedSeason}`
                                        }

                                    </p>

                                </div>


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

                        <div className="card mb-8">

                            <h2 className="text-xl font-bold text-primary-400 mb-4">

                                Season Wise Summary

                            </h2>


                            <Table

                                columns={[

                                    {
                                        key: 'season',
                                        label: 'Season'
                                    },

                                    {
                                        key: 'totalEntries',
                                        label: 'Entries'
                                    },

                                    {
                                        key: 'totalBoxesSold',
                                        label: 'Boxes Sold'
                                    },

                                    {
                                        key: 'totalSalesAmount',
                                        label: 'Total Amount',

                                        render: (value) =>
                                            `₹ ${Number(
                                                value || 0
                                            ).toFixed(2)}`
                                    }

                                ]}

                                data={
                                    seasonWiseSummary
                                }

                                actions={
                                    (row) => (

                                        <button

                                            onClick={() =>
                                                handleSendSeasonSummary(
                                                    row.season
                                                )
                                            }

                                            className="text-primary-400 hover:text-primary-300"

                                            title="Send season summary"

                                        >

                                            <Send size={18} />

                                        </button>

                                    )
                                }

                            />

                        </div>


                        {/* CUSTOMER TRANSACTIONS */}

                        <div className="card overflow-x-auto">

                            <h2 className="text-xl font-bold text-primary-400 mb-4">

                                Customer Transactions

                            </h2>


                            <table className="w-full min-w-[700px]">


                                <thead>

                                    <tr className="border-b border-theme-border text-left">

                                        <th className="p-3">

                                            Date

                                        </th>


                                        <th className="p-3">

                                            Boxes Sold

                                        </th>


                                        <th className="p-3">

                                            Rate

                                        </th>


                                        <th className="p-3">

                                            Total Amount

                                        </th>


                                        <th className="p-3">

                                            Notes

                                        </th>


                                        <th className="p-3 text-center">

                                            Actions

                                        </th>

                                    </tr>

                                </thead>


                                <tbody>


                                    {
                                        filteredSales.length === 0 && (

                                            <tr>

                                                <td

                                                    colSpan="6"

                                                    className="p-6 text-center text-theme-muted"

                                                >

                                                    No PIO transactions found
                                                    for this season.

                                                </td>

                                            </tr>

                                        )
                                    }


                                    {
                                        filteredSales.map(

                                            (sale) => (

                                                <tr

                                                    key={
                                                        sale.pioSaleId
                                                    }

                                                    className="border-b border-theme-border"

                                                >

                                                    <td className="p-3">

                                                        {
                                                            getSaleDate(sale) ||
                                                            '-'
                                                        }

                                                    </td>


                                                    <td className="p-3">

                                                        {
                                                            sale.boxesSold ??
                                                            0
                                                        }

                                                    </td>


                                                    <td className="p-3">

                                                        ₹ {
                                                            Number(
                                                                sale.rate || 0
                                                            ).toFixed(2)
                                                        }

                                                    </td>


                                                    <td className="p-3">

                                                        ₹ {
                                                            Number(
                                                                sale.totalAmount || 0
                                                            ).toFixed(2)
                                                        }

                                                    </td>


                                                    <td className="p-3">

                                                        {
                                                            sale.notes ||
                                                            '-'
                                                        }

                                                    </td>


                                                    <td className="p-3 text-center">

                                                        <button

                                                            onClick={() =>
                                                                handleSendSale(
                                                                    sale
                                                                )
                                                            }

                                                            className="text-primary-400 hover:text-primary-300"

                                                            title="Send PIO entry"

                                                        >

                                                            <Send size={18} />

                                                        </button>

                                                    </td>

                                                </tr>

                                            )

                                        )
                                    }


                                    {/* TOTAL ROW */}

                                    {
                                        filteredSales.length > 0 && (

                                            <tr className="font-bold border-t-2 border-primary-400">

                                                <td className="p-3">

                                                    TOTAL

                                                    <div className="text-xs text-theme-muted font-normal">

                                                        {
                                                            displayTotals
                                                                .totalEntries
                                                        }{' '}

                                                        Entries

                                                    </div>

                                                </td>


                                                <td className="p-3">

                                                    {
                                                        displayTotals
                                                            .totalBoxesSold
                                                    }

                                                </td>


                                                <td className="p-3">

                                                    -

                                                </td>


                                                <td className="p-3">

                                                    ₹ {

                                                        displayTotals
                                                            .totalSalesAmount
                                                            .toFixed(2)

                                                    }

                                                </td>


                                                <td className="p-3">

                                                    -

                                                </td>


                                                <td className="p-3">

                                                    -

                                                </td>

                                            </tr>

                                        )
                                    }


                                </tbody>

                            </table>

                        </div>


                    </>

                )
            }


        </div>

    );

};


export default PioCustomerSummary;