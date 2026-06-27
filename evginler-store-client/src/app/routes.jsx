import { createBrowserRouter } from 'react-router-dom'
import { StoreLayout } from '../layouts/StoreLayout'
import { HomePage } from '../pages/HomePage'
import { ProductsPage } from '../pages/ProductsPage'
import { ProductDetailPage } from '../pages/ProductDetailPage'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { CartPage } from '../pages/CartPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { ProfilePage } from '../pages/ProfilePage'
import { PaymentResultPage } from '../pages/PaymentResultPage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ProtectedRoute } from '../components/ProtectedRoute'

const protectedPage = (children) => <ProtectedRoute>{children}</ProtectedRoute>

export const router = createBrowserRouter([
  {
    path: '/',
    element: <StoreLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:productId', element: <ProductDetailPage /> },
      { path: 'search', element: <ProductsPage mode="search" /> },
      { path: 'brand/:brandId', element: <ProductsPage mode="brand" /> },
      { path: 'subcategory/:subcategory', element: <ProductsPage mode="subcategory" /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'profile', element: protectedPage(<ProfilePage section="overview" />) },
      { path: 'profile/info', element: protectedPage(<ProfilePage section="info" />) },
      { path: 'profile/addresses', element: protectedPage(<ProfilePage section="addresses" />) },
      { path: 'profile/orders', element: protectedPage(<ProfilePage section="orders" />) },
      { path: 'profile/favorites', element: protectedPage(<ProfilePage section="favorites" />) },
      { path: 'cart', element: protectedPage(<CartPage />) },
      { path: 'checkout', element: protectedPage(<CheckoutPage />) },
      { path: 'payment-success', element: <PaymentResultPage status="success" /> },
      { path: 'payment-failed', element: <PaymentResultPage status="failed" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
