import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, totalAmount, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="card text-center py-12">
        <ShoppingBag className="mx-auto text-theme-muted mb-4" size={48} />
        <h2 className="text-xl font-semibold text-primary-400 mb-2">Your cart is empty</h2>
        <p className="text-theme-muted mb-6">Add products from the Products page.</p>
        <Link to="/app/products" className="btn-primary inline-flex items-center gap-2">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-400 mb-6">Cart</h1>
      <div className="card space-y-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center justify-between py-3 border-b border-theme-border last:border-0"
          >
            <div className="flex items-center gap-3">
              <div>
                <p className="font-medium text-gray-200">{item.productName}</p>
                <p className="text-sm text-theme-muted">₹{item.sellingPrice?.toFixed(2)} each</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 border border-theme-border rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  className="p-2 text-primary-400 hover:bg-theme-border transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="px-3 py-1 text-gray-200 min-w-[2rem] text-center">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  className="p-2 text-primary-400 hover:bg-theme-border transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              <p className="text-primary-400 font-medium w-24 text-right">
                ₹{((item.sellingPrice || 0) * item.quantity).toFixed(2)}
              </p>
              <button
                type="button"
                onClick={() => removeFromCart(item.productId)}
                className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                title="Remove"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        <div className="flex justify-between items-center pt-4">
          <p className="text-theme-muted">
            {totalItems} item{totalItems !== 1 ? 's' : ''}
          </p>
          <p className="text-xl font-bold text-primary-400">Total: ₹{totalAmount.toFixed(2)}</p>
        </div>
        <div className="flex justify-end pt-4">
          <Link to="/app/checkout" className="btn-primary">
            Proceed to checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
