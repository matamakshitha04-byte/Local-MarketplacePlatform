import { useState } from 'react';
import api, { errMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fmtDate } from '../constants';

export default function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const isSeller = user.role === 'seller';
  const [form, setForm] = useState({ name: user.name, phone: user.phone, location: user.location, shopName: user.shopName || '', shopAddress: user.shopAddress || '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const body = { name: form.name, phone: form.phone, location: form.location };
      if (isSeller) { body.shopName = form.shopName; body.shopAddress = form.shopAddress; }
      const { data } = await api.put('/auth/me', body);
      setUser(data.user);
      toast.success('Profile updated');
    } catch (err) { setError(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <div className="narrow">
      <h1>{isSeller ? 'Seller profile' : 'My profile'}</h1>
      <p className="muted">{user.email} · {user.role} · member since {fmtDate(user.createdAt)}</p>
      <form className="card pad" onSubmit={save} noValidate>
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <label>Full name<input value={form.name} onChange={set('name')} /></label>
        <label>Phone<input value={form.phone} onChange={set('phone')} maxLength={10} inputMode="numeric" /></label>
        <label>Location<input value={form.location} onChange={set('location')} /></label>
        {isSeller && (
          <>
            <label>Shop name<input value={form.shopName} onChange={set('shopName')} /></label>
            <label>Shop address<input value={form.shopAddress} onChange={set('shopAddress')} /></label>
          </>
        )}
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
      </form>
    </div>
  );
}
