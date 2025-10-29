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
  const [produtos, setProdutos] = useState<ProdutoType[]>([]);
  const [needLoginPrompt, setNeedLoginPrompt] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    api.get<ProdutoType[]>("/produtos")
      .then((response: any) => setProdutos(response.data))
      .catch((error) => {
        if (error.response) {
          console.error(`Servidor respondeu mas com erro: ${error.response.mensagem ?? error?.mensagem}`);
          alert(`Servidor respondeu mas com erro: ${error.response.data.mensagem ?? "Olhe o console do navegador para mais detalhes"}`);
        } else {
          console.error(`Erro Axios: ${error?.mensagem}`);
          alert(`Servidor não respondeu, vc ligou o backend? Erro do axios: ${error?.mensagem ?? "Erro desconhecido"}`);
        }
      });
  }, []);


  function adicionarItemCarrinho(produtoId: string) {
    const token = localStorage.getItem('token');
    if (!token) {
      setNeedLoginPrompt(true);
      return;
    }
    api.post("/carrinho", { produtoId, quantidade: 1 })
      .then(() => alert("Produto adicionado corretamente"))
      .catch((error) => {
        if (error.response) {
          console.error(`Servidor respondeu mas com erro: ${error.response.mensagem ?? error?.mensagem}`);
          alert(`Servidor respondeu mas com erro: ${error.response.data.mensagem ?? "Olhe o console do navegador para mais detalhes"}`);
        } else {
          console.error(`Erro Axios: ${error?.mensagem}`);
          alert(`Servidor não respondeu, vc ligou o backend? Erro do axios: ${error?.mensagem ?? "Erro desconhecido"}`);
        }
      });
  }

  return (
    <>
      <div className="top-actions">
        {!localStorage.getItem('token') && (
          <Link className="login-button" to="/login">Login</Link>
        )}
        {localStorage.getItem('token') && (
          <>
            <Link style={{ marginLeft: 12 }} className="login-button" to="/carrinho">Meu Carrinho</Link>
            <button
              style={{ marginLeft: 12 }}
              className="login-button"
              onClick={() => {
                localStorage.removeItem('token');
                setNeedLoginPrompt(false);
                navigate('/')
              }}
            >
              Sair
            </button>
          </>
        )}
      </div>
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
      <div className="container">
        {produtos.map((produto) => (
          <div key={produto._id}>
            <h2>{produto.nome}</h2>
            <p>Preço: {produto.preco}</p>
            <p>Descrição: {produto.descricao}</p>
            <p>URL Foto: {produto.urlfoto}</p>
            <button onClick={() => adicionarItemCarrinho(produto._id)}>Adicionar ao carrinho</button>
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
