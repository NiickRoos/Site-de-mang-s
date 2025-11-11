import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Routes, Route}from 'react-router-dom'
import Login from './componentes/login/login.tsx'
import Adm from './admin/adm.tsx'
import Carrinho from './componentes/carrinho/Carrinho.tsx'
import Perfil from './componentes/perfil/Perfil.tsx'



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<App/>}/>
        <Route path="/login" element={<Login/>} />
        <Route path="/adm" element={<Adm/>} />
        <Route path="/carrinho" element={<Carrinho/>} />
        <Route path="/perfil" element={<Perfil/>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)


