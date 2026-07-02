import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';

const DashboardPage  = lazy(() => import('./pages/DashboardPage'));
const InventoryPage  = lazy(() => import('./pages/InventoryPage'));
const ProductsPage   = lazy(() => import('./pages/ProductsPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const BulkUploadPage = lazy(() => import('./pages/BulkUploadPage'));
const ReportsPage    = lazy(() => import('./pages/ReportsPage'));

const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/bulk-upload" element={<BulkUploadPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <p className="text-6xl font-bold text-brand-accent mb-2">404</p>
            <p className="text-sm">Página no encontrada</p>
          </div>
        } />
      </Route>
    </Routes>
  </Suspense>
);

export default App;
