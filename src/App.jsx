import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './auth/login'

function App() {

  const router = createBrowserRouter([
    {
      path: "/login",
      element: <Login/>
    },
  ])

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
