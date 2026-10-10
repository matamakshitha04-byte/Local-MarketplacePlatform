import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div><span className="brand">Local<b>Haat</b></span><p>Shop local. Support local businesses.</p></div>
        <div className="footer-links">
          <Link to="/products">Browse products</Link>
          <Link to="/register?role=seller">Become a seller</Link>
          <Link to="/login">Log in</Link>
        </div>
      </div>
    </footer>
  );
}
