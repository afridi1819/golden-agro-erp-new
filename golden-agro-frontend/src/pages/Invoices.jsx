import { useQuery } from '@tanstack/react-query';
import { invoiceApi } from '../api/businessApi';
import { safeQueryData } from '../api/queryHelpers';
import { useAuth } from '../context/AuthContext';
import Table from '../components/common/Table';
import Loading from '../components/common/Loading';
import StatusBadge from '../components/common/StatusBadge';

const Invoices = () => {
  const { isRetailer, user } = useAuth();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => isRetailer 
      ? safeQueryData(() => invoiceApi.getByRetailer(user?.retailerId ?? 0))
      : safeQueryData(() => invoiceApi.getAll())
  });

  const columns = [
    { key: 'invoiceId', label: 'ID' },
    { key: 'invoiceNumber', label: 'Invoice #' },
    { key: 'retailer', label: 'Retailer', render: (val) => val?.shopName || '-' },
    { 
      key: 'invoiceDate', 
      label: 'Date',
      render: (val) => new Date(val).toLocaleDateString()
    },
    { 
      key: 'totalAmount', 
      label: 'Total',
      render: (val) => `₹${val?.toFixed(2)}`
    },
    { 
      key: 'taxAmount', 
      label: 'Tax',
      render: (val) => `₹${val?.toFixed(2)}`
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => <StatusBadge status={val} />
    }
  ];

  if (isLoading) return <Loading />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-400 mb-6">Invoices</h1>
      <div className="card">
        <Table columns={columns} data={invoices || []} />
      </div>
    </div>
  );
};

export default Invoices;