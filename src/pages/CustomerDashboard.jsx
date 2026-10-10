import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { Loader, ErrorBox, EmptyState, StatusBadge } from '../components/ui';
import { CATEGORIES, inr, fmtDate } from '../constants';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { count, total } = useCart();
  const prods = useFetch('/products', { limit: 4 });
  const orders = useFetch('/orders');

  return (
    <div>
      <h1>Welcome, {user.name.split(' ')[0]}</h1>
      <p className="muted">Here is what is happening around {user.location}.</p>

      <div className="stats">
        <div className="stat"><span className="stat-value">{count}</span><span className="stat-label">Items in cart ({inr(total)})</span></div>
        <div className="stat"><span className="stat-value">{orders.data?.orders.length ?? '–'}</span><span className="stat-label">Total orders</span></div>
        <Link to="/cart" className="btn btn-primary stat-btn">{count ? 'Go to cart' : 'View cart'}</Link>
      </div>

      <section className="section">
        <h2>Shop by category</h2>
        <div className="chips">
          {CATEGORIES.map((c) => <Link key={c.name} className="chip" to={`/products?category=${encodeURIComponent(c.name)}`}>{c.emoji} {c.name}</Link>)}
        </div>
      </section>

      <section className="section">
        <div className="section-head"><h2>Newly available</h2><Link to="/products">Browse all</Link></div>
        {prods.loading ? <Loader /> : prods.error ? <ErrorBox message={prods.error} onRetry={prods.reload} /> :
          <div className="grid">{prods.data.products.map((p) => <ProductCard key={p._id} product={p} />)}</div>}
      </section>

      <section className="section">
        <div className="section-head"><h2>Recent orders</h2><Link to="/orders">All orders</Link></div>
        {orders.loading ? <Loader /> : orders.error ? <ErrorBox message={orders.error} onRetry={orders.reload} /> :
          orders.data.orders.length === 0 ? <EmptyState title="No orders yet" text="Your orders will show up here." action={<Link className="btn btn-primary" to="/products">Start shopping</Link>} /> : (
            <div className="table-wrap"><table>
              <thead><tr><th>Order</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>{orders.data.orders.slice(0, 5).map((o) => (
                <tr key={o._id}><td><Link to={`/orders/${o._id}`}>#{o._id.slice(-6).toUpperCase()}</Link></td><td>{fmtDate(o.createdAt)}</td><td>{o.items.length}</td><td>{inr(o.totalAmount)}</td><td><StatusBadge status={o.status} /></td></tr>
              ))}</tbody>
            </table></div>
          )}
      </section>
    </div>
  );
}
