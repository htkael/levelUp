import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Register from './pages/Register'

function App() {
  return (
    <Routes>
      <Route path='/register' element={<Register />} />
    </Routes>
  )
}

const Root = () => {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}

export default Root
