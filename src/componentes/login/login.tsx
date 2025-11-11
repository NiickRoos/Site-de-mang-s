import { useState } from "react";
import {  useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/api";
import "./login.css";

// [A2 – Paulo] Tela de login/registro integrada ao backend (JWT).
// - Envia credenciais para /login (login) ou /register (registro)
// - Armazena o token no localStorage
// - Decodifica o JWT para ler a role (admin|user) e redirecionar
// Observação: o backend deve assinar o JWT contendo o campo `role`.
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
            // [A2 – Paulo] Fluxo de registro: valida campos mínimos e faz POST para criar conta
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
        // [A2 – Paulo] Fluxo de login: envia credenciais e armazena o token
        api.post("/login", {email, senha})
        .then((response:any)=>{
            if (response.status === 200) {
        const token = response?.data?.token; // JWT retornado pelo backend
        localStorage.setItem('token', token); // persiste sessão

        // [A1 – Nicole] Decodifica o JWT para extrair a role (autorização)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.role;

        // Redirecionamento: volta para rota protegida, ou envia admin ao /adm
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
      <div className="login-page">
        {/* [A6 – Guilherme] Mensagem amigável recebida por querystring (UX de feedback) */}
        {mensagem && <div className="login-message">{mensagem}</div>}
        <div className="login-card">
          {/* [A2 – Paulo] Formulário de login/registro controlado por isRegister */}
          <form className="login-form" onSubmit={handleForm}>
            {isRegister && (
              <>
                <input type="text" name="nome" placeholder="Nome" />
                <input type="number" name="idade" placeholder="Idade" min={1} />
              </>
            )}
            <input type="text" name="email" placeholder="Email" />
            <input type="password" name="senha" placeholder="Senha" />
            <input className="login-submit" type="submit" value={isRegister ? "Criar conta" : "Login" } />
          </form>
          <div className="login-actions">
            {/* Alterna entre login e registro */}
            <button className="login-toggle" onClick={() => setIsRegister(prev => !prev)}>
              {isRegister ? "Já tem conta? Fazer login" : "Não tem conta? Criar conta"}
            </button>
          </div>
        </div>
      </div>
    )
}
export default Login;