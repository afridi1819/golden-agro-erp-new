import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi, invoiceApi } from '../api/businessApi';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { items, totalAmount, clearCart } = useCart();
  const { user, isRetailer } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setLoading(true);
    try {
      // Create order
      const orderPayload = {
        retailerId: isRetailer ? (user?.retailerId ?? 0) : 0,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.sellingPrice,
        })),
      };
      
      const orderRes = await orderApi.create(orderPayload);
      const orderId = orderRes?.data?.data?.retailerOrderId;
      
      if (orderId) {
        try {
          await invoiceApi.createFromOrder(orderId);
        } catch (invErr) {
          console.warn('Invoice creation failed:', invErr);
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      clearCart();
      
      // Show success message and redirect
      toast.success('Order placed successfully! 🎉');
      setTimeout(() => {
        navigate('/app/orders');
      }, 2000);
      
    } catch (error) {
      console.error('Order creation failed:', error);
      toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !loading) {
    return (
      <div className="card text-center py-12">
        <h2 className="text-xl font-semibold text-primary-400 mb-2">Nothing to checkout</h2>
        <Link to="/app/cart" className="btn-secondary mr-2">View cart</Link>
        <Link to="/app/orders" className="btn-primary">Browse orders</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-400 mb-6">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-lg font-semibold text-primary-400 mb-4">Order summary</h2>
          <ul className="space-y-2 text-gray-200 mb-4">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between">
                <span>{i.productName} × {i.quantity}</span>
                <span>₹{((i.sellingPrice || 0) * i.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <p className="text-xl font-bold text-primary-400 border-t border-theme-border pt-4">
            Total: ₹{totalAmount.toFixed(2)}
          </p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-primary-400 mb-4">Place Order</h2>
          <form onSubmit={handlePay} className="space-y-4">
            <div className="p-4 bg-theme-border rounded-lg">
              <p className="text-sm text-theme-muted mb-2">Order Total</p>
              <p className="text-2xl font-bold text-primary-400">₹{totalAmount.toFixed(2)}</p>
            </div>
            <p className="text-sm text-theme-muted text-center">
              Click below to place your order. This is a demo system - no actual payment will be processed.
            </p>
            <div className="flex gap-3 pt-4">
              <Link to="/app/cart" className="btn-secondary flex-1 text-center">Back to cart</Link>
              <button type="submit" className="btn-primary flex-1" disabled={loading}>
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
