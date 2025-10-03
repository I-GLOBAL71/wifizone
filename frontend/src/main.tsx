import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// --- Page Imports ---
import IndexPage from './pages/Index.tsx'
import PackagesPage from './pages/Packages.tsx'
import PaymentPage from './pages/Payment.tsx'
import SuccessPage from './pages/Success.tsx'
import AccountPage from './pages/Account.tsx'
import AmbassadorPage from './pages/Ambassador.tsx'
import AdminPage from './pages/Admin.tsx'
import RedeemCodePage from './pages/RedeemCode.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import NotFoundPage from './pages/NotFound.tsx'

// Admin Sub-Pages
import PackagesAdmin from './pages/admin/PackagesAdmin.tsx'
import UsersAdmin from './pages/admin/UsersAdmin.tsx'
import AmbassadorsAdmin from './pages/admin/AmbassadorsAdmin.tsx'
import AmbassadorAdminPage from './pages/admin/AmbassadorAdmin.tsx'
import SettingsAdmin from './pages/admin/SettingsAdmin.tsx'


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <IndexPage /> },
      { path: 'packages', element: <PackagesPage /> },
      { path: 'payment', element: <PaymentPage /> },
      { path: 'success', element: <SuccessPage /> },
      { path: 'account', element: <AccountPage /> },
      { path: 'redeem-code', element: <RedeemCodePage /> },
      {
        path: 'ambassador',
        element: <AmbassadorPage />,
      },
      {
        path: 'admin',
        element: <AdminPage />,
        children: [
          { index: true, element: <PackagesAdmin /> },
          { path: 'users', element: <UsersAdmin /> },
          { path: 'ambassadors', element: <AmbassadorsAdmin /> },
          { path: 'ambassador/:id', element: <AmbassadorAdminPage /> },
          { path: 'settings', element: <SettingsAdmin /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
