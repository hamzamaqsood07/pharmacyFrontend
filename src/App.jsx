import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./auth/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Medicines from "./pages/Medicines";
import Purchase from "./pages/Purchase";
import Invoices from "./pages/Invoices";
import Organization from "./pages/Organization";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "./components/ThemeProvider";
import ThemedToastContainer from "./components/ThemedToastContainer";
import { LogoProvider } from "./components/LogoProvider";

function App() {
  const router = createBrowserRouter([
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/medicines",
      element: (
        <ProtectedRoute>
          <Layout>
            <Medicines />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/purchase",
      element: (
        <ProtectedRoute>
          <Layout>
            <Purchase />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/invoices",
      element: (
        <ProtectedRoute>
          <Layout>
            <Invoices />
          </Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/organization",
      element: (
        <ProtectedRoute>
          <Layout>
            <Organization />
          </Layout>
        </ProtectedRoute>
      ),
    },
  ]);

  return (
    <LogoProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
        <ThemedToastContainer />
      </ThemeProvider>
    </LogoProvider>
  );
}

export default App;
