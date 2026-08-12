import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import Table from '../components/common/Table';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const Users = () => {
  const { isAdmin, isManufacturer } = useAuth();
  const queryClient = useQueryClient();

  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ['approvalRequests'],
    queryFn: async () => {
      const res = await authApi.getPendingApprovals();
      return res?.data ?? [];
    },
    enabled: isAdmin || isManufacturer,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
  });

  const approveMutation = useMutation({
    mutationFn: (id) => authApi.approveRequest(id, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvalRequests'] });
      toast.success('Request approved');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to approve')
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => authApi.rejectRequest(id, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvalRequests'] });
      toast.success('Request rejected');
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to reject')
  });

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'requestedRole', label: 'Requested Role' },
    { key: 'email', label: 'Email' },
    {
      key: 'name',
      label: 'Name',
      render: (_, row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || '-'
    },
    {
      key: 'shopName',
      label: 'Shop',
      render: (val, row) => row.requestedRole === 'Retailer' ? (val || '-') : '-'
    },
    {
      key: 'requestedAt',
      label: 'Requested',
      render: (val) => val ? new Date(val).toLocaleString() : '-'
    },
    {
      key: 'expiresAt',
      label: 'Expires',
      render: (val) => val ? new Date(val).toLocaleString() : '-'
    },
  ];

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary-400">Requests</h1>
          <p className="text-theme-muted text-sm mt-1">Approve or reject pending registrations (expires in 24 hours)</p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="btn-secondary flex items-center gap-2"
          title="Refresh"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      <div className="card">
        <Table
          columns={columns}
          data={requests || []}
          actions={(row) => (
            <div className="flex gap-2">
              <button
                type="button"
                className="text-green-400 hover:text-green-300"
                title="Approve"
                onClick={() => {
                  if (confirm(`Approve ${row.email} as ${row.requestedRole}?`)) {
                    approveMutation.mutate(row.id);
                  }
                }}
                disabled={approveMutation.isPending || rejectMutation.isPending}
              >
                <CheckCircle size={18} />
              </button>
              <button
                type="button"
                className="text-red-400 hover:text-red-300"
                title="Reject"
                onClick={() => {
                  if (confirm(`Reject ${row.email}?`)) {
                    rejectMutation.mutate(row.id);
                  }
                }}
                disabled={approveMutation.isPending || rejectMutation.isPending}
              >
                <XCircle size={18} />
              </button>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default Users;
