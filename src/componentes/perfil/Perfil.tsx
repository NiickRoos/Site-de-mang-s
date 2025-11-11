import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/api";
import "./Perfil.css";

interface Usuario {
  _id?: string;
  nome?: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
}

function Perfil() {
  const [usuario, setUsuario] = useState<Usuario>({});
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();

  // Função reutilizável para carregar o perfil do usuário (tenta múltiplas rotas conhecidas)
  function normalizeAvatarUrl(u?: string): string {
    if (!u) return "";
    if (/^https?:\/\//i.test(u)) return u;
    const base = (import.meta as any)?.env?.VITE_API_URL || "";
    const b = String(base || "").replace(/\/$/, "");
    const p = String(u).startsWith("/") ? u : "/" + u;
    return b + p;
  }

  async function carregarPerfil() {
    setLoading(true);
    setError("");
    try {
      const candidatos = ["/me", "/usuario/me", "/usuarios/me", "/user/me", "/auth/me"];
      for (const p of candidatos) {
        try {
          const r = await api.get<Usuario>(p);
          if (r?.data) {
            setUsuario(r.data);
            const abs = normalizeAvatarUrl(r.data.avatarUrl);
            setAvatarPreview(abs ? `${abs}?t=${Date.now()}` : "");
            return;
          }
        } catch (_) { /* tenta próximo */ }
      }
      setError("Não foi possível carregar os dados do perfil. Verifique os endpoints do backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      const mensagem = encodeURIComponent("Faça login para acessar seu perfil.");
      const redirect = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?mensagem=${mensagem}&redirect=${redirect}`, { replace: true });
      return;
    }
    carregarPerfil();
  }, [navigate, location]);

  function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  }

  async function enviarAvatar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = (e.currentTarget.elements.namedItem("avatar") as HTMLInputElement) || null;
    const file = input?.files?.[0];
    if (!file) {
      alert("Selecione um arquivo de imagem primeiro.");
      return;
    }
    const fd = new FormData();
    fd.append("avatar", file);
    const rotas = ["/perfil/avatar", "/usuarios/avatar", "/user/avatar", "/me/avatar"];
    for (const r of rotas) {
      try {
        const resp = await api.post(r, fd); // deixar Axios definir o Content-Type com boundary automaticamente
        // Tenta usar avatarUrl retornado pela API imediatamente; se não houver, mantém preview local
        const serverUrl = (resp as any)?.data?.avatarUrl;
        if (serverUrl) {
          const abs = normalizeAvatarUrl(serverUrl);
          setAvatarPreview(abs ? `${abs}?t=${Date.now()}` : avatarPreview);
        }
        // Recarrega o perfil para capturar o avatarUrl atualizado no servidor
        await carregarPerfil();
        alert("Avatar enviado com sucesso (se a rota existir no backend).");
        return;
      } catch (_) { /* tenta próxima */ }
    }
    alert("Não foi possível enviar o avatar. Configure a rota no backend e atualize aqui.");
  }

  const nomeExibicao = usuario.nome || usuario.name || "Usuário";

  return (
    <div className="perfil-page">
      <header className="perfil-header">
        <div className="brand">
          <div className="logo" />
          <h1>Meu Perfil</h1>
        </div>
        <nav>
          <button onClick={() => navigate("/")}>Início</button>
          <button onClick={() => navigate("/carrinho")}>Carrinho</button>
          <button onClick={() => navigate("/adm")}>Admin</button>
        </nav>
      </header>

      <section className="perfil-card">
        {loading ? (
          <p>Carregando...</p>
        ) : error ? (
          <p style={{ color: "#ff6b8a" }}>{error}</p>
        ) : (
          <>
            <div className="perfil-info">
              <div className="avatar">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" />
                ) : (
                  <div className="avatar-placeholder">Sem foto</div>
                )}
              </div>
              <div className="dados">
                <h2>{nomeExibicao}</h2>
                <p>{usuario.email}</p>
              </div>
            </div>

            <form className="avatar-form" onSubmit={enviarAvatar}>
              <label className="file-input">
                <input type="file" name="avatar" accept="image/*" onChange={onAvatarChange} />
                Escolher imagem
              </label>
              <button type="submit">Enviar avatar</button>
            </form>
          </>
        )}
      </section>

      <footer className="perfil-footer">
        <p>© 2025 MangáVerse — Perfil</p>
      </footer>
    </div>
  );
}

export default Perfil;
