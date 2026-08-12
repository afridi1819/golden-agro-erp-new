import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PasswordInput from '../../components/common/PasswordInput';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/app/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] flex items-center justify-center py-12">
      <div className="card w-full max-w-md border-primary-500/30">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary-400">Golden Agro Foods</h1>
          <p className="text-theme-muted mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary-400/90 mb-1">Password</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-4 text-theme-muted">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;