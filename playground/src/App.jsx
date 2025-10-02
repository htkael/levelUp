import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Register from './pages/Register'
import { Login } from './pages/Login'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <Routes>
      <Route path='/register' element={<Register />} />
      <Route path='/login' element={<Login />} />
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
