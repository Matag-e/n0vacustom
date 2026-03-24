import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ShippingNoticeModal } from '@/components/ShippingNoticeModal';
import ScrollToTop from '@/components/ScrollToTop';
import Home from '@/pages/Home';
import ProductDetails from '@/pages/ProductDetails';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Profile from '@/pages/Profile';
import Login from '@/pages/Login';
import ForgotPassword from '@/pages/ForgotPassword';
import UpdatePassword from '@/pages/UpdatePassword';
import CategoryPage from '@/pages/CategoryPage';
import FAQ from '@/pages/FAQ';
import Contact from '@/pages/Contact';
import Restoration from '@/pages/Restoration';
import Shipping from '@/pages/Shipping';
import Returns from '@/pages/Returns';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfUse from '@/pages/TermsOfUse';
import CustomizationService from '@/pages/CustomizationService';
import SearchPage from '@/pages/SearchPage';
import AdminLayout from '@/pages/Admin/AdminLayout';
import AdminDashboard from '@/pages/Admin/Dashboard';
import AdminInventory from '@/pages/Admin/Inventory';
import AdminProducts from '@/pages/Admin/Products';
import AdminCoupons from '@/pages/Admin/Coupons';
import NotFound from '@/pages/NotFound';

import { Toaster } from 'sonner';
import { useLocation } from 'react-router-dom';

function NavigationWrapper() {
  const location = useLocation();
  const hideNavigation = ['/update-password', '/login', '/forgot-password'].includes(location.pathname);
  if (hideNavigation) return null;
  return <Navigation />;
}

function FooterWrapper() {
  const location = useLocation();
  const hideFooter = ['/update-password', '/login', '/forgot-password'].includes(location.pathname);
  if (hideFooter) return null;
  return <Footer />;
}

function WhatsAppWrapper() {
  const location = useLocation();
  const hideWhatsApp = ['/update-password', '/login', '/forgot-password'].includes(location.pathname);
  if (hideWhatsApp) return null;
  return <WhatsAppButton />;
}

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <ShippingNoticeModal />
          <Toaster 
            position="top-right" 
            toastOptions={{
              style: {
                background: '#FFFFFF',
                color: '#000000',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                padding: '16px',
              },
            }}
            containerStyle={{
              top: '100px',
              right: '24px',
            }}
          />
          <Router>
            <ScrollToTop />
          <Routes>
            {/* Admin Routes (Standalone Layout) */}
            <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="products" element={<AdminProducts />} />
                      <Route path="inventory" element={<AdminInventory />} />
                      <Route path="coupons" element={<AdminCoupons />} />
                    </Route>

            {/* Public Routes (Main Layout) */}
            <Route path="*" element={
              <div className="flex flex-col min-h-screen bg-gray-50">
                <NavigationWrapper />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/update-password" element={<UpdatePassword />} />
                    <Route path="/restauracao" element={<Restoration />} />
                    <Route path="/personalizacao" element={<CustomizationService />} />
                    <Route path="/envio-e-entrega" element={<Shipping />} />
                    <Route path="/trocas-e-devolucoes" element={<Returns />} />
                    <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
                    <Route path="/termos-de-uso" element={<TermsOfUse />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/contato" element={<Contact />} />
                    
                    {/* Category Routes */}
                    <Route path="/clubes" element={<CategoryPage title="Clubes" category="clubes" />} />
                    <Route path="/selecoes" element={<CategoryPage title="Seleções" category="selecoes" />} />
                    <Route path="/retro" element={<CategoryPage title="Retrô" category="retro" />} />
                    <Route path="/personalizados" element={<CategoryPage title="Personalizados" category="personalizados" />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/lancamentos" element={<CategoryPage title="Lançamentos" category="lancamentos" />} />
                    <Route path="/mais-vendidos" element={<CategoryPage title="Mais Vendidos" category="mais-vendidos" />} />
                    
                    {/* 404 Catch-all */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <WhatsAppWrapper />
                <FooterWrapper />
              </div>
            } />
          </Routes>
        </Router>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
