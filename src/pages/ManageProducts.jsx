import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../services/api';
import useFetch from '../hooks/useFetch';
import { useToast } from '../context/ToastContext';
import { Loader, ErrorBox, EmptyState, ConfirmDialog, ProductImage } from '../components/ui';
import { inr } from '../constants';

function Row({ p, onSaved, onDelete }) {
  const toast = useToast();
  const [price, setPrice] = useState(p.price);
  const [qty, setQty] = useState(p.quantity);
  const dirty = Number(price) !== p.price || Number(qty) !== p.quantity;

  const patch = async (body, msg) => {
    try {
      const { data } = await api.put(`/products/${p._id}`, body);
      onSaved(data.product);
      toast.success(msg);
    } catch (e) { toast.error(errMsg(e)); }
  };
  const save = () => {
    if (price === '' || Number(price) < 0) return toast.error('Price must not be negative');
    if (qty === '' || Number(qty) < 0 || !Number.isInteger(Number(qty))) return toast.error('Quantity must be a whole number, 0 or more');
    patch({ price: Number(price), quantity: Number(qty) }, 'Price and stock updated');
  };

  return (
    <tr>
      <td><div className="cell-prod"><ProductImage src={p.image} category={p.category} alt={p.name} className="thumb" /><div><strong>{p.name}</strong><div className="muted small">{p.category} · {p.location}</div></div></div></td>
      <td><input className="mini" type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} aria-label="Price" /></td>
      <td><input className="mini" type="number" min="0" step="1" value={qty} onChange={(e) => setQty(e.target.value)} aria-label="Quantity" /></td>
      <td>
        <label className="switch"><input type="checkbox" checked={p.isAvailable} onChange={(e) => patch({ isAvailable: e.target.checked }, e.target.checked ? 'Marked available' : 'Marked unavailable')} /><span>{p.isAvailable ? (p.quantity > 0 ? 'Available' : 'Out of stock') : 'Hidden'}</span></label>
      </td>
      <td className="actions">
        {dirty && <button className="btn btn-primary btn-sm" onClick={save}>Save</button>}
        <Link className="btn btn-ghost btn-sm" to={`/seller/products/${p._id}/edit`}>Edit</Link>
        <button className="btn btn-danger-ghost btn-sm" onClick={() => onDelete(p)}>Delete</button>
      </td>
    </tr>
  );
}

export default function ManageProducts() {
  const { data, loading, error, reload, setData } = useFetch('/seller/products');
  const toast = useToast();
  const [target, setTarget] = useState(null);

  const replace = (np) => setData({ products: data.products.map((x) => (x._id === np._id ? np : x)) });
  const del = async () => {
    try {
      await api.delete(`/products/${target._id}`);
      setData({ products: data.products.filter((x) => x._id !== target._id) });
      toast.success('Product deleted');
    } catch (e) { toast.error(errMsg(e)); }
    setTarget(null);
  };

  return (
    <div>
      <div className="section-head"><h1>My products</h1><Link to="/seller/products/new" className="btn btn-primary">Add product</Link></div>
      {loading ? <Loader /> : error ? <ErrorBox message={error} onRetry={reload} /> :
        data.products.length === 0 ? <EmptyState title="You have not listed anything yet" text="Add your first product so nearby customers can find it." action={<Link className="btn btn-primary" to="/seller/products/new">Add product</Link>} /> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Product</th><th>Price (₹)</th><th>Stock</th><th>Status</th><th /></tr></thead>
            <tbody>{data.products.map((p) => <Row key={`${p._id}-${p.updatedAt}`} p={p} onSaved={replace} onDelete={setTarget} />)}</tbody>
          </table></div>
        )}
      <ConfirmDialog open={Boolean(target)} danger title="Delete this product?" message={target ? `"${target.name}" (${inr(target.price)}) will be removed permanently.` : ''} confirmText="Delete" onConfirm={del} onCancel={() => setTarget(null)} />
    </div>
  );
}
