import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Register from './pages/Register'
import { Login } from './pages/Login'
import { AuthProvider } from './contexts/AuthContext'
import { AuthenticatedPageWrapper } from "./wrappers/AuthenticatedPage.jsx"
import { Dashboard } from './pages/Dashboard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Categories } from './pages/Categories.jsx'
import { ToastContainer } from 'react-toastify'
import { ErrorBoundary } from 'react-error-boundary'
import { ErrorBoundaryFallback } from "./components/shared/errors/ErrorBoundaryFallback.jsx"
import { Category } from "./pages/Category.jsx"
import { Activities } from './pages/Activities.jsx'
import { Activity } from './pages/Activity.jsx'
import { Calendar } from './pages/Calendar.jsx'
import { Goals } from './pages/Goals.jsx'
import { Goal } from './pages/Goal.jsx'

function App() {
  return (
    <Routes>
      <Route path='/register' element={<Register />} />
      <Route path='/login' element={<Login />} />
      <Route path="/" element={<AuthenticatedPageWrapper />}>
        <Route path="" element={<Dashboard />} />
        <Route path="categories" element={<Categories />} />
        <Route path="categories/:id" element={<Category />} />
        <Route path="activities" element={<Activities />} />
        <Route path="activities/:id" element={<Activity />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="goals" element={<Goals />} />
        <Route path="goals/:id" element={<Goal />} />
      </Route>
    </Routes>
  )
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 5 * 1000,
      retry: 2,
      refetchOnWindowFocus: true
    }
  }
})

const Root = () => {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ErrorBoundary
            FallbackComponent={ErrorBoundaryFallback}
            onReset={() => {
              window.location.href = "/"
            }}
            onError={(error, errorInfo) => {
              console.error("Error caught by error boundary", error, errorInfo)
            }}
          >
            <ToastContainer
              position='top-right'
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              pauseOnHover
              theme='dark'
            />
            <App />
          </ErrorBoundary>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}

export default Root
