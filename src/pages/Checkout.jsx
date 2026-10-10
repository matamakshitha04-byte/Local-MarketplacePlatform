import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { inr } from '../constants';

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, clear } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [location, setLocation] = useState(user.location);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (items.length === 0 && !busy) return <Navigate to="/cart" replace />;

  const place = async (e) => {
    e.preventDefault();
    if (!location.trim()) return setError('Delivery location is required');
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/orders', {
        deliveryLocation: location,
        items: items.map((i) => ({ productId: i.product._id, quantity: i.quantity })),
      });
      clear();
      toast.success('Order placed successfully');
      navigate(`/orders/${data.order._id}`, { replace: true });
    } catch (err) {
      setError(errMsg(err));
      setBusy(false);
    }
  };

  return (
    <div>
      <h1>Checkout</h1>
      <div className="layout-cart">
        <form className="card pad" onSubmit={place} noValidate>
          <h3>Delivery details</h3>
          <p className="muted small">{user.name} · {user.phone}</p>
          {error && <div className="alert alert-error" role="alert">{error} <Link to="/cart">Review cart</Link></div>}
          <label>Delivery location<textarea rows="3" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="House no., street, area" /></label>
          <p className="muted small">Payment is collected on delivery.</p>
          <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Placing order…' : `Place order · ${inr(total)}`}</button>
        </form>
        <aside className="card summary">
          <h3>Your items</h3>
          {items.map(({ product: p, quantity }) => (
            <div className="sum-row" key={p._id}><span>{p.name} × {quantity}</span><span>{inr(p.price * quantity)}</span></div>
          ))}
          <div className="sum-row total"><span>Total</span><span>{inr(total)}</span></div>
        </aside>
      </div>
    </div>
  );
}
