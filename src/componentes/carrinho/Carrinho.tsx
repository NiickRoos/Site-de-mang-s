import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/api";
import "./Carrinho.css";

interface CarrinhoItem {
  itemId: string;
  produtoId: string;
  nome: string;
  descricao: string;
  urlfoto: string;
  precoUnitario: number;
  quantidade: number;
}

interface CarrinhoResponse {
  _id: string | null;
  itens: Array<{
    produtoId: string;
    nome: string;
    precoUnitario: number;
    quantidade: number;
    descricao: string;
    urlfoto: string;
  }>;
}

function Carrinho() {
  const [carrinhoId, setCarrinhoId] = useState<string>("");
  const [itens, setItens] = useState<CarrinhoItem[]>([]);
  const [filtro, setFiltro] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // ===============================
  // CARREGAR CARRINHO
  // ===============================
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      const msg = encodeURIComponent("Faça login para acessar seu carrinho.");
      const redirect = encodeURIComponent(location.pathname);
      navigate(`/login?mensagem=${msg}&redirect=${redirect}`, { replace: true });
      return;
    }

    api
      .get<CarrinhoResponse>("/carrinho", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (!res.data._id) {
          setItens([]);
          return;
        }

        setCarrinhoId(res.data._id);

        const normalizados = res.data.itens.map((i) => ({
          itemId: i.produtoId, // backend usa produtoId como identificador
          produtoId: i.produtoId,
          nome: i.nome,
          descricao: i.descricao,
          urlfoto: i.urlfoto,
          precoUnitario: Number(i.precoUnitario),
          quantidade: Number(i.quantidade),
        }));

        setItens(normalizados);
      })
      .catch((error) => {
        console.error(error);
        alert(error?.response?.data?.mensagem || "Erro ao carregar carrinho");
      });
  }, [navigate, location]);

  // ===============================
  // FILTRO
  // ===============================
  const itensFiltrados = useMemo(() => {
    const f = filtro.toLowerCase();
    if (!f) return itens;
    return itens.filter((i) => i.nome.toLowerCase().includes(f));
  }, [filtro, itens]);

  // ===============================
  // ATUALIZAR QUANTIDADE
  // ===============================
  function atualizarQuantidade(itemId: string, novaQtd: number) {
    if (novaQtd <= 0) return;
    if (!carrinhoId) return alert("Carrinho não encontrado");

    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const item = itens.find((i) => i.itemId === itemId);
    if (!item) return;

    const quantidadeAnterior = item.quantidade;

    // Atualiza visualmente
    setItens((prev) =>
      prev.map((i) => (i.itemId === itemId ? { ...i, quantidade: novaQtd } : i))
    );

    api
      .put(
        `/carrinho/${carrinhoId}`,
        { produtoId: item.produtoId, quantidade: novaQtd },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .catch((error) => {
        console.error("Erro ao atualizar:", error);

        // desfaz
        setItens((prev) =>
          prev.map((i) =>
            i.itemId === itemId ? { ...i, quantidade: quantidadeAnterior } : i
          )
        );

        alert(error?.response?.data?.message || "Erro ao atualizar quantidade");
      });
  }

  // ===============================
  // REMOVER ITEM
  // ===============================
  function removerItem(itemId: string) {
    if (!carrinhoId) return alert("Carrinho não encontrado");

    const token = localStorage.getItem("token");

    api
      .delete(`/carrinho/${carrinhoId}/item/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() =>
        setItens((prev) => prev.filter((i) => i.itemId !== itemId))
      )
      .catch((error) => {
        console.error("Erro ao remover item:", error);
        alert(error?.response?.data?.message || "Erro ao remover item");
      });
  }

  // ===============================
  // TOTAL
  // ===============================
  const total = useMemo(
    () => itens.reduce((acc, i) => acc + i.precoUnitario * i.quantidade, 0),
    [itens]
  );

  // ===============================
  // FINALIZAR COMPRA (VIA STRIPE)
  // ===============================
  function irParaPagamento() {
    if (!carrinhoId) return alert("Carrinho inválido");
    if (itens.length === 0) return alert("Carrinho vazio");

    navigate("/finalizar-compra", {
      state: {
        carrinhoId,
        total, 
      },
    });
  }
  
  // ===============================
  // RENDER
  // ===============================
  return (
    <div className="carrinho-page">
      <header className="header">
        <h1 className="logo">MangáVerse</h1>
        <nav className="menu">
          <button onClick={() => navigate("/")} className="menu-btn">
            Início
          </button>
        </nav>
      </header>

      <main className="carrinho-container">
        <h2 className="titulo">Meu Carrinho</h2>

        <div className="filtro-container">
          <input
            type="text"
            placeholder="Filtrar por nome do produto"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
          <button className="voltar-btn" onClick={() => navigate(-1)}>
            ⬅ Voltar
          </button>
        </div>

        {itensFiltrados.length === 0 ? (
          <p className="vazio">Seu carrinho está vazio.</p>
        ) : (
          <div className="lista-itens">
            {itensFiltrados.map((item) => (
              <div key={item.itemId} className="card-item">
                <img src={item.urlfoto || "/fallback-avatar.svg"} alt={item.nome} />
                <div className="info-item">
                  <h3>{item.nome}</h3>
                  <p>Preço: R$ {item.precoUnitario.toFixed(2)}</p>

                  <div className="quantidade">
                    <button
                      onClick={() =>
                        atualizarQuantidade(item.itemId, item.quantidade - 1)
                      }
                    >
                      -
                    </button>

                    <input
                      type="number"
                      value={item.quantidade}
                      min={1}
                      onChange={(e) =>
                        atualizarQuantidade(item.itemId, Number(e.target.value))
                      }
                    />

                    <button
                      onClick={() =>
                        atualizarQuantidade(item.itemId, item.quantidade + 1)
                      }
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="remover-btn"
                    onClick={() => removerItem(item.itemId)}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 className="total">Total: R$ {total.toFixed(2)}</h2>

        {itensFiltrados.length > 0 && (
          <button className="finalizar-compra-btn" onClick={irParaPagamento}>
            Pagar com cartão 💳
          </button>
        )}
      </main>

      <footer className="footer">
        <p>© 2025 MangáVerse — Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

export default Carrinho;
