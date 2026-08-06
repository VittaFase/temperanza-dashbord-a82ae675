export type VoiceCommand =
  | { tipo: "navegar"; rota: string; label: string }
  | { tipo: "buscar"; rota: string; termo: string; label: string }
  | { tipo: "desconhecido"; texto: string };

export const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const ROTAS: { rota: string; label: string; termos: string[] }[] = [
  { rota: "/", label: "Resumo", termos: ["resumo", "dashboard", "inicio", "painel"] },
  { rota: "/produtos", label: "Produtos", termos: ["produtos", "produto", "condimentos", "temperos"] },
  { rota: "/blends", label: "Blends", termos: ["blends", "blend", "kits", "kit"] },
  { rota: "/pedidos", label: "Pedidos", termos: ["pedidos", "pedido", "vendas", "historico de pedidos"] },
  { rota: "/relatorios", label: "Relatórios", termos: ["relatorios", "relatorio"] },
  { rota: "/configuracoes", label: "Configurações", termos: ["configuracoes", "configuracao", "ajustes"] },
  { rota: "/simulacao", label: "Simulação", termos: ["simulacao", "simular", "simulador"] },
  { rota: "/estudo-markup", label: "Estudo de Markup", termos: ["estudo de markup", "markup", "estudo"] },
];

const PREFIXOS_BUSCA_CLIENTE = [
  "procurar cliente",
  "buscar cliente",
  "busca cliente",
  "cliente",
  "pesquisar cliente",
];

const PREFIXOS_BUSCA_PRODUTO = [
  "procurar produto",
  "buscar produto",
  "busca produto",
  "procurar tempero",
  "buscar tempero",
  "pesquisar produto",
];

const stripPrefix = (texto: string, prefixos: string[]) => {
  for (const p of prefixos) {
    if (texto.startsWith(p + " ")) return texto.slice(p.length + 1).trim();
  }
  return null;
};

export const interpretarComando = (bruto: string): VoiceCommand => {
  const texto = normalizar(bruto).replace(/[.!?]+$/, "");
  if (!texto) return { tipo: "desconhecido", texto: bruto };

  const cliente = stripPrefix(texto, PREFIXOS_BUSCA_CLIENTE);
  if (cliente) {
    return { tipo: "buscar", rota: "/pedidos", termo: cliente, label: `Buscar cliente "${cliente}"` };
  }

  const produto = stripPrefix(texto, PREFIXOS_BUSCA_PRODUTO);
  if (produto) {
    return { tipo: "buscar", rota: "/produtos", termo: produto, label: `Buscar produto "${produto}"` };
  }

  if (/^(novo pedido|criar pedido|abrir pedido)$/.test(texto)) {
    return { tipo: "navegar", rota: "/pedidos", label: "Novo pedido" };
  }

  const semVerbo = texto.replace(
    /^(abrir|abre|ir para|ir pra|vai para|vai pra|mostrar|mostra|ver|acessar)\s+(a\s+|o\s+|as\s+|os\s+)?/,
    "",
  );

  for (const r of ROTAS) {
    if (r.termos.some((t) => semVerbo === t || semVerbo.startsWith(t + " ") || semVerbo === "pagina de " + t)) {
      return { tipo: "navegar", rota: r.rota, label: r.label };
    }
  }

  return { tipo: "desconhecido", texto: bruto };
};
