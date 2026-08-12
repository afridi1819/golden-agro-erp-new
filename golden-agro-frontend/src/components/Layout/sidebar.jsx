import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Factory,
  Truck,
  FileText,
  Settings,
  Boxes,
  ClipboardList,
  Store,
  Receipt,
  ShoppingBag,
  DollarSign
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

const Sidebar = () => {
  const { user, isAdmin, isManufacturer, isRetailer } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard', show: true },
    { path: '/app/products', icon: Package, label: 'Products', show: true },
    { path: '/app/categories', icon: Boxes, label: 'Categories', show: isManufacturer },
    { path: '/app/units', icon: Package, label: 'Units', show: isManufacturer },
    { path: '/app/taxes', icon: FileText, label: 'Taxes', show: isManufacturer },
    { path: '/app/orders', icon: ShoppingCart, label: 'Orders', show: true },
    { path: '/app/cart', icon: ShoppingBag, label: `Cart${totalItems > 0 ? ` (${totalItems})` : ''}`, show: isRetailer },
    { path: '/app/retailers', icon: Store, label: 'Retailers', show: isManufacturer },
    { path: '/app/suppliers', icon: Truck, label: 'Suppliers', show: isManufacturer },
    { path: '/app/raw-materials', icon: ClipboardList, label: 'Raw Materials', show: isManufacturer },
    { path: '/app/bom', icon: Boxes, label: 'BOM', show: isManufacturer },
    { path: '/app/purchases', icon: Receipt, label: 'Purchases', show: isManufacturer },
    { path: '/app/production', icon: Factory, label: 'Production', show: isManufacturer },
    { path: '/app/expenses', icon: DollarSign, label: 'Expenses', show: isManufacturer || isAdmin },
    { path: '/app/invoices', icon: FileText, label: 'Invoices', show: true },
    { path: '/app/users', icon: Users, label: 'Requests', show: isAdmin || isManufacturer },
    { path: '/app/manufacturers', icon: Users, label: 'Manufacturers', show: isAdmin },
    { path: '/app/settings', icon: Settings, label: 'Settings', show: true },
  ];

  return (
    <div className="w-64 bg-theme-dark min-h-full text-white flex flex-col border-r border-theme-border">
      {/* Logo */}
      <div className="p-4 border-b border-theme-border">
        <h1 className="text-xl font-bold text-primary-400">Golden Agro Foods</h1>
        <p className="text-theme-muted text-sm">{user?.role}</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.filter(item => item.show).map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-500 text-black font-medium'
                    : 'text-theme-muted hover:bg-theme-border hover:text-primary-400'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User */}
      <div className="p-4 border-t border-theme-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 text-black rounded-full flex items-center justify-center font-semibold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <p className="font-medium text-gray-200">{user?.firstName} {user?.lastName}</p>
            <p className="text-sm text-theme-muted">{user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;