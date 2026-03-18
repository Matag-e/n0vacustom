import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
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

import { useLocation } from 'react-router-dom';
import { useLayoutEffect } from 'react';

// Wrapper component to handle transitions
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  // Reset scroll on route change
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div key={location.pathname} className="page-transition-enter">
      {children}
    </div>
  );
};

function App() {
  return (
    <HelmetProvider>
      <Toaster 
        position="top-right" 
        richColors 
        closeButton 
        expand={false}
        duration={4000}
        style={{ marginTop: '60px' }}
      />
      <AuthProvider>
        <CartProvider>
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
                <Navigation />
                <main className="flex-grow">
                  <PageTransition>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/product/:id" element={<ProductDetails />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/login" element={<Login />} />
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
                  </PageTransition>
                </main>
                <WhatsAppButton />
                <Footer />
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
