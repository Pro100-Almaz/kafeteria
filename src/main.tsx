import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import './index.css'
import AdminAudit from './pages/admin/Audit'
import AdminCatalog from './pages/admin/Catalog'
import Dashboard from './pages/admin/Dashboard'
import { EmployeeCard, Employees } from './pages/admin/Employees'
import AdminOrders from './pages/admin/Orders'
import AdminSettings from './pages/admin/Settings'
import Cart from './pages/employee/Cart'
import Catalog from './pages/employee/Catalog'
import Health from './pages/employee/Health'
import Home from './pages/employee/Home'
import ItemPage from './pages/employee/Item'
import Onboarding from './pages/employee/Onboarding'
import Orders from './pages/employee/Orders'
import Points from './pages/employee/Points'
import Transfer from './pages/employee/Transfer'
import { useMe } from './store'

function AdminOnly({ children }: { children: React.ReactNode }) {
  return useMe().role === 'hr' ? children : <Navigate to="/" replace />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="item/:id" element={<ItemPage />} />
          <Route path="cart" element={<Cart />} />
          <Route path="health" element={<Health />} />
          <Route path="orders" element={<Orders />} />
          <Route path="points" element={<Points />} />
          <Route path="transfer" element={<Transfer />} />
        </Route>
        <Route path="admin" element={<AdminOnly><Layout admin /></AdminOnly>}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="employees" element={<Employees />} />
          <Route path="employees/:id" element={<EmployeeCard />} />
          <Route path="catalog" element={<AdminCatalog />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="audit" element={<AdminAudit />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  </StrictMode>,
)
