import { useEffect, useState } from 'react';
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

  useEffect(() => {
    api.get("/produtos")
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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nome = formData.get("nome");
    const preco = formData.get("preco");
    const descricao = formData.get("descricao");
    const urlfoto = formData.get("urlfoto");

    const produto = { nome, preco, descricao, urlfoto };

    api.post("/produtos", produto)
      .then((response: any) => setProdutos([...produtos, response.data]))
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

  function adicionarItemCarrinho(produtoId: string) {
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
      <h1>Cadastro de produtos</h1>
      <form onSubmit={handleSubmit}>
        <input type='text' placeholder='Nome' name="nome" />
        <input type='number' placeholder='Preco' name="preco" />
        <input type='text' placeholder='Descricao' name="descricao" />
        <input type='text' placeholder='Url da foto' name="urlfoto" />
        <button type='submit'>Cadastrar</button>
      </form>

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
