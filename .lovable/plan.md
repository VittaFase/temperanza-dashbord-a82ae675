## Objetivo

Transformar o projeto Temperanza Gastronomia em uma **loja online completa de temperos** com Shopify como motor de e-commerce (catálogo, estoque, checkout, frete, pagamentos) e uma vitrine custom no Lovable que combina a identidade visual rústica-premium da Temperanza com a estrutura de conversão da Kinder's. O gerador de posts atual será preservado como ferramenta interna de marketing.

## Fases

### Fase 1 — Fundação e referência visual
1. Ativar Shopify (loja nova de desenvolvimento) — já confirmado.
2. Rodar Firecrawl em `kinders.com/collections/seasonings-signature` para extrair: paleta de cores, tipografia, estrutura de card, hierarquia de informação, badges, copy patterns. Salvar em `docs/kinders-reference.md`.
3. Consolidar design system: manter logo do chef + paleta madeira/dourado/creme da Temperanza, absorvendo da Kinder's apenas a *densidade tipográfica* e o *ritmo do grid*.

### Fase 2 — Catálogo Shopify
4. Cadastrar os 5 temperos no Shopify (Lemon Pepper, Páprica Picante, Edu Guedes, Salsa Cebola e Alho, Tempero Mineiro) com:
   - Variantes (ex: 60g / 150g / 300g)
   - Imagens, descrição rica, modo de uso, harmonizações
   - Tags por categoria de uso (carnes, peixes, aves, vegetais)
   - SKU, preço, peso (para cálculo de frete)
5. Configurar coleções: "Mais vendidos", "Novidades", "Linha do Chef", "Picantes".

### Fase 3 — Vitrine custom (frontend Lovable)
6. **Home** redesenhada: hero editorial com fotografia gastronômica + logo do chef, seção de coleções em destaque, "best sellers", banner de receita, prova social.
7. **Página de coleção** (`/temperos`): grid denso estilo Kinder's com filtros (uso culinário, intensidade, tamanho) e ordenação. Badges visuais: 🌶️ nível de picância, ⭐ best seller, ✨ novo.
8. **Página de produto** (`/temperos/:handle`): galeria, seletor de variante, quantidade, botão "Adicionar ao carrinho", descrição rica em abas (Sobre / Modo de uso / Ingredientes / Receitas sugeridas), produtos relacionados, reviews.
9. **Carrinho lateral (drawer)** com upsell de produtos complementares.
10. **Checkout**: redirect para checkout hospedado do Shopify (seguro, com pagamento e frete já configurados).
11. **Páginas institucionais**: Sobre a Temperanza, Receitas, Contato, FAQ.

### Fase 4 — Inteligência e conversão
12. **Receitas integradas**: cada tempero tem receitas sugeridas que linkam de volta ao produto e podem adicionar todos os ingredientes ao carrinho ("cozinhe esta receita").
13. **Combos/Kits**: criar produtos-bundle no Shopify (ex: "Kit Churrasco", "Kit Iniciante", "Coleção Completa") com preço promocional.
14. **Cross-sell automático** na página de produto e no carrinho baseado em tags.
15. **Captura de e-mail** com cupom de boas-vindas (newsletter).
16. **SEO**: meta tags, JSON-LD de Product e Recipe, sitemap, alt text, URLs limpas.

### Fase 5 — Marketing (preservar funcionalidade atual)
17. Mover o gerador de posts atual para `/admin/posts` (rota interna). Pode ficar acessível só via link direto inicialmente; depois pode ser protegido por senha.
18. Adicionar botão "Compartilhar" em cada produto que abre o gerador pré-preenchido com aquele produto.

## Detalhes técnicos

- **Stack**: React + Vite + Tailwind (já existente), Shopify Storefront API (GraphQL) via SDK `@shopify/storefront-api-client` para consumir catálogo no frontend, Shopify Admin API (via edge functions Lovable Cloud) para operações administrativas.
- **Estado do carrinho**: Shopify Cart API (cartId persistido em localStorage) — fonte única de verdade para evitar dessincronia com checkout.
- **Roteamento**: adicionar rotas `/`, `/temperos`, `/temperos/:handle`, `/colecoes/:handle`, `/receitas`, `/receitas/:slug`, `/sobre`, `/carrinho`, `/admin/posts`.
- **Componentes novos**: `ProductGallery`, `VariantSelector`, `AddToCartButton`, `CartDrawer`, `CollectionGrid`, `ProductFilters`, `RecipeCard`, `SpiceLevelBadge`.
- **Firecrawl**: usado uma vez na Fase 1 via edge function temporária com `FIRECRAWL_API_KEY` (connector). Resultado salvo como arquivo de documentação — não roda em runtime.
- **Imagens**: hospedadas no Shopify (CDN incluso).
- **Lovable Cloud**: ativado para suportar edge functions (Firecrawl + futuros webhooks Shopify).

## O que NÃO está no escopo desta fase

- App mobile nativo
- Sistema de afiliados / programa de fidelidade
- Multi-idioma / multi-moeda
- Blog editorial completo (apenas seção de receitas)
- Reviews com moderação custom (usar app do Shopify se necessário, ex: Judge.me)

## Pré-requisitos a confirmar antes de implementar

- Plano **Lovable Pro** (necessário para payments/Shopify).
- Ativar **Lovable Cloud** (necessário para edge functions e integração).
- Conexão **Firecrawl** ativa (para Fase 1).

## Próximo passo após aprovação

Começar pela **Fase 1**: ativar Shopify (nova loja), ativar Lovable Cloud, conectar Firecrawl, rodar extração da Kinder's e consolidar o design system antes de tocar no código de produto.
