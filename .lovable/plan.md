## Loja Temperanza — Estrutura inspirada na Kinder's Seasonings

A loja Shopify (`temperanza-flavors-onaxb`) já está criada e o Lovable Cloud ativado. Vou reaproveitar o branding atual (Playfair + Lato, paleta cream/gold/wood) e absorver da Kinder's a densidade do grid de produtos, hierarquia tipográfica do card (categoria → nome → preço → CTA) e o ritmo da navegação por coleção.

### O que será construído

**1. Catálogo Shopify real (5 produtos, com as imagens já existentes em `src/assets/products/`)**

Cada produto com 3 variantes de tamanho (60g / 150g / 300g), SKU, peso, controle de estoque, descrição, modo de uso e harmonização:

```text
Lemon Pepper             — R$ 14,90 / 29,90 / 49,90   tags: citrico, peixes, aves
Páprica Picante          — R$ 15,90 / 31,90 / 52,90   tags: picante, carnes
Tempero Edu Guedes       — R$ 16,90 / 33,90 / 54,90   tags: completo, linha-do-chef
Salsa, Cebola e Alho     — R$ 13,90 / 27,90 / 46,90   tags: base, refogados
Tempero Mineiro Moído    — R$ 15,90 / 31,90 / 52,90   tags: regional, mineiro
```

Coleções: "Linha do Chef", "Picantes", "Clássicos", "Mais Vendidos".

**2. Vitrine custom (frontend Lovable, rotas novas)**

```text
/                      Home — hero, destaques, coleções, prova social
/temperos              Grid estilo Kinder's: filtros (categoria, picância), ordenação
/temperos/:handle      Página de produto: galeria, seletor de variante, qtd, add-to-cart
/colecoes/:handle      Vitrine por coleção
/sobre                 História da marca (chef + tradição)
/admin/posts           Gerador de posts atual movido para cá (uso interno)
```

**3. Carrinho + Checkout via Storefront API**

- Estado em Zustand persistido em `localStorage` (cart id, line ids, checkoutUrl)
- `CartDrawer` lateral acessível em qualquer página, badge no header
- Botão "Finalizar compra" abre o checkout Shopify oficial em nova aba (`channel=online_store`)
- Hook `useCartSync` para limpar carrinho após compra concluída

**4. Componentes novos**

```text
Header (sticky, com nav + CartDrawer trigger)
ProductCard (versão Kinder's: imagem grande, badge categoria, nome, preço, "+ carrinho")
ProductGallery, VariantSelector, QuantityStepper, AddToCartButton
CollectionGrid, ProductFilters, SpiceLevelBadge
CartDrawer, CartLineItem
```

**5. SEO + polimento**
- `<title>`, meta description e Open Graph em cada rota
- JSON-LD `Product` na página de produto
- `alt` semântico nas imagens, single H1 por página
- Lazy loading nas imagens da grid

### Detalhes técnicos

- **Stack:** React + Vite + Tailwind + shadcn (existente) + Zustand (novo) + Shopify Storefront API 2025-07
- **Sem mocks:** o `src/data/products.ts` será reutilizado **apenas** para o gerador de posts em `/admin/posts`. A vitrine consome 100% dados reais via Storefront API
- **Domain:** `temperanza-flavors-onaxb.myshopify.com` / token Storefront já obtido
- **Imagens:** uploadadas para o CDN Shopify a partir de `src/assets/products/` no momento da criação dos produtos
- **Design tokens:** mantenho a paleta `--gold`, `--wood`, `--cream` e a tipografia Playfair/Lato já no `index.css`; ajusto apenas o ritmo de spacing e a densidade do card para refletir o padrão Kinder's

### Ordem de execução

1. Criar os 5 produtos no Shopify (paralelo) com variantes, imagens e tags
2. Instalar `zustand`; criar `src/lib/shopify.ts`, `src/stores/cartStore.ts`, `src/hooks/useCartSync.ts`
3. Criar `Header` + `CartDrawer` e wirear no `App.tsx`
4. Substituir `ProductsGrid` pela nova vitrine Shopify; refazer `ProductCard` no padrão Kinder's
5. Criar `/temperos`, `/temperos/:handle`, `/colecoes/:handle`, `/sobre`
6. Mover gerador de posts para `/admin/posts`
7. SEO + polimento final

### O que **não** entra agora (próximas fases)

- Receitas / blog
- Bundles e cross-sell automático
- Captura de e-mail / newsletter
- Páginas institucionais extras (FAQ, política, contato dedicado)
- Reviews (fora — política contra reviews fake)

Posso seguir e implementar?
