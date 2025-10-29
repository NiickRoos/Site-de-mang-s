import { useState } from "react";
import {  useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/api";

function Login(){
    const [searchParams] = useSearchParams()
    const mensagem = searchParams.get("mensagem")
    const redirect = searchParams.get("redirect")
    const [isRegister, setIsRegister] = useState(false)
    const navigate = useNavigate();
    const REGISTER_ENDPOINT = "/register"; // ajuste se seu backend usa outra rota, ex: "/usuarios" ou "/cadastro"
    function handleForm(event:React.FormEvent<HTMLFormElement>){
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = formData.get("email");
        const senha = formData.get("senha");
        if (isRegister) {
            const nome = formData.get("nome");
            const idadeRaw = formData.get("idade");
            const idade = Number(idadeRaw);
            if (!nome || !email || !senha || !idade || Number.isNaN(idade) || idade <= 0) {
                alert("Preencha nome, idade válida, email e senha.");
                return;
            }
            api.post(REGISTER_ENDPOINT, { nome, idade, email, senha }, { headers: { 'X-Skip-Auth': 'true' } })
            .then(()=>{
                const msg = encodeURIComponent("Conta criada com sucesso. Faça login.")
                const r = redirect ? `&redirect=${encodeURIComponent(redirect)}` : "";
                navigate(`/login?mensagem=${msg}${r}`, { replace: true })
            })
            .catch((error)=>{
                alert(error?.response?.data?.mensagem || "Erro ao criar conta")
            })
            return;
        }
        api.post("/login", {email, senha})
        .then((response:any)=>{
            if (response.status === 200) {
        const token = response?.data?.token;
        localStorage.setItem('token', token);

        // Decodificar token para ver role
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.role;

        if (redirect) {
            navigate(redirect, { replace: true });
        } else if (role === "admin") {
            navigate("/adm");
        } else {
            navigate("/");
        }
    }
})
    }
    return(
        <>
        {mensagem&&<p>{mensagem}</p>}
            <form onSubmit={handleForm}>
                {isRegister && (
                    <>
                        <input type="text" name="nome" placeholder="Nome" />
                        <input type="number" name="idade" placeholder="Idade" min={1} />
                    </>
                )}
                <input type="text" name="email" placeholder="Email" />
                <input type="password" name="senha" placeholder="Senha" />
                <input type="submit" value={isRegister ? "Criar conta" : "Login"} />
            </form>
            <button onClick={() => setIsRegister(prev => !prev)} style={{ marginTop: 8 }}>
                {isRegister ? "Já tem conta? Fazer login" : "Não tem conta? Criar conta"}
            </button>
        
        </>
    )
}
export default Login;