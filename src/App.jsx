import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./auth/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Medicines from "./pages/Medicines";
import Purchase from "./pages/Purchase";
import Invoices from "./pages/Invoices";
import Organization from "./pages/Organization";
import { ThemeProvider } from "./components/ThemeProvider";
import ThemedToastContainer from "./components/ThemedToastContainer";
import { LogoProvider } from "./components/LogoProvider";
import { AuthProvider } from "./components/AuthProvider";

function App() {
  const router = createBrowserRouter([
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/",
      element: (     
          <Layout>
            <Dashboard />
          </Layout>       
      ),
    },
    {
      path: "/medicines",
      element: (      
          <Layout>
            <Medicines />
          </Layout>  
      ),
    },
    {
      path: "/purchase",
      element: (      
          <Layout>
            <Purchase />
          </Layout>     
      ),
    },
    {
      path: "/invoices",
      element: (    
          <Layout>
            <Invoices />
          </Layout> 
      ),
    },
    {
      path: "/organization",
      element: (   
          <Layout>
            <Organization />
          </Layout>
      ),
    },
  ]);

  return (
    <AuthProvider>
      <LogoProvider>
        <ThemeProvider>
          <RouterProvider router={router}/>
          <ThemedToastContainer/>
        </ThemeProvider>
      </LogoProvider>
    </AuthProvider>
  );
}

export default App;
