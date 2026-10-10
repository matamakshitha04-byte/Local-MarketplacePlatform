import { useState } from 'react';
import api, { errMsg } from '../services/api';
import useFetch from '../hooks/useFetch';
import { useToast } from '../context/ToastContext';
import { Loader, ErrorBox, EmptyState, ConfirmDialog } from '../components/ui';
import { inr } from '../constants';

export default function AdminProducts() {
  const { data, loading, error, reload, setData } = useFetch('/admin/products');
  const toast = useToast();
  const [target, setTarget] = useState(null);

  const del = async () => {
    try {
      await api.delete(`/admin/products/${target._id}`);
      setData({ products: data.products.filter((x) => x._id !== target._id) });
      toast.success('Product removed');
    } catch (e) { toast.error(errMsg(e)); }
    setTarget(null);
  };

  if (loading) return <Loader />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  return (
    <div>
      <h1>All products</h1>
      {data.products.length === 0 ? <EmptyState title="No products" /> : (
        <div className="table-wrap"><table>
          <thead><tr><th>Product</th><th>Seller</th><th>Category</th><th>Price</th><th>Stock</th><th /></tr></thead>
          <tbody>{data.products.map((p) => (
            <tr key={p._id}><td>{p.name}</td><td>{p.seller?.shopName || p.seller?.name}</td><td>{p.category}</td><td>{inr(p.price)}</td><td>{p.quantity}</td>
              <td className="actions"><button className="btn btn-danger-ghost btn-sm" onClick={() => setTarget(p)}>Remove</button></td></tr>
          ))}</tbody>
        </table></div>
      )}
      <ConfirmDialog open={Boolean(target)} danger title="Remove this product?" message={target ? `"${target.name}" will be removed from the marketplace.` : ''} confirmText="Remove" onConfirm={del} onCancel={() => setTarget(null)} />
    </div>
  );
}
