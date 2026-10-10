import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import OrderDetails from './pages/OrderDetails';
import Profile from './pages/Profile';
import SellerDashboard from './pages/SellerDashboard';
import ProductForm from './pages/ProductForm';
import ManageProducts from './pages/ManageProducts';
import SellerOrders from './pages/SellerOrders';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminProducts from './pages/AdminProducts';

const guard = (roles, el) => <ProtectedRoute roles={roles}>{el}</ProtectedRoute>;
const C = ['customer'];
const S = ['seller'];
const A = ['admin'];

function ScrollTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <div className="app">
      <ScrollTop />
      <Navbar />
      <main className="container main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/dashboard" element={guard(C, <CustomerDashboard />)} />
          <Route path="/cart" element={guard(C, <Cart />)} />
          <Route path="/checkout" element={guard(C, <Checkout />)} />
          <Route path="/orders" element={guard(C, <MyOrders />)} />
          <Route path="/orders/:id" element={guard(['customer', 'seller', 'admin'], <OrderDetails />)} />
          <Route path="/profile" element={guard(C, <Profile />)} />

          <Route path="/seller" element={guard(S, <SellerDashboard />)} />
          <Route path="/seller/products" element={guard(S, <ManageProducts />)} />
          <Route path="/seller/products/new" element={guard(S, <ProductForm />)} />
          <Route path="/seller/products/:id/edit" element={guard(S, <ProductForm />)} />
          <Route path="/seller/orders" element={guard(S, <SellerOrders />)} />
          <Route path="/seller/profile" element={guard(S, <Profile />)} />

          <Route path="/admin" element={guard(A, <AdminDashboard />)} />
          <Route path="/admin/users" element={guard(A, <AdminUsers />)} />
          <Route path="/admin/products" element={guard(A, <AdminProducts />)} />

          <Route path="*" element={<div className="empty"><h3>Page not found</h3><p>The page you are looking for does not exist.</p><Link className="btn btn-primary" to="/">Go home</Link></div>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
