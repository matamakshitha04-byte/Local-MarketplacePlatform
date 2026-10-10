import { useEffect, useState } from 'react';
import { CATEGORIES } from '../constants';

export const Loader = ({ text = 'Loading…' }) => (
  <div className="center-box" role="status"><div className="spinner" /><p>{text}</p></div>
);

export const ErrorBox = ({ message, onRetry }) => (
  <div className="alert alert-error">
    <span>{message}</span>
    {onRetry && <button className="btn btn-sm btn-ghost" onClick={onRetry}>Try again</button>}
  </div>
);

export const EmptyState = ({ title, text, action }) => (
  <div className="empty"><h3>{title}</h3>{text && <p>{text}</p>}{action}</div>
);

export const StatusBadge = ({ status }) => <span className={`badge badge-${status.toLowerCase()}`}>{status}</span>;

export const StatCard = ({ label, value, tone }) => (
  <div className={`stat ${tone ? `stat-${tone}` : ''}`}><span className="stat-value">{value}</span><span className="stat-label">{label}</span></div>
);

export function ProductImage({ src, category, alt, className = '' }) {
  const [bad, setBad] = useState(false);
  useEffect(() => setBad(false), [src]);
  if (src && !bad) return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setBad(true)} />;
  const c = CATEGORIES.find((x) => x.name === category) || CATEGORIES[0];
  return (
    <div className={`img-fallback ${className}`} style={{ background: `hsl(${c.hue} 45% 90%)` }} role="img" aria-label={alt}>
      <span>{c.emoji}</span>
    </div>
  );
}

export function ConfirmDialog({ open, title, message, confirmText = 'Confirm', danger, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="dlg-title" onClick={(e) => e.stopPropagation()}>
        <h3 id="dlg-title">{title}</h3>
        <p>{message}</p>
        <div className="row-end">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm} autoFocus>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
