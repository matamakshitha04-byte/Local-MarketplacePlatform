import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { Loader, ErrorBox, EmptyState, StatusBadge } from '../components/ui';
import { inr, fmtDate } from '../constants';

export default function MyOrders() {
  const { data, loading, error, reload } = useFetch('/orders');
  if (loading) return <Loader />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  return (
    <div>
      <h1>My orders</h1>
      {data.orders.length === 0 ? <EmptyState title="No orders yet" text="Once you place an order you can track it here." action={<Link className="btn btn-primary" to="/products">Browse products</Link>} /> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Order</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th /></tr></thead>
          <tbody>{data.orders.map((o) => (
            <tr key={o._id}>
              <td>#{o._id.slice(-6).toUpperCase()}</td><td>{fmtDate(o.createdAt)}</td>
              <td>{o.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}</td>
              <td>{inr(o.totalAmount)}</td><td><StatusBadge status={o.status} /></td>
              <td><Link to={`/orders/${o._id}`}>View</Link></td>
            </tr>
          ))}</tbody>
        </table></div>
      )}
    </div>
  );
}
