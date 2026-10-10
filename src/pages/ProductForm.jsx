import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Loader, ProductImage } from '../components/ui';
import { CATEGORIES } from '../constants';

export default function ProductForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '', category: CATEGORIES[0].name, price: '', quantity: '', location: user.location, image: '', isAvailable: true });
  const [loading, setLoading] = useState(editing);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editing) return;
    api.get(`/products/${id}`).then(({ data }) => {
      const p = data.product;
      if (String(p.seller._id || p.seller) !== String(user._id)) { toast.error('You do not have permission'); return navigate('/seller/products'); }
      setForm({ name: p.name, description: p.description, category: p.category, price: p.price, quantity: p.quantity, location: p.location, image: p.image || '', isAvailable: p.isAvailable });
    }).catch((e) => setError(errMsg(e))).finally(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    if (!form.name.trim()) return 'Product name is required';
    if (!form.description.trim()) return 'Description is required';
    if (form.price === '' || Number(form.price) < 0 || Number.isNaN(Number(form.price))) return 'Price must be a number that is not negative';
    if (form.quantity === '' || !Number.isInteger(Number(form.quantity)) || Number(form.quantity) < 0) return 'Quantity must be a whole number that is not negative';
    if (!form.location.trim()) return 'Location is required';
    return '';
  };

  const submit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) return setError(problem);
    setBusy(true);
    setError('');
    try {
      const body = { ...form, price: Number(form.price), quantity: Number(form.quantity) };
      if (editing) await api.put(`/products/${id}`, body); else await api.post('/products', body);
      toast.success(editing ? 'Product updated' : 'Product added');
      navigate('/seller/products');
    } catch (err) { setError(errMsg(err)); setBusy(false); }
  };

  if (loading) return <Loader />;
  return (
    <div className="narrow">
      <Link to="/seller/products" className="back">← Back to products</Link>
      <h1>{editing ? 'Edit product' : 'Add product'}</h1>
      <form className="card pad" onSubmit={submit} noValidate>
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <label>Product name<input value={form.name} onChange={set('name')} /></label>
        <label>Description<textarea rows="4" value={form.description} onChange={set('description')} /></label>
        <div className="two-col">
          <label>Category<select value={form.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c.name}>{c.name}</option>)}</select></label>
          <label>Location<input value={form.location} onChange={set('location')} /></label>
        </div>
        <div className="two-col">
          <label>Price (₹)<input type="number" min="0" step="0.01" value={form.price} onChange={set('price')} /></label>
          <label>Quantity in stock<input type="number" min="0" step="1" value={form.quantity} onChange={set('quantity')} /></label>
        </div>
        <label>Image URL (optional)<input value={form.image} onChange={set('image')} placeholder="https://…" /></label>
        {form.image && <ProductImage src={form.image} category={form.category} alt="Preview" className="preview" />}
        <label className="check"><input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} /> Available for customers to order</label>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Add product'}</button>
      </form>
    </div>
  );
}
