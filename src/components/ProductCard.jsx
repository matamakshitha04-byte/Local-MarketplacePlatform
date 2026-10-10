import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { inr } from '../constants';
import { ProductImage } from './ui';

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { add } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const inStock = product.isAvailable && product.quantity > 0;

  const addToCart = () => {
    if (!user) return navigate('/login', { state: { from: location.pathname + location.search } });
    const r = add(product, 1);
    r.ok ? toast.success(r.message) : toast.error(r.message);
  };

  return (
    <article className="card product-card">
      <Link to={`/products/${product._id}`} className="product-media">
        <ProductImage src={product.image} category={product.category} alt={product.name} />
        {!inStock && <span className="badge badge-cancelled corner">Unavailable</span>}
      </Link>
      <div className="product-body">
        <span className="muted small">{product.category}</span>
        <h3><Link to={`/products/${product._id}`}>{product.name}</Link></h3>
        <p className="muted small">{product.seller?.shopName || product.seller?.name} · {product.location}</p>
        <div className="product-foot">
          <strong className="price">{inr(product.price)}</strong>
          {(!user || user.role === 'customer') && (
            <button className="btn btn-primary btn-sm" disabled={!inStock} onClick={addToCart}>Add to cart</button>
          )}
        </div>
        {inStock && product.quantity <= 5 && <span className="small warn">Only {product.quantity} left</span>}
      </div>
    </article>
  );
}
