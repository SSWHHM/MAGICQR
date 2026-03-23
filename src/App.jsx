import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Customer pages
import ScreenA from './pages/customer/ScreenA';
import ScreenB from './pages/customer/ScreenB';

// Admin pages
import Login from './pages/admin/Login';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import RestaurantForm from './pages/admin/RestaurantForm';
import OnboardingWizard from './pages/admin/OnboardingWizard';
import RestaurantDetail from './pages/admin/RestaurantDetail';
import VariantManager from './pages/admin/VariantManager';
import Analytics from './pages/admin/Analytics';
import FeedbackInbox from './pages/admin/FeedbackInbox';
import ServiceEdit from './pages/admin/ServiceEdit';

// SaaS pages
import Landing from './pages/landing';
import Pricing from './pages/pricing';
import Signup from './pages/signup';
import LoginSaaS from './pages/login';
import OnboardingLayout from './layouts/OnboardingLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProductionVercelReady from './pages/production-vercel-ready';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Customer routes (public) */}
          <Route path="/r/:slug" element={<ScreenA />} />
          <Route path="/r/:slug/review" element={<ScreenB />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="restaurants/new" element={<OnboardingWizard />} />
            <Route path="restaurant/:id" element={<RestaurantDetail />} />
            <Route path="restaurant/:id/edit" element={<RestaurantForm />} />
            <Route path="restaurant/:id/analytics" element={<Analytics />} />
            <Route path="restaurant/:id/service/:serviceId/edit" element={<ServiceEdit />} />
            <Route path="restaurant/:id/service/:serviceId/variants" element={<VariantManager />} />
            <Route path="feedback" element={<FeedbackInbox />} />
          </Route>

          {/* SaaS Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<LoginSaaS />} />
          <Route path="/test-mission" element={<ProductionVercelReady />} />
          <Route element={<OnboardingLayout />}><Route path="/onboard" element={<ProtectedRoute><ErrorBoundary><OnboardingWizard /></ErrorBoundary></ProtectedRoute>} /></Route>

          {/* Home redirect (legacy) */}
          <Route
            path="/home-old"
            element={
              <div className="bg-mesh">
                <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <div className="glass fade-in" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '28rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔮</div>
                    <h1 style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-secondary))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      marginBottom: '0.5rem',
                    }}>
                      Magic QR
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
                      Boost your business's Google reviews with smart QR codes.
                    </p>
                    <a href="/login" className="btn-primary" style={{ maxWidth: '200px', margin: '0 auto' }}>
                      Get Started →
                    </a>
                  </div>
                </div>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
