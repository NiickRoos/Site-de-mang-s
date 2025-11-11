import React, { useEffect, useState } from "react"; // [c1 – Paulo] Import React e hooks
import { useLocation, useNavigate } from "react-router-dom"; // [c1 – Paulo] Import hooks de navegação
import api from "../api/api"; // [c1 – Paulo] Import API client
import "./Adm.css"; // [c1 – Paulo] Import CSS separado para admin

interface Produto { // [c1 – Paulo] Definição da interface Produto
  _id: string;
  nome: string;
  preco: number;
  descricao: string;
  urlfoto: string;
}

// niccole c2: Tipos auxiliares para métricas de carrinhos (admin)
interface CarrinhoItemAdmin { // [c2 – Nicole] Definição da interface CarrinhoItemAdmin
  produtoId: string;
  nome?: string;
  precoUnitario?: number | string;
  quantidade: number;
}
interface CarrinhoAdmin {
  _id: string;
  usuarioId?: string;
  itens: CarrinhoItemAdmin[];
  atualizadoEm?: string;
}
interface MetricsDirectResponse {
  activeUsers: number;
  totalValue: number;
  ranking: { produtoId: string; nome?: string; count: number }[];
}

// [c1 – Paulo] Página protegida para administradores (role=admin)
function Adm() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [form, setForm] = useState({ nome: "", preco: "", descricao: "", urlfoto: "" });
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [role, setRole] = useState<string>("user"); // padrão user
  // niccole c2: estados para o dashboard admin
  const [activeUsersCount, setActiveUsersCount] = useState<number>(0);
  const [totalCartValue, setTotalCartValue] = useState<number>(0);
  const [rankingItens, setRankingItens] = useState<{ produtoId: string; nome?: string; count: number }[]>([]);
  const [metricsLoading, setMetricsLoading] = useState<boolean>(false);
  const [metricsError, setMetricsError] = useState<string>("");
  // [c5 – Amanda] Estado para diálogo de confirmação de exclusão (add-only)
  const [produtoParaDeletar, setProdutoParaDeletar] = useState<Produto | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      const mensagem = encodeURIComponent("Faça login como admin para acessar o painel.");
      const redirect = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?mensagem=${mensagem}&redirect=${redirect}`, { replace: true });
      return;
    }

    // [c1 – Paulo] Decodifica JWT e restringe acesso a role=admin
    const payload = JSON.parse(atob(token.split(".")[1]));
    setRole(payload.role);
    if (payload.role !== "admin") {
      const mensagem = encodeURIComponent("Acesso restrito a administradores.");
      navigate(`/?mensagem=${mensagem}`, { replace: true });
      return;
    }

    // Carregar produtos
    api.get<Produto[]>("/produtos")
      .then(res => setProdutos(res.data.map((p: any) => ({ ...p, preco: Number(p.preco) })) ))
      .catch(err => console.log(err));

    // [c2 – Nicole] Após validar ADMIN, carregar métricas do dashboard
    carregarMetricasAdmin();
  }, []);

  // [c2 – Nicole] Atualização automática das métricas (polling + foco/visibilidade da aba)
  useEffect(() => {
    // Atualiza quando a aba volta ao foco
    function onFocus() {
      if (!metricsLoading) carregarMetricasAdmin();
    }
    window.addEventListener("focus", onFocus);

    // Atualiza quando a aba fica visível novamente
    function onVisibility() {
      if (document.visibilityState === "visible" && !metricsLoading) {
        carregarMetricasAdmin();
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    // Polling a cada 10s
    const id = setInterval(() => {
      if (!metricsLoading) carregarMetricasAdmin();
    }, 10000);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(id);
    };
  }, [metricsLoading]);

  // Funções de admin (formulário de produtos)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdicionar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // [c3 – Guilherme] Criar produto (POST /produtos)
    api.post<Produto>("/produtos", {
      nome: form.nome,
      preco: parseFloat(form.preco),
      descricao: form.descricao,
      urlfoto: form.urlfoto
    })
    .then(res => {
      const novo = { ...res.data, preco: Number((res.data as any).preco) } as Produto;
      setProdutos([...produtos, novo]);
      setForm({ nome: "", preco: "", descricao: "", urlfoto: "" });
    })
    .catch(err => alert(err?.response?.data?.mensagem || "Erro ao adicionar produto"));
  };

  const handleSalvar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editandoId) return;
    // [c4 – Guilherme] Editar produto (PUT /produtos/:id)
    api.put<Produto>(`/produtos/${editandoId}`, {
      nome: form.nome,
      preco: parseFloat(form.preco),
      descricao: form.descricao,
      urlfoto: form.urlfoto
    })
      .then(res => {
        const atualizado = { ...res.data, preco: Number((res.data as any).preco) } as Produto;
        setProdutos(produtos.map(p => (p._id === editandoId ? atualizado : p)));
        setForm({ nome: "", preco: "", descricao: "", urlfoto: "" });
        setEditandoId(null);
      })
      .catch(err => alert(err?.response?.data?.mensagem || "Erro ao salvar produto"));
  };

  const iniciarEdicao = (p: Produto) => {
    setEditandoId(p._id);
    setForm({ nome: p.nome, preco: String(p.preco), descricao: p.descricao, urlfoto: p.urlfoto });
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setForm({ nome: "", preco: "", descricao: "", urlfoto: "" });
  };

  // [c5 – Amanda] Excluir produto com confirmação: o botão único chama este handler para abrir o diálogo
  const handleExcluir = (id: string) => {
    const produto = produtos.find(p => p._id === id) || null;
    setProdutoParaDeletar(produto);
  };

  // [c5 – Amanda] (add-only) Confirmar exclusão via diálogo
  const confirmarExclusao = () => {
    if (!produtoParaDeletar) return;
    api.delete(`/produtos/${produtoParaDeletar._id}`)
      .then(() => {
        setProdutos(produtos.filter(p => p._id !== produtoParaDeletar._id));
        setProdutoParaDeletar(null);
      })
      .catch(err => alert(err?.response?.data?.mensagem || "Erro ao excluir produto"));
  };

  // [c5 – Amanda] Cancelar diálogo
  const cancelarExclusaoDialog = () => setProdutoParaDeletar(null);

  // [c2 – Nicole] utilitário para tentar múltiplos endpoints até encontrar dados de carrinhos
  async function tryGet<T = any>(paths: string[]): Promise<T | null> {
    for (const p of paths) {
      try {
        const r = await api.get<T>(p);
        if (r && r.data) return r.data as any;
      } catch (_) { /* tenta próxima rota */ }
    }
    return null;
  }

  // [c2 – Nicole] calcular métricas a partir da lista de carrinhos
  function calcularMetricas(carrinhos: CarrinhoAdmin[]) {
    // usuários com carrinhos "ativos": consideramos carrinhos com pelo menos 1 item
    const usuariosAtivos = new Set<string>();
    let somaTotal = 0;
    const freq = new Map<string, { produtoId: string; nome?: string; count: number }>();

    for (const c of carrinhos) {
      if (Array.isArray(c.itens) && c.itens.length > 0) {
        if (c.usuarioId) usuariosAtivos.add(c.usuarioId);
        for (const it of c.itens) {
          const preco = Number(it.precoUnitario ?? 0);
          const qtd = Number(it.quantidade ?? 0);
          somaTotal += preco * qtd;
          const key = it.produtoId;
          if (!key) continue;
          const prev = freq.get(key) || { produtoId: key, nome: it.nome, count: 0 };
          prev.count += qtd || 1;
          if (!prev.nome && it.nome) prev.nome = it.nome;
          freq.set(key, prev);
        }
      }
    }

    const ranking = Array.from(freq.values()).sort((a, b) => b.count - a.count).slice(0, 10);
    setActiveUsersCount(usuariosAtivos.size);
    setTotalCartValue(somaTotal);
    setRankingItens(ranking);
  }

  // [c2 – Nicole] carregar métricas do backend (tenta endpoint direto; senão, lista todos e calcula no front)
  async function carregarMetricasAdmin() {
    try {
      setMetricsLoading(true);
      setMetricsError("");

      // 1) Tentar endpoint direto de métricas
      const direct = await tryGet<MetricsDirectResponse>([
        "/admin/carrinhos/metrics",
        "/carrinhos/metrics",
        "/carrinho/metrics"
      ]);
      if (direct && typeof direct === "object") {
        if (typeof (direct as any).activeUsers === "number") setActiveUsersCount((direct as any).activeUsers);
        if (typeof (direct as any).totalValue === "number") setTotalCartValue((direct as any).totalValue);
        if (Array.isArray((direct as any).ranking)) setRankingItens((direct as any).ranking);
        return;
      }

      // 2) Senão, tentar obter todos os carrinhos e calcular no front
      const todos = await tryGet<CarrinhoAdmin[]>([
        "/admin/carrinhos",
        "/carrinhos",
        "/carrinho/todos"
      ]);
      if (Array.isArray(todos)) {
        calcularMetricas(todos);
        return;
      }

      setMetricsError("Não foi possível obter métricas de carrinhos (verifique a API para endpoints de admin).");
    } catch (e: any) {
      setMetricsError(e?.message || "Erro ao carregar métricas");
    } finally {
      setMetricsLoading(false);
    }
  }

  return (
    <div className={`adm-container ${role}`}>
      {/* [c7 – Paulo] Cabeçalho/branding e navegação do painel admin */}
      <header className="site-header" aria-label="Cabeçalho do site">
        <div className="brand">
          <div className="logo" />
          <span>MangáVerse Admin</span>
        </div>
        <nav>
          <button onClick={() => navigate("/")}>Início</button>
          <button onClick={() => navigate("/produtos")}>Mangás</button>
          <button onClick={() => navigate("/carrinho")}>Carrinho</button>
          <button onClick={() => navigate("/perfil")}>Perfil</button>
        </nav>
      </header>

      {/* [c7 – Paulo] Seção "hero" de boas-vindas/atalhos no painel */}
      <section className="hero-cover" aria-label="Capa de entrada">
        <div className="hero-inner">
          <div>
            <h2 className="hero-title">Painel do Administrador</h2>
            <p className="hero-sub">Gerencie mangás e visualize métricas do sistema — niccole c2</p>
            <div className="hero-cta">
              <button
                className="btn-primary"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >Ver métricas</button>
              <button
                className="btn-secondary"
                onClick={() => document.querySelector(".produtos-list")?.scrollIntoView({ behavior: "smooth" })}
              >Ir aos produtos</button>
            </div>
          </div>
          <div />
        </div>
      </section>


    <h1>Painel de Produtos</h1>

    {role === "admin" && (
      <section className="adm-dashboard" aria-label="Dashboard Administrativo">
        {/* [c2 – Nicole] Seção de métricas do admin */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <h2>Dashboard Administrativo </h2>
          <button onClick={() => carregarMetricasAdmin()} disabled={metricsLoading} className="btn-secondary">
            {metricsLoading ? "Atualizando..." : "Atualizar"}
          </button>
        </div>
        <p>
          Esta seção mostra: quantidade de usuários com carrinhos ativos, a soma total dos valores de todos os carrinhos
          e um ranking dos itens mais frequentes nos carrinhos.
        </p>

        {metricsLoading && <p>Carregando métricas...</p>}
        {metricsError && <p style={{ color: "red" }}>{metricsError}</p>}
          {metricsError && <p style={{ color: "red" }}>{metricsError}</p>}

          {!metricsLoading && !metricsError && (
            <div className="cards-metricas">
              <div className="card-metrica" aria-label="Usuários com carrinhos ativos">
                <strong>Usuários com carrinhos ativos</strong> {/* nicole c2 */}
                <div>{activeUsersCount}</div>
              </div>
              <div className="card-metrica" aria-label="Soma de todos os carrinhos">
                <strong>Total dos carrinhos</strong> {/* nicole c2 */}
                <div>R$ {totalCartValue.toFixed(2)}</div>
              </div>
              <div className="card-metrica" aria-label="Ranking de itens mais presentes nos carrinhos">
                <strong>Top itens nos carrinhos</strong> {/* nicole c2 */}
                {rankingItens.length === 0 ? (
                  <div>Nenhum item encontrado</div>
                ) : (
                  <ol>
                    {rankingItens.map((r) => (
                      <li key={r.produtoId}>
                        {(r.nome || "Item")} — {r.count}x
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* [c3 – Guilherme | c4 – Guilherme] Formulário de criação/edição de produtos (somente admin) */}
      {role === "admin" && (
        <form className="adm-form" onSubmit={editandoId ? handleSalvar : handleAdicionar}>
          <input type="text" name="nome" placeholder="Nome" value={form.nome} onChange={handleChange} required />
          <input type="text" name="preco" placeholder="Preço" value={form.preco} onChange={handleChange} required />
          <textarea name="descricao" placeholder="Descrição" value={form.descricao} onChange={handleChange} required />
          <input type="text" name="urlfoto" placeholder="URL da foto" value={form.urlfoto} onChange={handleChange} required />
          <button type="submit">{editandoId ? "Salvar alterações" : "Adicionar Produto"}</button>
          {editandoId && (
            <button type="button" onClick={cancelarEdicao} style={{ marginLeft: 8 }}>Cancelar</button>
          )}
        </form>
      )}

      {/* [c5 – Amanda] (add-only) Dialog de confirmação de exclusão */}
      {produtoParaDeletar && (
        <div className="confirmation-dialog" role="dialog" aria-modal="true" aria-labelledby="confirmarTitulo">
          <div className="dialog-content">
            <h3 id="confirmarTitulo">Confirmar Exclusão</h3>
            <p>Tem certeza que deseja excluir o produto "{produtoParaDeletar.nome}"?</p>
            <div className="dialog-actions">
              <button onClick={confirmarExclusao}>Confirmar</button>
              <button onClick={cancelarExclusaoDialog}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* [c5 – Amanda | c6 – Amanda] Listagem de produtos e ação de exclusão */}
      <div className="produtos-list">
        {produtos.map(prod => (
          <div key={prod._id} className="produto-card">
            <img src={prod.urlfoto} alt={prod.nome} />
            <h3>{prod.nome}</h3>
            <p>{prod.descricao}</p>
            <p>R$ {prod.preco.toFixed(2)}</p>

            {/* Botões de edição/exclusão só para admin */}
            {role === "admin" && (
              <div className="adm-actions">
                <button onClick={() => iniciarEdicao(prod)}>Editar</button>
                <button onClick={() => handleExcluir(prod._id)}>Excluir</button>
              </div>
            )}
          </div>
        ))}
      </div>
      <footer className="site-footer" aria-label="Rodapé">
        <p>© 2025 MangáVerse — Todos os direitos reservados.</p>
      </footer>
    </div>
  );

  
}

export default Adm;
