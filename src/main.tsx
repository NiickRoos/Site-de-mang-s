import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Login from "./componentes/login/login";
import Adm from "./admin/adm";
import Carrinho from "./componentes/carrinho/Carrinho";
import Checkout from "./componentes/finalizar-compra/checkout";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripe = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/adm" element={<Adm />} />
        <Route path="/carrinho" element={<Carrinho />} />

        <Route
          path="/finalizar-compra"
          element={
            <Elements stripe={stripe}>
              <Checkout />
            </Elements>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
