import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Payouts from './pages/Payouts';
import CreatePayout from './pages/CreatePayout';
import PayoutDetail from './pages/PayoutDetail';
import Vendors from './pages/Vendors';
import AddVendor from './pages/AddVendor';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Redirect root */}
          <Route path="/" element={<Navigate to="/payouts" replace />} />

          {/* Protected - OPS + FINANCE */}
          <Route path="/payouts" element={
            <ProtectedRoute><Payouts /></ProtectedRoute>
          } />
          <Route path="/payouts/:id" element={
            <ProtectedRoute><PayoutDetail /></ProtectedRoute>
          } />
          <Route path="/vendors" element={
            <ProtectedRoute><Vendors /></ProtectedRoute>
          } />

          {/* Protected - OPS only */}
          <Route path="/payouts/create" element={
            <ProtectedRoute allowedRoles={['OPS']}><CreatePayout /></ProtectedRoute>
          } />
          <Route path="/vendors/add" element={
            <ProtectedRoute allowedRoles={['OPS']}><AddVendor /></ProtectedRoute>
          } />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/payouts" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
