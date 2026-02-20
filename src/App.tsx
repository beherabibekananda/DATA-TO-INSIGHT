import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./components/AuthPage";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import AdminLogin from "./components/AdminLogin";
import PublicStudentView from "./components/PublicStudentView";
import UserRequestsView from "./components/UserRequestsView";
import AdminApprovalPanel from "./components/AdminApprovalPanel";
import ProfileCompletion from "./components/ProfileCompletion";
import CreateUserForm from "./components/CreateUserForm";
import UploadStudentsDataFile from "./components/UploadStudentsDataFile";
import { useState } from "react";

const queryClient = new QueryClient();

// Protected Route Component for Admin
const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const { user, profile, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          !user ? (
            showAuth ? (
              <AuthPage onClose={() => setShowAuth(false)} />
            ) : (
              <PublicStudentView
                onLoginClick={() => setShowAuth(true)}
                onAdminClick={() => window.location.href = '/admin-login'}
              />
            )
          ) : (
            // Logged-in users see the User Dashboard
            <UserDashboard />
          )
        }
      />

      {/* Admin Login Route */}
      <Route
        path="/admin-login"
        element={
          (() => {
            const { isAdmin } = useAuth();

            // Redirect if already logged in as admin
            if (isAdmin) {
              return <Navigate to="/adminDashboard" replace />;
            }

            return <AdminLogin onLoginSuccess={() => window.location.href = '/adminDashboard'} />;
          })()
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/adminDashboard"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/adminDashboard/approvals"
        element={
          <AdminProtectedRoute>
            <AdminApprovalPanel />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/createUser"
        element={
          <AdminProtectedRoute>
            <CreateUserForm />
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/UploadStudentsDataFile"
        element={
          <AdminProtectedRoute>
            <UploadStudentsDataFile />
          </AdminProtectedRoute>
        }
      />

      {/* User Routes - only accessible when logged in */}
      <Route
        path="/dashboard"
        element={
          user ? <UserDashboard /> : <Navigate to="/" replace />
        }
      />
      <Route
        path="/requests"
        element={
          user ? <UserRequestsView /> : <Navigate to="/" replace />
        }
      />

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;