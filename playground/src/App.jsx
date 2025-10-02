import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Register from './pages/Register'
import { Login } from './pages/Login'
import { AuthProvider } from './contexts/AuthContext'
import { AuthenticatedPageWrapper } from "./wrappers/AuthenticatedPage.jsx"
import { Dashboard } from './pages/Dashboard'

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

const Root = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default Root
