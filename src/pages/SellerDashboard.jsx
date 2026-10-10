import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import { Loader, ErrorBox, EmptyState, StatCard, StatusBadge } from '../components/ui';
import { inr, fmtDate } from '../constants';

export default function SellerDashboard() {
  const { user } = useAuth();
  const stats = useFetch('/seller/stats');
  const orders = useFetch('/seller/orders');

  return (
    <div>
      <div className="section-head">
        <div><h1>{user.shopName}</h1><p className="muted">{user.shopAddress}</p></div>
        <Link to="/seller/products/new" className="btn btn-primary">Add product</Link>
      </div>

      {stats.loading ? <Loader /> : stats.error ? <ErrorBox message={stats.error} onRetry={stats.reload} /> : (
        <div className="stats">
          <StatCard label="Total products" value={stats.data.totalProducts} />
          <StatCard label="Available products" value={stats.data.availableProducts} tone="ok" />
          <StatCard label="Out of stock" value={stats.data.outOfStock} tone="warn" />
          <StatCard label="Total orders" value={stats.data.totalOrders} />
        </div>
      )}

      <div className="chips">
        <Link className="chip" to="/seller/products">Manage products</Link>
        <Link className="chip" to="/seller/orders">Orders</Link>
        <Link className="chip" to="/seller/profile">Profile</Link>
      </div>

      <section className="section">
        <h2>Latest orders</h2>
        {orders.loading ? <Loader /> : orders.error ? <ErrorBox message={orders.error} onRetry={orders.reload} /> :
          orders.data.orders.length === 0 ? <EmptyState title="No orders yet" text="Orders containing your products will appear here." /> : (
            <div className="table-wrap"><table>
              <thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Your total</th><th>Status</th></tr></thead>
              <tbody>{orders.data.orders.slice(0, 5).map((o) => (
                <tr key={o._id}><td><Link to={`/orders/${o._id}`}>#{o._id.slice(-6).toUpperCase()}</Link></td><td>{fmtDate(o.createdAt)}</td><td>{o.customer?.name}</td><td>{inr(o.sellerTotal)}</td><td><StatusBadge status={o.status} /></td></tr>
              ))}</tbody>
            </table></div>
          )}
      </section>
    </div>
  );
}
