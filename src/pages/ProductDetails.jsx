import { useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { Loader, ErrorBox, ProductImage } from '../components/ui';
import { inr } from '../constants';

export default function ProductDetails() {
  const { id } = useParams();
  const { data, loading, error, reload } = useFetch(`/products/${id}`);
  const { user } = useAuth();
  const { add } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [qty, setQty] = useState(1);

  if (loading) return <Loader />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  const p = data.product;
  const inStock = p.isAvailable && p.quantity > 0;
  const canBuy = !user || user.role === 'customer';

  const addToCart = (goToCart) => {
    if (!user) return navigate('/login', { state: { from: location.pathname } });
    const r = add(p, qty);
    if (!r.ok) return toast.error(r.message);
    toast.success(r.message);
    if (goToCart) navigate('/cart');
  };

  return (
    <div>
      <Link to="/products" className="back">← Back to products</Link>
      <div className="detail">
        <ProductImage src={p.image} category={p.category} alt={p.name} className="detail-img" />
        <div className="detail-info">
          <span className="muted">{p.category}</span>
          <h1>{p.name}</h1>
          <p className="price big">{inr(p.price)}</p>
          <p>{p.description}</p>
          <p className={inStock ? 'ok' : 'warn'}>{inStock ? `In stock · ${p.quantity} available` : 'Currently unavailable'}</p>
          <p className="muted">Available in {p.location}</p>

          {canBuy && (
            <div className="buy-row">
              <div className="qty">
                <button aria-label="Decrease quantity" onClick={() => setQty(Math.max(1, qty - 1))} disabled={!inStock}>−</button>
                <span>{qty}</span>
                <button aria-label="Increase quantity" onClick={() => setQty(Math.min(p.quantity, qty + 1))} disabled={!inStock || qty >= p.quantity}>+</button>
              </div>
              <button className="btn btn-primary" disabled={!inStock} onClick={() => addToCart(false)}>Add to cart</button>
              <button className="btn btn-accent" disabled={!inStock} onClick={() => addToCart(true)}>Buy now</button>
            </div>
          )}

          <div className="seller-box card">
            <h3>Sold by {p.seller?.shopName || p.seller?.name}</h3>
            <p className="muted">{p.seller?.shopAddress}</p>
            <p className="small">Seller: {p.seller?.name} · {p.seller?.location}</p>
            {p.seller?.phone && <p className="small">Phone: {p.seller.phone}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
