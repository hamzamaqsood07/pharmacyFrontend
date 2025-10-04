import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Login from './auth/Login'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Medicines from './pages/Medicines'
import Purchase from './pages/Purchase'
import Invoices from './pages/Invoices'
import Organization from './pages/Organization'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const router = createBrowserRouter([
    {
      path: "/login",
      element: <Login/>
    },
    {
      path: "/",
      element: <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
    },
    {
      path: "/medicines",
      element: <ProtectedRoute><Layout><Medicines /></Layout></ProtectedRoute>
    },
    {
      path: "/purchase",
      element: <ProtectedRoute><Layout><Purchase /></Layout></ProtectedRoute>
    },
    {
      path: "/invoices",
      element: <ProtectedRoute><Layout><Invoices /></Layout></ProtectedRoute>
    },
    {
      path: "/organization",
      element: <ProtectedRoute><Layout><Organization /></Layout></ProtectedRoute>
    },
  ])

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  )
}

export default App
