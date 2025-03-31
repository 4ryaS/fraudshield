import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';

// Bank Employee Routes
import { Dashboard } from './pages/employee/Dashboard';
import { Upload } from './pages/employee/Upload';
import { History } from './pages/employee/History';

// Admin Routes
import { AdminDashboard } from './pages/admin/Dashboard';
import { FraudCases } from './pages/admin/FraudCases';
import { Analytics } from './pages/admin/Analytics';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Bank Employee Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/history" element={<History />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/cases" element={<FraudCases />} />
          <Route path="/admin/analytics" element={<Analytics />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;