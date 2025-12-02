import { useEffect, useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import api from "../../api/api";

type CartaoPagamentoProps = {
  carrinhoId: string;
};

type PagamentoResponse = {
  clientSecret: string;
};

export default function CartaoPagamento({ carrinhoId }: CartaoPagamentoProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [clientSecret, setClientSecret] = useState<string>("");

  useEffect(() => {
    async function criarIntent() {
      try {
        const response = await api.post<PagamentoResponse>(
          "/criar-pagamento-cartao",
          { carrinhoId }
        );

        setClientSecret(response.data.clientSecret);
      } catch (error) {
        console.error("Erro ao gerar pagamento:", error);
      }
    }

    criarIntent();
  }, [carrinhoId]);

  async function pagar(e: React.FormEvent) {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      return;
    }

    const resultado = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (resultado.error) {
      alert("Erro: " + resultado.error.message);
    } else {
      if (resultado.paymentIntent?.status === "succeeded") {
        alert("Pagamento realizado com sucesso!");
      }
    }
  }

  return (
    <div style={{ padding: "20px", color: "#fff" }}>
      <h1>Pagamento com cartão</h1>

      {!clientSecret ? (
        <p>Carregando formulário...</p>
      ) : (
        <form onSubmit={pagar}>
          <label>Número do cartão / Validade / CVC</label>
          <div
            style={{
              padding: "10px",
              background: "#fff",
              borderRadius: "4px",
              color: "black",
            }}
          >
            <CardElement options={{ hidePostalCode: true }} />
          </div>

          <button
            type="submit"
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "purple",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
            }}
          >
            Pagar
          </button>
        </form>
      )}
    </div>
  );
}
