import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import AnnouncementBar from './components/AnnouncementBar';
import HeaderNew from './components/HeaderNew';
import FooterNew from './components/FooterNew';
import About from './pages/About';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Product from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import CategoryPage from './pages/CategoryPage';
import ForgotPassword from './pages/ForgotPassword';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import ArtisanProfile from './pages/ArtisanProfile';
import Wishlist from './pages/Wishlist';
import UserDashboard from './pages/user/UserDashboard';

// Admin Architecture
import AdminGuard from './components/admin/AdminGuard';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminUsers from './pages/admin/AdminUsers';
import AdminContacts from './pages/admin/AdminContacts';
import AdminSubscribers from './pages/admin/AdminSubscribers';
import RolesPermissions from './pages/RolesPermissions';

// Create a single QueryClient instance with sensible defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const StorefrontLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      <ScrollToTop />
      {!isAdmin && <AnnouncementBar />}
      {!isAdmin && <HeaderNew />}
      <main className={isAdmin ? 'admin-wrapper' : 'main-content'}>
        {children}
      </main>
      {!isAdmin && <FooterNew />}
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <StorefrontLayout>
                <Routes>
                  {/* Home Route */}
                  <Route path="/" element={<Home />} />

                  {/* About Route */}
                  <Route path="/about" element={<About />} />

                  {/* Contact Route */}
                  <Route path="/contact" element={<Contact />} />

                  {/* Product Route */}
                  <Route path="/products" element={<Product />} />
                  <Route path="/product/:id" element={<ProductDetail />} />

                  {/* Category Page Route for individual categories */}
                  <Route path="/category/:categoryId" element={<CategoryPage />} />

                  {/* Cart Route */}
                  <Route path="/cart" element={<Cart />} />

                  {/* Wishlist Route */}
                  <Route path="/wishlist" element={<Wishlist />} />

                  {/* Profile & Customer Dashboard Routes */}
                  <Route path="/profile" element={<UserDashboard />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/user/dashboard" element={<UserDashboard />} />

                  {/* Checkout Routes */}
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-success" element={<OrderSuccess />} />
                  <Route path="/orders" element={<Orders />} />

                  {/* Artisan Profile Route */}
                  <Route path="/artisan/:slug" element={<ArtisanProfile />} />

                  {/* ── Admin Control Center (Permission-Gated Nested Routes) ── */}
                  <Route
                    path="/admin"
                    element={
                      <AdminGuard>
                        <AdminLayout />
                      </AdminGuard>
                    }
                  >
                    <Route index element={<AdminOverview />} />
                    <Route
                      path="orders"
                      element={
                        <AdminGuard requiredPermission="orders:read">
                          <AdminOrders />
                        </AdminGuard>
                      }
                    />
                    <Route
                      path="products"
                      element={
                        <AdminGuard requiredPermission="products:read">
                          <AdminProducts />
                        </AdminGuard>
                      }
                    />
                    <Route
                      path="coupons"
                      element={
                        <AdminGuard requiredPermission="coupons:read">
                          <AdminCoupons />
                        </AdminGuard>
                      }
                    />
                    <Route
                      path="users"
                      element={
                        <AdminGuard requiredPermission="users:read">
                          <AdminUsers />
                        </AdminGuard>
                      }
                    />
                    <Route
                      path="contacts"
                      element={
                        <AdminGuard requiredPermission="messages:read">
                          <AdminContacts />
                        </AdminGuard>
                      }
                    />
                    <Route
                      path="subscribers"
                      element={
                        <AdminGuard requiredPermission="marketing:read">
                          <AdminSubscribers />
                        </AdminGuard>
                      }
                    />
                    <Route
                      path="roles"
                      element={
                        <AdminGuard requiredPermission="roles:read">
                          <RolesPermissions />
                        </AdminGuard>
                      }
                    />
                  </Route>

                  {/* Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                </Routes>
              </StorefrontLayout>
            </Router>
          </WishlistProvider>
        </CartProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
