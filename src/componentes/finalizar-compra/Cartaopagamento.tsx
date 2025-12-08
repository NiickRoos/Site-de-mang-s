import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { useState } from "react";
import axios from "axios";

export default function CartaoPagamento() {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const pagar = async () => {
    if (!stripe || !elements) return;

    setLoading(true);

    try {
      // 🔐 Pegando o token salvo no login
      const token = localStorage.getItem("token");

      // 👉 Requisição AGORA com credencial (Authorization)
      const { data } = await axios.post<{ clientSecret: string }>(
        `${API_URL}/criar-pagamento-cartao`,
        {},
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
      setStatus(
        err.response?.data?.mensagem || "Erro ao criar pagamento."
      );
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto" }}>
      <h2>Pagamento com cartão</h2>

      <label>Número do cartão</label>
      <CardNumberElement className="card-element" />

      <label>Validade</label>
      <CardExpiryElement className="card-element" />

      <label>CVC</label>
      <CardCvcElement className="card-element" />

      <button onClick={pagar} disabled={loading || !stripe}>
        {loading ? "Processando..." : "Pagar"}
      </button>

      {status && <p>{status}</p>}
    </div>
  );
}
