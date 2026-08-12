import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/common/PasswordInput';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authApi.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-400 mb-6">Settings</h1>
      
      <div className="grid gap-6 max-w-2xl">
        <div className="card">
          <h2 className="text-lg font-semibold text-primary-400 mb-4">Profile Information</h2>
          <div className="space-y-3 text-gray-200">
            <p><span className="text-theme-muted">Name:</span> {user?.firstName} {user?.lastName}</p>
            <p><span className="text-theme-muted">Email:</span> {user?.email}</p>
            <p><span className="text-theme-muted">Role:</span> {user?.role}</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-primary-400 mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-400/90 mb-1">Current Password</label>
              <PasswordInput
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                required
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-400/90 mb-1">New Password</label>
              <PasswordInput
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-400/90 mb-1">Confirm New Password</label>
              <PasswordInput
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                required
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Changing...' : 'Change Password'}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;