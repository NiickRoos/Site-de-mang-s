import { useEffect, useState } from 'react'

import './App.css'


type EstudanteType = {
  _id: string,
  nome: string,
  idade:number,
}
function App() {
useEffect(() => {
  fetch("/api/estudantes")
  .then((response) => response.json())
  .then((dados)=>setEstudantes(dados))
}, [])
  const [estudantes, setEstudantes] = useState<EstudanteType[]>([])
 return (
    <>
      <h1> Lista de estudantes</h1>
      <div className="container">
        {estudantes.map((estudante)=>(
          <div key={estudante._id}>
            <h2>{estudante.nome}</h2>
            <p>Idade: {estudante.idade}</p>
            </div>

        ))}
      </div>
    </>
  )
}

export default App
