import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

export default function CartaoPagamento() {
  const stripe = useStripe();
  const elements = useElements();

  const location = useLocation();
  const { total } = location.state || { total: 0 }; // <<< pega o total enviado da página anterior

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const pagar = async () => {
    if (!stripe || !elements) return;

    setLoading(true);
    setStatus("");

    try {
      const token = localStorage.getItem("token");

      // Criando pagamento no backend com o valor real do carrinho
      const { data } = await axios.post<{ clientSecret: string }>(
        `${API_URL}/criar-pagamento-cartao`,
        {
          total: Math.round(total * 100), // <<< agora usa o total real
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const clientSecret = data.clientSecret;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement)!,
        },
      });

      if (result.error) {
        setStatus("Erro: " + result.error.message);
      } else if (result.paymentIntent?.status === "succeeded") {
        setStatus("Pagamento aprovado! 🎉");
      }
    } catch (err: any) {
      console.error(err);
      setStatus(err.response?.data?.mensagem || "Erro ao criar pagamento.");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h2>Pagamento com cartão</h2>
      <p><strong>Total:</strong> R$ {total.toFixed(2)}</p>

      <label>Número do cartão</label>
      <CardNumberElement
        className="card-element"
        options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#333",
              letterSpacing: "0.5px",
            },
            invalid: { color: "#e5424d" },
          },
        }}
      />

      <label>Validade</label>
      <CardExpiryElement
        className="card-element"
        options={{
          style: { base: { fontSize: "16px", color: "#333" } },
        }}
      />

      <label>CVC</label>
      <CardCvcElement
        className="card-element"
        options={{
          style: { base: { fontSize: "16px", color: "#333" } },
        }}
      />

      <button
        onClick={pagar}
        disabled={loading || !stripe}
        style={{
          marginTop: "20px",
          padding: "10px",
          width: "100%",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        {loading ? "Processando..." : "Pagar"}
      </button>

      {status && <p>{status}</p>}
    </div>
  );
}
