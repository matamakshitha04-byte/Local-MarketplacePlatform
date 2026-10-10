import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { errMsg } from '../services/api';
import { homeFor } from '../constants';

export default function Register() {
  const { user, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    role: params.get('role') === 'seller' ? 'seller' : 'customer', location: '', shopName: '', shopAddress: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={homeFor(user.role)} replace />;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const isSeller = form.role === 'seller';

  const validate = () => {
    if (form.name.trim().length < 2) return 'Enter your full name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) return 'Enter a valid email address';
    if (!/^\d{10}$/.test(form.phone.trim())) return 'Phone number must be 10 digits';
    if (form.password.length < 6 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) return 'Password must be 6+ characters with letters and numbers';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    if (!form.location.trim()) return 'Enter your location';
    if (isSeller && (!form.shopName.trim() || !form.shopAddress.trim())) return 'Shop name and shop address are required for sellers';
    return '';
  };

  const submit = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) return setError(problem);
    setError('');
    setBusy(true);
    try {
      const u = await register(form);
      toast.success('Account created. Welcome to LocalHaat!');
      navigate(homeFor(u.role), { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-card wide" onSubmit={submit} noValidate>
        <h1>Create your account</h1>
        <div className="seg" role="radiogroup" aria-label="Account type">
          {['customer', 'seller'].map((r) => (
            <button type="button" key={r} role="radio" aria-checked={form.role === r} className={form.role === r ? 'on' : ''} onClick={() => setForm({ ...form, role: r })}>
              {r === 'customer' ? 'I want to shop' : 'I want to sell'}
            </button>
          ))}
        </div>
        {error && <div className="alert alert-error" role="alert">{error}</div>}
        <div className="two-col">
          <label>Full name<input value={form.name} onChange={set('name')} autoComplete="name" /></label>
          <label>Phone number<input value={form.phone} onChange={set('phone')} inputMode="numeric" maxLength={10} autoComplete="tel" /></label>
        </div>
        <label>Email<input type="email" value={form.email} onChange={set('email')} autoComplete="email" /></label>
        <div className="two-col">
          <label>Password<input type="password" value={form.password} onChange={set('password')} autoComplete="new-password" /></label>
          <label>Confirm password<input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} autoComplete="new-password" /></label>
        </div>
        <label>Your location (area or city)<input value={form.location} onChange={set('location')} placeholder="e.g. Madhapur, Hyderabad" /></label>
        {isSeller && (
          <>
            <label>Shop / business name<input value={form.shopName} onChange={set('shopName')} /></label>
            <label>Shop address<input value={form.shopAddress} onChange={set('shopAddress')} /></label>
          </>
        )}
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
        <p className="center small">Already registered? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
