import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { Toaster } from './components/ui/sonner';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { TradesPage } from './pages/TradesPage';
import { CommunityPage } from './pages/CommunityPage';
import { EventsPage } from './pages/EventsPage';
import { AdminPage } from './pages/AdminPage';
import { ListingDetailPage } from './pages/ListingDetailPage';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Layout wrapper for pages with header/footer
function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

// Auth layout for login/signup pages (no header/footer)
function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes with main layout */}
      <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
      <Route path="/community" element={<MainLayout><CommunityPage /></MainLayout>} />
      <Route path="/events" element={<MainLayout><EventsPage /></MainLayout>} />
      
      {/* Auth routes without header/footer */}
      <Route path="/login" element={<AuthLayout><LoginPage /></AuthLayout>} />
      <Route path="/signup" element={<AuthLayout><SignupPage /></AuthLayout>} />
      
      {/* Protected routes with main layout */}
      <Route
        path="/dashboard"
        element={
          <MainLayout>
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          </MainLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <MainLayout>
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          </MainLayout>
        }
      />
      <Route
        path="/trades"
        element={
          <MainLayout>
            <ProtectedRoute>
              <TradesPage />
            </ProtectedRoute>
          </MainLayout>
        }
      />
      <Route
        path="/admin"
        element={
          <MainLayout>
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          </MainLayout>
        }
      />
      <Route
        path="/listings/:id"
        element={
          <MainLayout>
            <ProtectedRoute>
              <ListingDetailPage />
            </ProtectedRoute>
          </MainLayout>
        }
      />
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}