import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errMsg } from '../services/api';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Loader, ErrorBox, StatusBadge, ConfirmDialog, ProductImage } from '../components/ui';
import { ORDER_STATUSES, inr, fmtDate } from '../constants';

const STEPS = ['Pending', 'Confirmed', 'Preparing', 'Delivered'];

export default function OrderDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload, setData } = useFetch(`/orders/${id}`);
  const [confirm, setConfirm] = useState(false);

  if (loading) return <Loader />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  const o = data.order;
  const closed = ['Delivered', 'Cancelled'].includes(o.status);
  const back = user.role === 'seller' ? '/seller/orders' : user.role === 'admin' ? '/admin' : '/orders';
  const idx = STEPS.indexOf(o.status);

  const setStatus = async (status) => {
    try {
      const r = await api.put(`/orders/${id}/status`, { status });
      setData({ order: { ...o, status: r.data.order.status } });
      toast.success(`Order marked ${status.toLowerCase()}`);
    } catch (err) { toast.error(errMsg(err)); }
    setConfirm(false);
  };

  return (
    <div>
      <Link to={back} className="back">← Back to orders</Link>
      <div className="section-head">
        <h1>Order #{o._id.slice(-6).toUpperCase()}</h1>
        <StatusBadge status={o.status} />
      </div>
      <p className="muted">Placed on {fmtDate(o.createdAt)}</p>

      {o.status !== 'Cancelled' ? (
        <ol className="track">
          {STEPS.map((s, i) => <li key={s} className={i <= idx ? 'done' : ''}>{s}</li>)}
        </ol>
      ) : <div className="alert alert-error">This order was cancelled.</div>}

      <div className="layout-cart">
        <div className="card cart-list">
          {o.items.map((i) => (
            <div className="cart-row" key={i.product}>
              <ProductImage src={i.image} category="" alt={i.name} className="cart-img" />
              <div className="cart-info"><strong>{i.name}</strong><span className="muted small">{inr(i.price)} × {i.quantity}</span></div>
              <strong className="cart-line">{inr(i.price * i.quantity)}</strong>
            </div>
          ))}
        </div>
        <aside className="card summary">
          <h3>Details</h3>
          {user.role !== 'customer' && o.customer && <p className="small">Customer: {o.customer.name}<br />{o.customer.phone}</p>}
          <p className="small">Deliver to:<br />{o.deliveryLocation}</p>
          <div className="sum-row total"><span>{o.sellerTotal !== undefined ? 'Your items total' : 'Total'}</span><span>{inr(o.sellerTotal ?? o.totalAmount)}</span></div>

          {user.role === 'customer' && o.status === 'Pending' && (
            <button className="btn btn-danger btn-block" onClick={() => setConfirm(true)}>Cancel order</button>
          )}
          {user.role !== 'customer' && !closed && (
            <label>Update status
              <select value={o.status} onChange={(e) => setStatus(e.target.value)}>
                {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
          )}
        </aside>
      </div>
      <ConfirmDialog open={confirm} danger title="Cancel this order?" message="Items will be returned to the seller's stock. This cannot be undone." confirmText="Cancel order" onConfirm={() => setStatus('Cancelled')} onCancel={() => setConfirm(false)} />
    </div>
  );
}
