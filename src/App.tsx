import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
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
import AdminLayout from '@/pages/Admin/AdminLayout';
import AdminDashboard from '@/pages/Admin/Dashboard';
import AdminInventory from '@/pages/Admin/Inventory';
import AdminProducts from '@/pages/Admin/Products';

import { Toaster } from 'sonner';
import { useLocation } from 'react-router-dom';

function NavigationWrapper() {
  const location = useLocation();
  if (location.pathname === '/update-password') return null;
  return <Navigation />;
}

function FooterWrapper() {
  const location = useLocation();
  if (location.pathname === '/update-password') return null;
  return <Footer />;
}

function WhatsAppWrapper() {
  const location = useLocation();
  if (location.pathname === '/update-password') return null;
  return <WhatsAppButton />;
}

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-center" richColors />
          <SpeedInsights />
          <Router>
            <ScrollToTop />
          <Routes>
            {/* Admin Routes (Standalone Layout) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="inventory" element={<AdminInventory />} />
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
                    <Route path="/brasileirao" element={<CategoryPage title="Brasileirão" category="brasileirao" />} />
                    <Route path="/artes-custom" element={<CategoryPage title="Artes Custom" category="artes-custom" />} />
                    <Route path="/nacionais" element={<CategoryPage title="Nacionais" category="nacional" />} />
                    <Route path="/internacionais" element={<CategoryPage title="Internacionais" category="internacional" />} />
                    <Route path="/lancamentos" element={<CategoryPage title="Lançamentos" />} />
                    <Route path="/mais-vendidos" element={<CategoryPage title="Mais Vendidos" />} />
                    <Route path="/personalizados" element={<CategoryPage title="Personalizados" />} />
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
