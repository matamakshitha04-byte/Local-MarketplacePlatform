import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { Loader, ErrorBox, StatCard } from '../components/ui';
import { inr } from '../constants';

export default function AdminDashboard() {
  const { data, loading, error, reload } = useFetch('/admin/stats');
  if (loading) return <Loader />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  return (
    <div>
      <h1>Marketplace overview</h1>
      <div className="stats">
        <StatCard label="Customers" value={data.customers} />
        <StatCard label="Sellers" value={data.sellers} />
        <StatCard label="Products" value={data.products} />
        <StatCard label="Orders" value={data.orders} />
        <StatCard label="Revenue (excl. cancelled)" value={inr(data.revenue)} tone="ok" />
      </div>
      <div className="chips">
        <Link className="chip" to="/admin/users">Manage users</Link>
        <Link className="chip" to="/admin/products">Manage products</Link>
      </div>
    </div>
  );
}
