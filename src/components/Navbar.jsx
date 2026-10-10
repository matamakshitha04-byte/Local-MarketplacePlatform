import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { homeFor } from '../constants';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const links = !user
    ? [['/products', 'Products']]
    : user.role === 'customer'
      ? [['/products', 'Products'], ['/dashboard', 'Dashboard'], ['/orders', 'My orders']]
      : user.role === 'seller'
        ? [['/seller', 'Dashboard'], ['/seller/products', 'My products'], ['/seller/orders', 'Orders']]
        : [['/admin', 'Dashboard'], ['/admin/users', 'Users'], ['/admin/products', 'Products']];

  const search = (e) => {
    e.preventDefault();
    navigate(`/products?q=${encodeURIComponent(q.trim())}`);
    setOpen(false);
  };
  const close = () => setOpen(false);
  const doLogout = () => { logout(); close(); navigate('/'); };
  const showSearch = !user || user.role === 'customer';

  return (
    <header className="navbar">
      <div className="awning" aria-hidden="true" />
      <div className="container nav-inner">
        <Link to={user ? homeFor(user.role) : '/'} className="brand" onClick={close}>Local<b>Haat</b></Link>
        {showSearch && (
          <form className="nav-search" onSubmit={search} role="search">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products, shops, areas" aria-label="Search products" />
            <button className="btn btn-primary btn-sm" type="submit">Search</button>
          </form>
        )}
        <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>☰</button>
        <nav className={`nav-links ${open ? 'open' : ''}`}>
          {links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/seller' || to === '/admin'} onClick={close}>{label}</NavLink>)}
          {user?.role === 'customer' && <NavLink to="/cart" onClick={close}>Cart{count > 0 && <span className="cart-count">{count}</span>}</NavLink>}
          {user && user.role !== 'admin' && <NavLink to={user.role === 'seller' ? '/seller/profile' : '/profile'} onClick={close}>Profile</NavLink>}
          {user ? (
            <button className="btn btn-ghost btn-sm" onClick={doLogout}>Log out</button>
          ) : (
            <>
              <NavLink to="/login" onClick={close}>Log in</NavLink>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={close}>Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
