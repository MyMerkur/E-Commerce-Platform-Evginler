import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { AdminLayout } from '../layouts/AdminLayout'
import { BrandsPage } from '../pages/BrandsPage'
import { CategoriesPage } from '../pages/CategoriesPage'
import { DashboardPage } from '../pages/DashboardPage'
import { LoginPage } from '../pages/LoginPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { OrdersPage } from '../pages/OrdersPage'
import { ProductFormPage } from '../pages/ProductFormPage'
import { ProductsPage } from '../pages/ProductsPage'
import { RegisterPage } from '../pages/RegisterPage'

const protectedPage = (children) => <ProtectedRoute>{children}</ProtectedRoute>

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    path: '/',
    element: protectedPage(<AdminLayout />),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/new', element: <ProductFormPage mode="new" /> },
      { path: 'products/:productId/edit', element: <ProductFormPage mode="edit" /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'brands', element: <BrandsPage /> },
      { path: 'orders', element: <OrdersPage status="all" /> },
      { path: 'orders/incoming', element: <OrdersPage status="incoming" /> },
      { path: 'orders/confirmed', element: <OrdersPage status="confirmed" /> },
      { path: 'orders/delivered', element: <OrdersPage status="delivered" /> },
      { path: 'orders/returned', element: <OrdersPage status="returned" /> },
      { path: 'orders/canceled', element: <OrdersPage status="canceled" /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
