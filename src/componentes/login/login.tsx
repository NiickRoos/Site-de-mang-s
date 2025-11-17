import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/api";
import "./login.css";

function Login() {
  const [searchParams] = useSearchParams();
  const mensagem = searchParams.get("mensagem");
  const redirect = searchParams.get("redirect");
  const navigate = useNavigate();

  function handleForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    // 🔥 CORREÇÃO IMPORTANTE: converter para string
    const email = String(formData.get("email") || "").trim();
    const senha = String(formData.get("senha") || "");

    if (!email || !senha) {
      alert("Preencha email e senha");
      return;
    }

    api
      .post("/login", { email, senha })
      .then((response: any) => {
        if (response.status === 200) {
          const token = response.data.token;

          localStorage.setItem("token", token);

          // Decodifica o payload do JWT
          const payload = JSON.parse(atob(token.split(".")[1]));
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
      .catch(() => {
        alert("Email ou senha inválidos!");
      });
  }

  return (
    <div className="login-page">
      {mensagem && <div className="login-message">{mensagem}</div>}

      <div className="login-card">
        <form className="login-form" onSubmit={handleForm}>
          <input type="text" name="email" placeholder="Email" />
          <input type="password" name="senha" placeholder="Senha" />
          <input className="login-submit" type="submit" value="Login" />
        </form>
      </div>
    </div>
  );
}

export default Login;
