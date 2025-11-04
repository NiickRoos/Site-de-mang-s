import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/api";

interface CarrinhoItem {
  _id: string;
  produto: {
    _id: string;
    nome: string;
    preco: number | string;
    descricao: string;
    urlfoto: string;
  };
  quantidade: number;
}

interface CarrinhoResponse {
  _id: string;
  itens: any[];
}

function Carrinho() {
  const [carrinhoId, setCarrinhoId] = useState<string>("");
  const [itens, setItens] = useState<CarrinhoItem[]>([]);
  const [filtro, setFiltro] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Buscar carrinho do usuário
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      const mensagem = encodeURIComponent("Faça login para acessar seu carrinho.");
      const redirect = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?mensagem=${mensagem}&redirect=${redirect}`, { replace: true });
      return;
    }

    api
      .get<CarrinhoResponse>("/carrinho", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res: any) => {
        console.log("🧾 Dados recebidos do backend:", res.data);

        // se o backend retorna um objeto com id e itens
        if (res.data && Array.isArray(res.data.itens)) {
          setCarrinhoId(res.data._id);
          const normalizados: CarrinhoItem[] = res.data.itens.map((item: any) => ({
            _id: item._id || item.produtoId,
            produto: {
              _id: item.produtoId,
              nome: item.nome || "Produto sem nome",
              preco: Number(item.precoUnitario) || 0,
              descricao: item.descricao || "",
              urlfoto: item.urlfoto || "",
            },
            quantidade: Number(item.quantidade) || 1,
          }));
          setItens(normalizados);
        } else {
          // caso o backend envie direto o array
          const normalizados: CarrinhoItem[] = res.data.map((item: any) => ({
            _id: item._id || item.produtoId,
            produto: {
              _id: item.produtoId,
              nome: item.nome || "Produto sem nome",
              preco: Number(item.precoUnitario) || 0,
              descricao: item.descricao || "",
              urlfoto: item.urlfoto || "",
            },
            quantidade: Number(item.quantidade) || 1,
          }));
          setItens(normalizados);
        }
      })
      .catch((err) => {
        console.error(err);
        alert(err?.response?.data?.mensagem || "Erro ao carregar carrinho");
      });
  }, [navigate, location]);

  const itensFiltrados = useMemo(() => {
    const f = filtro.trim().toLowerCase();
    if (!f) return itens;
    return itens.filter((i) => i.produto.nome.toLowerCase().includes(f));
  }, [filtro, itens]);

  function atualizarQuantidade(itemId: string, novaQtd: number) {
    if (novaQtd <= 0) return;

    api
      .put(`/carrinho/${itemId}`, { quantidade: novaQtd })
      .then(() => {
        setItens((prev) =>
          prev.map((i) => (i._id === itemId ? { ...i, quantidade: novaQtd } : i))
        );
      })
      .catch((err) => {
        console.error(err);
        alert(err?.response?.data?.mensagem || "Erro ao atualizar quantidade");
      });
  }

  // 🔹 Agora removendo item corretamente usando /carrinho/:id/item/:itemId
  function removerItem(itemId: string) {
    if (!carrinhoId) return alert("Carrinho não encontrado");

    api
      .delete(`/carrinho/${carrinhoId}/item/${itemId}`)
      .then(() => setItens((prev) => prev.filter((i) => i._id !== itemId)))
      .catch((err) =>
        alert(err?.response?.data?.mensagem || "Erro ao remover item")
      );
  }

  const total = useMemo(() => {
    return itens.reduce(
      (acc, i) => acc + Number(i.produto.preco) * i.quantidade,
      0
    );
  }, [itens]);

  return (
    <div>
      <h1>🛒 Meu Carrinho</h1>

      <div style={{ marginBottom: 12 }}>
        <input
          type="text"
          placeholder="Filtrar por nome do produto"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      {itensFiltrados.length === 0 ? (
        <p>Seu carrinho está vazio.</p>
      ) : (
        <div className="carrinho-lista">
          {itensFiltrados.map((item) => (
            <div key={item._id} className="carrinho-item" style={{ marginBottom: 16 }}>
              <img
                src={item.produto.urlfoto || "https://via.placeholder.com/84"}
                alt={item.produto.nome}
                style={{ width: 84, height: 84, objectFit: "cover", borderRadius: 8 }}
              />
              <div style={{ textAlign: "left", marginLeft: 10 }}>
                <h3>{item.produto.nome}</h3>
                <p>Preço: R$ {Number(item.produto.preco).toFixed(2)}</p>

                <div>
                  <button
                    onClick={() => atualizarQuantidade(item._id, item.quantidade - 1)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={item.quantidade}
                    min={1}
                    onChange={(e) =>
                      atualizarQuantidade(item._id, Number(e.target.value))
                    }
                    style={{ width: 60, margin: "0 8px" }}
                  />
                  <button
                    onClick={() => atualizarQuantidade(item._id, item.quantidade + 1)}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removerItem(item._id)}
                  style={{
                    marginTop: 8,
                    backgroundColor: "#ff4444",
                    color: "white",
                    border: "none",
                    padding: "4px 10px",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2>Total: R$ {total.toFixed(2)}</h2>
    </div>
  );
}

export default Carrinho;
