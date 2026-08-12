import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PasswordInput from '../../components/common/PasswordInput';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'Retailer',
    shopName: '',
    phone: '',
    address: '',
    gstNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Phone validation - only digits, max 10
    if (name === 'phone') {
      const phoneValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData({ ...formData, phone: phoneValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await register(formData);

      // If register returns a user (bootstrap admin), AuthContext will set session.
      if (res?.role) {
        toast.success('Registration successful!');
        navigate('/app/dashboard');
        return;
      }

      toast.success(res?.message || 'Registration request submitted. Wait for approval.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] flex items-center justify-center py-12">
      <div className="card w-full max-w-lg border-primary-500/30">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary-400">Golden Agro Foods</h1>
          <p className="text-theme-muted mt-1">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-400/90 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-400/90 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-1">Password</label>
            <PasswordInput
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field"
            >
              <option value="Retailer">Retailer</option>
              <option value="Manufacturer">Manufacturer</option>
            </select>
          </div>

                    {formData.role === 'Retailer' && (
            <>
              <div>
                <label className="block text-sm font-medium text-primary-400/90 mb-1">Shop Name</label>
                <input
                  type="text"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-400/90 mb-1">Phone (10 digits)</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  pattern="[0-9]{10}"
                  maxLength={10}
                  placeholder="Enter 10 digit phone number"
                  className="input-field"
                />
                {formData.phone && formData.phone.length !== 10 && (
                  <p className="text-red-400 text-xs mt-1">Phone must be exactly 10 digits</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-400/90 mb-1">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input-field"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-400/90 mb-1">GST Number</label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-4 text-theme-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;