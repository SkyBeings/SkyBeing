import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "./store/slices/cartSlice";
import { fetchCurrentUser } from "./store/slices/authSlice";
import api from "./api/axios";
import { ToastProvider } from "./components/ui/Toast";
import BirdLoader from "./components/ui/BirdLoader";

// ── Visit tracker: fires once per route change ──────────────────────────────
const getSessionId = () => {
  let sid = sessionStorage.getItem("_sid");
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("_sid", sid);
  }
  return sid;
};

function VisitTracker() {
  const location = useLocation();
  const lastPath = useRef(null);
  useEffect(() => {
    // Only track once per distinct path per session
    if (location.pathname === lastPath.current) return;
    lastPath.current = location.pathname;
    // Fire and forget — don't block the UI
    api.post("/stats/visit", {
      page: location.pathname,
      sessionId: getSessionId(),
    }).catch(() => { }); // silently ignore errors
  }, [location.pathname]);
  return null;
}
// ─────────────────────────────────────────────────────────────────────────────


import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import Contact from "./pages/Contact";
import Wishlist from "./pages/Wishlist";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ReturnPolicy from "./pages/ReturnPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import TermsConditions from "./pages/TermsConditions";
import AboutUs from "./pages/AboutUs";

import Gallery from "./pages/Gallery";
import Blogs from "./pages/Blogs";
import BlogDetails from "./pages/BlogDetails";

import AdminRoute from "./components/auth/AdminRoute";
import AdminLayout from "./components/layout/AdminLayout";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminShippingCharges from "./pages/admin/AdminShippingCharges";
import AdminShippingCompanies from "./pages/admin/AdminShippingCompanies";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminSubCategories from "./pages/admin/AdminSubCategories";
import AdminAttributesPage from "./pages/admin/AdminAttributes";
import AdminAttributeValues from "./pages/admin/AdminAttributeValues";
import AdminColors from "./pages/admin/AdminColors";
import AdminTax from "./pages/admin/AdminTax";
import AdminStats from "./pages/admin/AdminStats";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminBlogs from "./pages/admin/AdminBlogs";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminReports from "./pages/admin/AdminReports";
import AdminInquiries from "./pages/admin/AdminInquiries";
import AdminSettingsPayment from "./pages/admin/AdminSettingsPayment";
import AdminSettingsMaintenance from "./pages/admin/AdminSettingsMaintenance";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, status: authStatus } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <BirdLoader text="Waking up the birds..." />
      </div>
    );
  }

  return (
    <ToastProvider>
      <Router>
        <VisitTracker />
        <div className="flex flex-col min-h-screen font-sans selection:bg-skyGreen/20 selection:text-skyGreen">
          <Routes>
          {/* ── Admin Routes ─────────────────────────────────── */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              {/* Products */}
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/create" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="subcategories" element={<AdminSubCategories />} />
              <Route path="attributes" element={<AdminAttributesPage />} />
              <Route path="attribute-values" element={<AdminAttributeValues />} />
              <Route path="colors" element={<AdminColors />} />
              <Route path="tax" element={<AdminTax />} />
              {/* Orders */}
              <Route path="orders" element={<AdminOrders />} />
              {/* Users */}
              <Route path="users" element={<AdminUsers />} />
              {/* Shipping */}
              <Route path="shipping/charges" element={<AdminShippingCharges />} />
              <Route path="shipping/companies" element={<AdminShippingCompanies />} />
              {/* Website */}
              <Route path="stats" element={<AdminStats />} />
              <Route path="testimonials" element={<AdminTestimonials />} />
              <Route path="blogs" element={<AdminBlogs />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="gallery" element={<AdminGallery />} />
              {/* Reports & Inquiries */}
              <Route path="reports" element={<AdminReports />} />
              <Route path="inquiries" element={<AdminInquiries />} />
              {/* Settings */}
              <Route path="settings/payment" element={<AdminSettingsPayment />} />
              <Route path="settings/maintenance" element={<AdminSettingsMaintenance />} />
            </Route>
          </Route>

          {/* ── Public / Customer Routes ──────────────────────── */}
          <Route path="*" element={
            <>
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/blogs" element={<Blogs />} />
                  <Route path="/blogs/:slug" element={<BlogDetails />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/login" element={<Auth />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/return-policy" element={<ReturnPolicy />} />
                  <Route path="/shipping-policy" element={<ShippingPolicy />} />
                  <Route path="/terms" element={<TermsConditions />} />
                  <Route path="/about" element={<AboutUs />} />

                </Routes>
              </main>
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
    </ToastProvider>
  );
}

export default App;
