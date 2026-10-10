import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import ProductCard from '../components/ProductCard';
import { Loader, ErrorBox, EmptyState } from '../components/ui';
import { CATEGORIES } from '../constants';

const WHY = [
  ['Local sellers', 'Every product comes from a shop in your own neighbourhood.'],
  ['Easy shopping', 'Search by name, shop or area and filter by price in seconds.'],
  ['Secure sign-in', 'Passwords are hashed and every session is protected by a token.'],
  ['Convenient ordering', 'Order from several shops and follow each order until it arrives.'],
];

export default function Home() {
  const { data, loading, error, reload } = useFetch('/products', { limit: 8 });
  return (
    <>
      <section className="hero">
        <h1>Discover Products From Your Local Sellers</h1>
        <p>Shop local. Support local businesses. Find products near you.</p>
        <div className="hero-actions">
          <Link to="/products" className="btn btn-accent btn-lg">Explore Products</Link>
          <Link to="/register?role=seller" className="btn btn-light btn-lg">Become a Seller</Link>
        </div>
      </section>

      <section className="section">
        <h2>Popular categories</h2>
        <div className="cat-grid">
          {CATEGORIES.map((c) => (
            <Link key={c.name} to={`/products?category=${encodeURIComponent(c.name)}`} className="cat-tile" style={{ '--h': c.hue }}>
              <span className="cat-emoji">{c.emoji}</span><span>{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head"><h2>Featured products</h2><Link to="/products">See all products</Link></div>
        {loading ? <Loader /> : error ? <ErrorBox message={error} onRetry={reload} /> :
          data.products.length === 0 ? <EmptyState title="No products yet" text="Sellers are adding products — check back soon." /> :
          <div className="grid">{data.products.map((p) => <ProductCard key={p._id} product={p} />)}</div>}
      </section>

      <section className="section">
        <h2>Why choose LocalHaat</h2>
        <div className="why-grid">
          {WHY.map(([t, d]) => <div key={t} className="why"><h3>{t}</h3><p>{d}</p></div>)}
        </div>
      </section>
    </>
  );
}
