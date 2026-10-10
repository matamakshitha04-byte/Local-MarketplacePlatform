import { Link } from 'react-router-dom';
import api, { errMsg } from '../services/api';
import useFetch from '../hooks/useFetch';
import { useToast } from '../context/ToastContext';
import { Loader, ErrorBox, EmptyState, StatusBadge } from '../components/ui';
import { ORDER_STATUSES, inr, fmtDate } from '../constants';

export default function SellerOrders() {
  const { data, loading, error, reload, setData } = useFetch('/seller/orders');
  const toast = useToast();

  const update = async (o, status) => {
    try {
      await api.put(`/orders/${o._id}/status`, { status });
      setData({ orders: data.orders.map((x) => (x._id === o._id ? { ...x, status } : x)) });
      toast.success(`Order marked ${status.toLowerCase()}`);
    } catch (e) { toast.error(errMsg(e)); }
  };

  if (loading) return <Loader />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  return (
    <div>
      <h1>Orders</h1>
      {data.orders.length === 0 ? <EmptyState title="No orders yet" text="When customers buy your products, their orders show up here." /> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Your items</th><th>Total</th><th>Status</th><th>Update</th></tr></thead>
          <tbody>{data.orders.map((o) => {
            const closed = ['Delivered', 'Cancelled'].includes(o.status);
            return (
              <tr key={o._id}>
                <td><Link to={`/orders/${o._id}`}>#{o._id.slice(-6).toUpperCase()}</Link></td>
                <td>{fmtDate(o.createdAt)}</td>
                <td>{o.customer?.name}<div className="muted small">{o.deliveryLocation}</div></td>
                <td>{o.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}</td>
                <td>{inr(o.sellerTotal)}</td>
                <td><StatusBadge status={o.status} /></td>
                <td>{closed ? <span className="muted small">Closed</span> : (
                  <select value={o.status} onChange={(e) => update(o, e.target.value)} aria-label="Order status">
                    {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                )}</td>
              </tr>
            );
          })}</tbody>
        </table></div>
      )}
    </div>
  );
}
