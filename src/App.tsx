import { useEffect, useState } from 'react'

import './App.css'
import api from './api/api'


type ProdutoType = {
  _id: string
  preco: number,
  nome: string,
  descricao:string, 
  urlfoto :string,
}
function App() {
useEffect(() => {
  
 api.get("/produtos")
.then((response:any)=>setProdutos(response.data))
.catch((error) => {  
  if(error.response){
        console.error(`servidor respondeu mas com erro: ${error.response.mensagem ?? error?.mensagem }`);
        alert(`servidor respondeu mas com erro: ${error.response.data.mensagem?? "olhe o console do navegador para mais detalhes"
        }`)
      }
      else{
        console.error(`erro Axios: ${error?.mensagem}`);
        alert(`servidor não respondeu, vc ligou o backeend? Erro do axios: ${error?.mensagem?? "Erro desconhecido chame o tere"}`)
      }
})

}, [])
}
  const [produtos, setProdutos] = useState<ProdutoType[]>([])

  function handleSubmit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    const formData =  new FormData(event?.currentTarget)
    const nome = formData.get("nome")
    const preco = formData.get("preco")
    const descricao = formData.get("descricao")
    const urlfoto = formData.get("urlfoto")
    const produto = { nome, preco, descricao, urlfoto}
    api.post ("/produtos", produto)
    .then((response:any) => setProdutos([...produtos, response.data]) )
    .catch((error) => {
      if(error.response){
        console.error(`servidor respondeu mas com erro: ${error.response.mensagem ?? error?.mensagem }`);
        alert(`servidor respondeu mas com erro: ${error.response.data.mensagem?? "olhe o console do navegador para mais detalhes"
        }`)
      }
      else{
        console.error(`erro Axios: ${error?.mensagem}`);
        alert(`servidor não respondeu, vc ligou o backeend? Erro do axios: ${error?.mensagem?? "Erro desconhecido chame o tere"}`)
      }
})
 
  }
  function adicionarItemCarrinho(produtoId:string){
    api.post("/carrinho", {produtoId, quantidade:1})

.then(() => alert("produto adicionado corretamentee") )

    .catch((error) => {
      if(error.response){
        console.error(`servidor respondeu mas com erro: ${error.response.mensagem ?? error?.mensagem }`);
        alert(`servidor respondeu mas com erro: ${error.response.data.mensagem?? "olhe o console do navegador para mais detalhes"
        }`)
      }
      else{
        console.error(`erro Axios: ${error?.mensagem}`);
        alert(`servidor não respondeu, vc ligou o backeend? Erro do axios: ${error?.mensagem?? "Erro desconhecido chame o tere"}`)
      }

    })

 
  return (
    <>
    <h1>Cadastro de produtos</h1>
    <form onSubmit={handleSubmit}>
      <input type='text' placeholder='Nome' name= "nome"/>
      <input type='number' placeholder='Preco' name= "preco"/>
      <input type='text' placeholder='Descricao' name= "descricao"/>
      <input type='text' placeholder='Url da foto' name= "urlfoto"/>
    
      <button type='submit'> cadastrar</button>


    </form>
      <h1> Lista de produtos</h1>
      <div className="container">
        {produtos.map((produtos)=>(
          <div key={produtos._id}>
            <h2>{produtos.nome}</h2>
            <p>preco: {produtos.preco}</p>
            <p>descricao: {produtos.descricao}</p>
            <p>urlfoto: {produtos.urlfoto}</p>
            <button onClick={()=>adicionarItemCarrinho(produtos._id)}>Adicionar ao carrinho</button>

            </div>

        ))}
      </div>
    </>
  )
}

export default App
