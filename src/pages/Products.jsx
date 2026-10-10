import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import ProductCard from '../components/ProductCard';
import { Loader, ErrorBox, EmptyState } from '../components/ui';
import { CATEGORIES } from '../constants';

export default function Products() {
  const [params, setParams] = useSearchParams();
  const get = (k) => params.get(k) || '';
  const [form, setForm] = useState({ q: get('q'), location: get('location'), minPrice: get('minPrice'), maxPrice: get('maxPrice') });

  useEffect(() => {
    setForm({ q: get('q'), location: get('location'), minPrice: get('minPrice'), maxPrice: get('maxPrice') });
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  const query = {
    q: get('q'), category: get('category'), location: get('location'), minPrice: get('minPrice'),
    maxPrice: get('maxPrice'), availability: get('availability'), sort: get('sort') || 'newest', page: get('page') || 1, limit: 12,
  };
  const { data, loading, error, reload } = useFetch('/products', query);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries({ page: '', ...patch }).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next);
  };
  const applyText = (e) => { e.preventDefault(); update(form); };
  const clear = () => { setParams({}); };
  const hasFilters = ['q', 'category', 'location', 'minPrice', 'maxPrice', 'availability'].some((k) => get(k));
  const setF = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="layout-side">
      <aside className="filters card">
        <form onSubmit={applyText}>
          <h3>Filters</h3>
          <label>Search<input value={form.q} onChange={setF('q')} placeholder="Name, category, shop or area" /></label>
          <label>Category
            <select value={get('category')} onChange={(e) => update({ category: e.target.value })}>
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c.name}>{c.name}</option>)}
            </select>
          </label>
          <label>Location<input value={form.location} onChange={setF('location')} placeholder="e.g. Madhapur" /></label>
          <div className="two-col">
            <label>Min price<input type="number" min="0" value={form.minPrice} onChange={setF('minPrice')} /></label>
            <label>Max price<input type="number" min="0" value={form.maxPrice} onChange={setF('maxPrice')} /></label>
          </div>
          <label className="check"><input type="checkbox" checked={get('availability') === 'all'} onChange={(e) => update({ availability: e.target.checked ? 'all' : '' })} /> Include unavailable items</label>
          <button className="btn btn-primary btn-block" type="submit">Apply filters</button>
          {hasFilters && <button type="button" className="btn btn-ghost btn-block" onClick={clear}>Clear all</button>}
        </form>
      </aside>

      <section>
        <div className="section-head">
          <h2>{get('category') || 'All products'}{data && <span className="muted small"> · {data.total} found</span>}</h2>
          <label className="inline">Sort by
            <select value={query.sort} onChange={(e) => update({ sort: e.target.value === 'newest' ? '' : e.target.value })}>
              <option value="newest">Newest products</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </label>
        </div>
        {loading ? <Loader /> : error ? <ErrorBox message={error} onRetry={reload} /> :
          data.products.length === 0 ? <EmptyState title="No products match" text="Try a different search or clear some filters." action={hasFilters && <button className="btn btn-primary" onClick={clear}>Clear filters</button>} /> : (
            <>
              <div className="grid">{data.products.map((p) => <ProductCard key={p._id} product={p} />)}</div>
              {data.pages > 1 && (
                <div className="pager">
                  <button className="btn btn-ghost btn-sm" disabled={data.page <= 1} onClick={() => update({ page: String(data.page - 1) })}>Previous</button>
                  <span>Page {data.page} of {data.pages}</span>
                  <button className="btn btn-ghost btn-sm" disabled={data.page >= data.pages} onClick={() => update({ page: String(data.page + 1) })}>Next</button>
                </div>
              )}
            </>
          )}
      </section>
    </div>
  );
}
