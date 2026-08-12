import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

//pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProductsShowcase from './pages/ProductsShowcase';
import OurFactory from './pages/OurFactory';
import ContactPage from './pages/ContactPage';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Units from './pages/Units';
import Taxes from './pages/Taxes';
import Orders from './pages/Orders';
import Retailers from './pages/Retailers';
import Suppliers from './pages/Suppliers';
import RawMaterials from './pages/RawMaterials';
import BOM from './pages/BOM';
import Purchases from './pages/Purchases';
import Production from './pages/Production';
import Expenses from './pages/Expenses';
import Invoices from './pages/Invoices';
import Settings from './pages/Settings';
import Users from './pages/Users';
import Manufacturers from './pages/Manufacturers';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';


// Layout
import MainLayout from './components/Layout/MainLayout';
import Navbar from './components/Navbar';
import Loading from './components/common/Loading';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;
  if (user) return <Navigate to="/app/dashboard" replace />;

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/products-showcase" element={<ProductsShowcase />} />
      <Route path="/our-factory" element={<OurFactory />} />
      <Route path="/contact-us" element={<ContactPage />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected Routes */}
      <Route path="/app" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<ProtectedRoute allowedRoles={['Admin', 'Manufacturer']}><Categories /></ProtectedRoute>} />
        <Route path="units" element={<ProtectedRoute allowedRoles={['Admin', 'Manufacturer']}><Units /></ProtectedRoute>} />
        <Route path="taxes" element={<ProtectedRoute allowedRoles={['Admin', 'Manufacturer']}><Taxes /></ProtectedRoute>} />
        <Route path="orders" element={<Orders />} />
        <Route path="retailers" element={<ProtectedRoute allowedRoles={['Admin', 'Manufacturer']}><Retailers /></ProtectedRoute>} />
        <Route path="suppliers" element={<ProtectedRoute allowedRoles={['Admin', 'Manufacturer']}><Suppliers /></ProtectedRoute>} />
        <Route path="raw-materials" element={<ProtectedRoute allowedRoles={['Admin', 'Manufacturer']}><RawMaterials /></ProtectedRoute>} />
        <Route path="bom" element={<ProtectedRoute allowedRoles={['Admin', 'Manufacturer']}><BOM /></ProtectedRoute>} />
        <Route path="purchases" element={<ProtectedRoute allowedRoles={['Admin', 'Manufacturer']}><Purchases /></ProtectedRoute>} />
        <Route path="production" element={<ProtectedRoute allowedRoles={['Admin', 'Manufacturer']}><Production /></ProtectedRoute>} />
        <Route path="expenses" element={<ProtectedRoute allowedRoles={['Admin', 'Manufacturer']}><Expenses /></ProtectedRoute>} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="settings" element={<Settings />} />
        <Route path="users" element={<ProtectedRoute allowedRoles={['Admin', 'Manufacturer']}><Users /></ProtectedRoute>} />
        <Route path="manufacturers" element={<ProtectedRoute allowedRoles={['Admin']}><Manufacturers /></ProtectedRoute>} />
      </Route>

      {/* Legacy routes redirect to /app */}
      <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
        <BrowserRouter>
          <div className="theme-app min-h-screen">
            <Navbar />
            <AppRoutes />
          </div>
          <Toaster position="top-right" />
        </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App
