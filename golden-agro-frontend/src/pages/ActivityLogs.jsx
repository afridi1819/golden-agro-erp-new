import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import {
    RefreshCw,
    Eye,
    Search,
    X
} from 'lucide-react';

import { activityLogApi } from '../api/businessApi';

import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import Loading from '../components/common/Loading';
import StatusBadge from '../components/common/StatusBadge';

const ActivityLogs = () => {

    // Filters
    const [moduleFilter, setModuleFilter] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [search, setSearch] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 10;

    // Details modal
    const [selectedLog, setSelectedLog] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);


    // Fetch all logs
    const {
        data: logs,
        isLoading,
        refetch,
        isFetching
    } = useQuery({
        queryKey: ['activityLogs'],

        queryFn: async () => {
            const res = await activityLogApi.getAll();
            return res?.data?.data ?? [];
        },

        staleTime: 0,
        gcTime: 0,

        refetchOnMount: 'always',
        refetchOnWindowFocus: true,

        retry: false
    });


    // Search + Filter
    const filteredLogs = useMemo(() => {

        if (!logs) return [];

        const searchText = search.trim().toLowerCase();

        return logs.filter((log) => {

            const matchesSearch =

                !searchText ||

                log.description
                    ?.toLowerCase()
                    .includes(searchText) ||

                log.moduleName
                    ?.toLowerCase()
                    .includes(searchText) ||

                log.actionType
                    ?.toLowerCase()
                    .includes(searchText) ||

                log.userName
                    ?.toLowerCase()
                    .includes(searchText) ||

                log.entityId
                    ?.toString()
                    .includes(searchText) ||

                log.id
                    ?.toString()
                    .includes(searchText);


            const matchesModule =

                !moduleFilter ||

                log.moduleName === moduleFilter;


            const matchesAction =

                !actionFilter ||

                log.actionType === actionFilter;


            return (

                matchesSearch &&

                matchesModule &&

                matchesAction

            );

        });

    }, [

        logs,
        search,
        moduleFilter,
        actionFilter

    ]);


    // Pagination calculations
    const totalPages = Math.ceil(
        filteredLogs.length / logsPerPage
    );

    const startIndex =
        (currentPage - 1) * logsPerPage;

    const paginatedLogs =
        filteredLogs.slice(
            startIndex,
            startIndex + logsPerPage
        );


    // Date formatting
    const formatDate = (date) => {

        if (!date) return '-';

        return new Date(date).toLocaleString(

            'en-IN',

            {
                dateStyle: 'medium',
                timeStyle: 'short'
            }

        );

    };


    // Convert activity action to StatusBadge status
    const getActionStatus = (action) => {

        if (!action) return 'default';

        const value = action.toLowerCase();


        if (

            value === 'create' ||
            value === 'complete' ||
            value === 'confirm' ||
            value === 'start'

        ) {

            return 'completed';

        }


        if (

            value === 'delete' ||
            value === 'cancel'

        ) {

            return 'cancelled';

        }


        return 'pending';

    };


    // Format JSON values
    const formatJson = (value) => {

        if (!value) {

            return 'No data available';

        }


        try {

            return JSON.stringify(

                JSON.parse(value),

                null,

                2

            );

        } catch {

            return value;

        }

    };


    if (isLoading) {

        return <Loading />;

    }


    return (

        <div>


            {/* Header */}

            <div className="flex justify-between items-center mb-6 flex-wrap gap-3">

                <div>

                    <h1 className="text-2xl font-bold text-primary-400">

                        Activity Logs

                    </h1>


                    <p className="text-sm text-theme-muted mt-1">

                        Track all important activities performed in the system

                    </p>

                </div>


                <button

                    type="button"

                    onClick={() => refetch()}

                    className="btn-secondary flex items-center gap-2"

                >

                    <RefreshCw

                        size={18}

                        className={

                            isFetching

                                ? 'animate-spin'

                                : ''

                        }

                    />

                    Refresh

                </button>

            </div>



            {/* Filters */}

            <div className="card mb-4">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">


                    {/* Search */}

                    <div className="relative">

                        <Search

                            size={18}

                            className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-muted"

                        />


                        <input

                            type="text"

                            value={search}

                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1);
                            }}

                            placeholder="Search activities..."

                            className="input-field w-full pl-10"

                        />

                    </div>



                    {/* Module Filter */}

                    <select

                        value={moduleFilter}

                        onChange={(e) => {
                            setModuleFilter(
                                e.target.value
                            );
                            setCurrentPage(1);
                        }}

                        className="input-field"

                    >

                        <option value="">
                            All Modules
                        </option>


                        <option value="RAW_MATERIAL">
                            Raw Materials
                        </option>


                        <option value="PRODUCT">
                            Products
                        </option>


                        <option value="BOM">
                            BOM
                        </option>


                        <option value="SUPPLIER">
                            Suppliers
                        </option>


                        <option value="PURCHASE">
                            Purchases
                        </option>


                        <option value="RETAILER">
                            Retailers
                        </option>


                        <option value="ORDER">
                            Orders
                        </option>


                        <option value="PRODUCTION">
                            Production
                        </option>


                        <option value="EXPENSE">
                            Expenses
                        </option>


                        <option value="CATEGORY">
                            Categories
                        </option>

                    </select>



                    {/* Action Filter */}

                    <select

                        value={actionFilter}

                        onChange={(e) => {
                            setActionFilter(
                                e.target.value
                            );
                            setCurrentPage(1);
                        }}

                        className="input-field"

                    >

                        <option value="">
                            All Actions
                        </option>


                        <option value="CREATE">
                            Create
                        </option>


                        <option value="UPDATE">
                            Update
                        </option>


                        <option value="DELETE">
                            Delete
                        </option>


                        <option value="COMPLETE">
                            Complete
                        </option>


                        <option value="CANCEL">
                            Cancel
                        </option>


                        <option value="CONFIRM">
                            Confirm
                        </option>


                        <option value="START">
                            Start
                        </option>


                        <option value="STATUS_CHANGE">
                            Status Change
                        </option>

                    </select>



                    {/* Clear */}

                    <button

                        type="button"

                        onClick={() => {

                            setModuleFilter('');

                            setActionFilter('');

                            setSearch('');

                            setCurrentPage(1);

                        }}

                        className="btn-secondary flex items-center justify-center gap-2"

                    >

                        <X size={18} />

                        Clear

                    </button>

                </div>

            </div>



            {/* Activity Table */}

            <div className="card">

                <Table

                    columns={[

                        {

                            key: 'id',

                            label: 'ID'

                        },


                        {

                            key: 'createdAt',

                            label: 'Date & Time',

                            render: (value) =>
                                formatDate(value)

                        },


                        {

                            key: 'userName',

                            label: 'User',

                            render: (value) =>
                                value || 'System'

                        },


                        {

                            key: 'moduleName',

                            label: 'Module',

                            render: (value) =>
                                value?.replaceAll(
                                    '_',
                                    ' '
                                )

                        },


                        {

                            key: 'actionType',

                            label: 'Action',

                            render: (value) => (

                                <StatusBadge

                                    status={
                                        getActionStatus(value)
                                    }

                                />

                            )

                        },


                        {

                            key: 'description',

                            label: 'Description'

                        }

                    ]}


                    data={paginatedLogs}


                    actions={(row) => (

                        <button

                            onClick={() => {

                                setSelectedLog(row);

                                setDetailsOpen(true);

                            }}

                            className="text-primary-400 hover:text-primary-300"

                            title="View Activity Details"

                        >

                            <Eye size={18} />

                        </button>

                    )}

                />


                {/* Pagination */}

                {totalPages > 1 && (

                    <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-theme-border">


                        {/* Previous */}

                        <button

                            type="button"

                            onClick={() =>
                                setCurrentPage(
                                    Math.max(
                                        1,
                                        currentPage - 1
                                    )
                                )
                            }

                            disabled={currentPage === 1}

                            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"

                        >

                            Previous

                        </button>



                        {/* Page Numbers */}

                        <div className="flex items-center gap-2 flex-wrap">

                            {Array.from(
                                { length: totalPages },
                                (_, index) => index + 1
                            ).map((page) => (

                                <button

                                    key={page}

                                    type="button"

                                    onClick={() =>
                                        setCurrentPage(page)
                                    }

                                    className={
                                        currentPage === page
                                            ? 'btn-primary'
                                            : 'btn-secondary'
                                    }

                                >

                                    {page}

                                </button>

                            ))}

                        </div>



                        {/* Next */}

                        <button

                            type="button"

                            onClick={() =>
                                setCurrentPage(
                                    Math.min(
                                        totalPages,
                                        currentPage + 1
                                    )
                                )
                            }

                            disabled={
                                currentPage === totalPages
                            }

                            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"

                        >

                            Next

                        </button>


                    </div>

                )}

            </div>



            {/* Details Modal */}

            <Modal

                isOpen={detailsOpen}

                onClose={() =>
                    setDetailsOpen(false)
                }

                title={`Activity #${selectedLog?.id}`}

                size="lg"

            >


                {selectedLog && (

                    <div className="space-y-5">


                        {/* Basic Details */}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                            <div>

                                <p className="text-sm text-theme-muted">

                                    Date & Time

                                </p>


                                <p className="font-medium text-gray-200">

                                    {formatDate(
                                        selectedLog.createdAt
                                    )}

                                </p>

                            </div>



                            <div>

                                <p className="text-sm text-theme-muted">

                                    User

                                </p>


                                <p className="font-medium text-gray-200">

                                    {selectedLog.userName ||
                                        'System'}

                                </p>

                            </div>



                            <div>

                                <p className="text-sm text-theme-muted">

                                    Module

                                </p>


                                <p className="font-medium text-gray-200">

                                    {selectedLog.moduleName
                                        ?.replaceAll(
                                            '_',
                                            ' '
                                        )}

                                </p>

                            </div>



                            <div>

                                <p className="text-sm text-theme-muted">

                                    Action

                                </p>


                                <StatusBadge

                                    status={
                                        getActionStatus(
                                            selectedLog.actionType
                                        )
                                    }

                                />

                            </div>


                        </div>



                        {/* Description */}

                        <div>

                            <p className="text-sm text-theme-muted mb-1">

                                Description

                            </p>


                            <div className="bg-theme border border-theme-border rounded-lg p-3 text-gray-200">

                                {selectedLog.description}

                            </div>

                        </div>



                        {/* Old Values */}

                        <div>

                            <p className="text-sm text-theme-muted mb-2">

                                Old Values

                            </p>


                            <pre className="bg-theme border border-theme-border rounded-lg p-4 text-sm text-red-300 overflow-auto max-h-60 whitespace-pre-wrap">

                                {formatJson(
                                    selectedLog.oldValues
                                )}

                            </pre>

                        </div>



                        {/* New Values */}

                        <div>

                            <p className="text-sm text-theme-muted mb-2">

                                New Values

                            </p>


                            <pre className="bg-theme border border-theme-border rounded-lg p-4 text-sm text-green-300 overflow-auto max-h-60 whitespace-pre-wrap">

                                {formatJson(
                                    selectedLog.newValues
                                )}

                            </pre>

                        </div>


                    </div>

                )}


            </Modal>


        </div>

    );

};

export default ActivityLogs;