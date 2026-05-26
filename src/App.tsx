import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AdminRoute } from './components/common/AdminRoute';

import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import PersonProfile from './pages/PersonProfile';
import SuggestPerson from './pages/SuggestPerson';
import Suggestions from './pages/Suggestions';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPeople from './pages/admin/AdminPeople';
import AdminReview from './pages/admin/AdminReview';
import AdminSettings from './pages/admin/AdminSettings';
import AdminCollectors from './pages/admin/AdminCollectors';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Landing />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="person/:slug" element={<PersonProfile />} />
            <Route
              path="suggest"
              element={
                <ProtectedRoute>
                  <SuggestPerson />
                </ProtectedRoute>
              }
            />
            <Route
              path="suggestions"
              element={
                <ProtectedRoute>
                  <Suggestions />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="people" element={<AdminPeople />} />
              <Route path="review" element={<AdminReview />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="collectors" element={<AdminCollectors />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
