import { useLocation } from "react-router-dom";
import CartaoPagamento from "./Cartaopagamento";

export default function Checkout() {
  const location = useLocation();
  const carrinhoId = location.state?.carrinhoId;

  if (!carrinhoId) {
    return <p>Erro: carrinho não encontrado.</p>;
  }

  return <CartaoPagamento carrinhoId={carrinhoId} />;
}
