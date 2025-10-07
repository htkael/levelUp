import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Register from './pages/Register'
import { Login } from './pages/Login'
import { AuthProvider } from './contexts/AuthContext'
import { AuthenticatedPageWrapper } from "./wrappers/AuthenticatedPage.jsx"
import { Dashboard } from './pages/Dashboard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function App() {
  return (
    <Routes>
      <Route path='/register' element={<Register />} />
      <Route path='/login' element={<Login />} />
      <Route path="/" element={<AuthenticatedPageWrapper />}>
        <Route path="" element={<Dashboard />} />
      </Route>
    </Routes>
  )
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: true
    }
  }
})

const Root = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

export default Root
