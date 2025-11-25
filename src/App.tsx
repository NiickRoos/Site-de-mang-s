import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import api from './api/api';

type ProdutoType = {
  _id: string;
  preco: number;
  nome: string;
  descricao: string;
  urlfoto: string;
};

function App() {
  // [A1 – Amanda] Estado para armazenar produtos e flag de login
  const [produtos, setProdutos] = useState<ProdutoType[]>([]);
  const [needLoginPrompt, setNeedLoginPrompt] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('token'));
  const navigate = useNavigate();
  const location = useLocation();

<<<<<<< HEAD
  // 🔹 Atualiza authToken quando o login/logout for feito em outro componente
  useEffect(() => {
    const handler = () => setAuthToken(localStorage.getItem('token'));
    window.addEventListener('auth-changed', handler as EventListener);
    return () => window.removeEventListener('auth-changed', handler as EventListener);
  }, []);

  // 🔹 Carrega produtos ao abrir a página
=======
  // [A3 – Amanda] Carrega lista de produtos da API
  // Consome GET /produtos e popula o estado para renderizar os cards
>>>>>>> 02c33b8621c79c1ebf122af7f37b507300d5a1ea
  useEffect(() => {
    api.get<ProdutoType[]>("/produtos")
      .then((response) => setProdutos(response.data))
      .catch((error) => {
        // [A6 – Guilherme] Mensagens amigáveis de erro de produto/backend
        if (error.response) {
          console.error(`Erro do servidor: ${error.response.data?.mensagem ?? error.message}`);
          alert(`Servidor respondeu mas com erro: ${error.response.data?.mensagem ?? "Veja o console para mais detalhes"}`);
        } else {
          console.error(`Erro Axios: ${error.message}`);
          alert(`Servidor não respondeu. O backend está ligado? Erro: ${error.message}`);
        }
      });
  }, []);

  // [Carrinho/Add Item] Envia item ao carrinho
  // Verifica login; se não estiver logado, dispara banner para login
  function adicionarItemCarrinho(produtoId: string) {
    const token = localStorage.getItem('token');
    if (!token) {
      // [A6 – Guilherme] UX: banner convidando a logar antes de adicionar ao carrinho
      setNeedLoginPrompt(true);
      return;
    }

    // Encontra o produto pelo ID
    const produto = produtos.find((p) => p._id === produtoId);
    if (!produto) {
      alert("Produto não encontrado!");
      return;
    }

    // Envia todos os dados exigidos pelo backend
    api.post("/carrinho",
      {
        produtoId,
        quantidade: 1,
        precoUnitario: produto.preco,
        nome: produto.nome,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
      .then(() => alert("Produto adicionado corretamente!"))
      .catch((error) => {
        // [A6 – Guilherme] Tratamento de erro de adição ao carrinho
        if (error.response) {
          console.error(`Erro do servidor: ${error.response.data?.message ?? error.message}`);
          alert(`Erro: ${error.response.data?.message ?? "Veja o console para mais detalhes"}`);
        } else {
          console.error(`Erro Axios: ${error.message}`);
          alert(`Servidor não respondeu. O backend está ligado? Erro: ${error.message}`);
        }
      });
  }

  // 🔹 Logout do usuário
  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    setAuthToken(null);
    setNeedLoginPrompt(false);

    try {
      window.dispatchEvent(new CustomEvent('auth-changed'));
    } catch {}

    navigate('/');
  }

  return (
    <>
      <div className="top-actions">
<<<<<<< HEAD
        {!authToken && (
          <Link className="login-button" to="/login">Login</Link>
        )}

        {authToken && (
          <>
            <Link
              style={{ marginLeft: 12 }}
              className="login-button"
              to="/carrinho"
            >
              Meu Carrinho
            </Link>
            <button
              style={{ marginLeft: 12 }}
              className="login-button"
              onClick={handleLogout}
=======
        {/* [A2 – Paulo] Botão de Login quando não autenticado */}
        {!localStorage.getItem('token') && (
          <Link className="login-button" to="/login">Login</Link>
        )}
        {/* [A2 – Paulo] Quando logado: links de carrinho e sair
            [A5 – Guilherme] (pendente) Local para exibir nome/role do usuário no topo */}
        {localStorage.getItem('token') && (
          <>
            {(() => {
              try {
                const t = localStorage.getItem('token');
                if (!t) return null;
                const payload = JSON.parse(atob(t.split('.')[1]));
                if (payload?.role === 'admin') {
                  return (
                    <button
                      style={{ marginRight: 12 }}
                      className="login-button"
                      onClick={() => navigate('/adm')}
                    >
                      Painel Admin
                    </button>
                  );
                }
              } catch {}
              return null;
            })()}
            <Link style={{ marginLeft: 12 }} className="login-button" to="/carrinho">Meu Carrinho</Link>
            <button
              style={{ marginLeft: 12 }}
              className="login-button"
              onClick={() => {
                localStorage.removeItem('token'); // logout simples no front
                setNeedLoginPrompt(false);
                navigate('/');
              }}
>>>>>>> 02c33b8621c79c1ebf122af7f37b507300d5a1ea
            >
              Sair
            </button>
          </>
        )}
      </div>

      {/* [A6 – Guilherme] Banner amigável convidando ao login */}
      {needLoginPrompt && (
        <div className="login-required-banner">
          <p>Você precisa estar logado para adicionar itens ao carrinho.</p>
          <button
            onClick={() => {
              const redirect = encodeURIComponent(location.pathname + location.search);
              const mensagem = encodeURIComponent('Faça login para continuar.');
              navigate(`/login?mensagem=${mensagem}&redirect=${redirect}`);
            }}
          >
            Fazer login
          </button>
        </div>
      )}

      <h1>Lista de produtos</h1>
      {/* [A4 – Guilherme] (pendente) Campo de busca por nome/categoria poderia ser adicionado aqui */}
      <div className="container">
        {produtos.map((produto) => (
          <div key={produto._id} className="produto-card">
            <h2>{produto.nome}</h2>
            <p>Preço: R$ {produto.preco}</p>
            <p>{produto.descricao}</p>
            <img src={produto.urlfoto} alt={produto.nome} width="150" height="150" />
            <button onClick={() => adicionarItemCarrinho(produto._id)}>
              Adicionar ao carrinho
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
