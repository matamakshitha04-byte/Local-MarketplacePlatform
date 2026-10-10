import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { EmptyState, ProductImage } from '../components/ui';
import { inr } from '../constants';

export default function Cart() {
  const { items, setQty, remove, total, count } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  if (items.length === 0) {
    return <EmptyState title="Your cart is empty" text="Add a few products from local sellers to get started." action={<Link to="/products" className="btn btn-primary">Browse products</Link>} />;
  }
  return (
    <div>
      <h1>Your cart</h1>
      <div className="layout-cart">
        <div className="card cart-list">
          {items.map(({ product: p, quantity }) => (
            <div className="cart-row" key={p._id}>
              <ProductImage src={p.image} category={p.category} alt={p.name} className="cart-img" />
              <div className="cart-info">
                <Link to={`/products/${p._id}`}><strong>{p.name}</strong></Link>
                <span className="muted small">{p.shopName} · {inr(p.price)} each</span>
              </div>
              <div className="qty">
                <button aria-label="Decrease quantity" onClick={() => setQty(p._id, quantity - 1)} disabled={quantity <= 1}>−</button>
                <span>{quantity}</span>
                <button aria-label="Increase quantity" onClick={() => (quantity >= p.quantity ? toast.error(`Only ${p.quantity} available`) : setQty(p._id, quantity + 1))}>+</button>
              </div>
              <strong className="cart-line">{inr(p.price * quantity)}</strong>
              <button className="btn btn-ghost btn-sm" onClick={() => remove(p._id)}>Remove</button>
            </div>
          ))}
        </div>
        <aside className="card summary">
          <h3>Order summary</h3>
          <div className="sum-row"><span>Items ({count})</span><span>{inr(total)}</span></div>
          <div className="sum-row total"><span>Total</span><span>{inr(total)}</span></div>
          <button className="btn btn-primary btn-block" onClick={() => navigate('/checkout')}>Proceed to checkout</button>
        </aside>
      </div>
    </div>
  );
}
