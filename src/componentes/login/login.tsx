import { } from "react";
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
    const navigate = useNavigate();
    function handleForm(event:React.FormEvent<HTMLFormElement>){
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const email = formData.get("email");
        const senha = formData.get("senha");
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
            <input type="text" name="email" placeholder="Email" />
            <input type="password" name="senha" placeholder="Senha" />
            <input className="login-submit" type="submit" value={"Login"} />
          </form>
        </div>
      </div>
    )
}
export default Login;