# Diário do Bebê — mapa do projeto

PWA da família (pai e mãe) para acompanhar o bebê. HTML + JS puro, sem build.
Dados no Supabase (projeto `tlkltayokmzzfreyhrvs`, São Paulo). Publicado pelo
GitHub Pages em https://lucas-g-dias.github.io/diario-do-bebe/.
Toda a interface e as mensagens são em português do Brasil.

## Regra de ouro para economizar contexto

1. Leia **só** o arquivo da tabela abaixo que corresponde à tarefa. Não abra
   `index.html` inteiro nem varra o projeto.
2. Nenhum arquivo passa de **350 linhas** (`npm run lint` falha). Se crescer,
   divida por responsabilidade, nunca por número de linha.
3. Os arquivos de `js/` são scripts clássicos que **compartilham o escopo
   global**, carregados na ordem de `index.html`. Um arquivo só pode usar, ao
   carregar, o que os anteriores definem; dentro de funções, pode usar tudo.

## Onde fica cada coisa

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | casca: head, CSS, ordem dos scripts |
| `css/base.css` | tokens de cor (claro/escuro), formulários, cartões, modal |
| `css/app.css` | navegação, Início, Sons, Menu, Álbum, boas-vindas |
| `css/recursos.css` | offline, fraldas, enxoval, painel de estoque, Próximos |
| `js/01-base.js` | logo, utilidades de data/texto, dados fixos (fases, vacinas SUS, curvas OMS), estado `S` |
| `js/02-dados.js` | Supabase, cache local, fila offline (`OUTBOX`), `store.set/del/setMany/delMany` |
| `js/03-eventos.js` | registros (sono, mamada, fralda...), cálculos (`dayStats`, `diaperStats`), ícones `ic()` |
| `js/04-telas-a.js` | login, família, configuração inicial, Diário, Estoque, Crescimento |
| `js/05-telas-b.js` | Agenda, Exames, Saúde/vacinas, Fases, Ajustes |
| `js/06-modal-acoes.js` | modal, formulários de registro, ações `A.*` gerais |
| `js/07-dom.js` | cliques, envio de formulários, mudanças (delegação de eventos) |
| `js/08-app.js` | `render()`, páginas, Início, Menu, Como usar, boas-vindas, botão + |
| `js/09-sons-tema.js` | sons gerados no app, preferências de aviso, tema claro/escuro |
| `js/10-album.js` | álbum de fotos (fases, álbuns, visualizador, envio) |
| `js/11-fraldas.js` | página Fraldas e lenços, tamanhos RN–XXG |
| `js/12-enxoval.js` | enxoval: lista sugerida, checklist, gráficos |
| `js/13-estoque.js` | lenços (gasto estimado por troca), painel de fraldas/lenços da Início |
| `js/15-resumo.js` | cartão "Próximos" da Início (consulta, vacina, exame, peso) |
| `js/16-estados.js` | esqueleto de carregamento, erro com "Tentar de novo" (`pageBody`, `PAGE_DATA`) |
| `js/17-acessibilidade.js` | botões de verdade para teclado/leitor, dica nos ícones, foco preso no diálogo |
| `js/18-ajuda.js` | Central de ajuda (busca, miniaturas ilustrativas), ícones extras |
| `js/19-tour.js` | tour guiado com destaque (`TOURS.main` e um por tela; `startTour`, `pageTour`) |
| `js/20-conquistas.js` | sequência, nível, 46 medalhas (`game/main`), histórico total pela RPC `family_stats` |
| `js/21-atalhos.js` | "Repetir" da Início, teclas, `?a=` dos atalhos do ícone |
| `js/22-consulta.js` | Para a consulta: perguntas, resumo de 14 dias, backup |
| `js/23-desenvolvimento.js` | marcos da Caderneta por idade, previsão da próxima soneca |
| `js/24-alimentos.js` | introdução alimentar (marca sozinho pelo registro Comidinha) |
| `js/25-guia-duvidas.js` | Guia dos pais: dúvidas comuns com "procure atendimento se" (SBP/MS) |
| `js/26-guia.js` | Guia: passo a passo desenhado, onde comprar, pesquisa de preço no enxoval |
| `js/27-medalhas.js` | medalhas em SVG (bronze → lenda), história personalizada, compartilhar |
| `js/28-ilustras-alimentos.js` | ilustrações próprias dos 48 alimentos (`foodArt(nome)`) |
| `js/29-dicas-alimentos.js` | como oferecer cada alimento por idade (`FTIP`) e formatos seguros (`CUTS`) |
| `js/30-ilustras.js` | ilustrações de reações, grupos do Guia, marcos e lojas (`ill(nome)`) |
| `supabase/emails-pt.json` | e-mails em português (aplicar depois de configurar o SMTP) |
| `css/identidade.css` | cores 60/30/10 (`--impact` papaya só para ação e comemoração), tour, ajuda, conquistas |
| `js/14-boot.js` | assinaturas de dados, carregar família, início do app (sempre o último) |
| `sw.js` | modo offline e notificações push |
| `supabase/schema.sql` | tabelas e regras de acesso (RLS) |
| `supabase/functions/notify/index.ts` | avisos push, roda a cada 5 min pelo pg_cron |

## Padrões

- Novo arquivo em `js/` ou `css/`: incluir em `index.html` (na ordem certa) **e**
  na lista `SHELL` de `sw.js`, e subir o número de `CACHE` em `sw.js`.
- Página nova: `PAGES` e `VIEWS.<nome>` em `js/08-app.js` (ou no arquivo do recurso).
- Ação de botão: `data-act="nome"` + `A.nome=(id,el)=>{}`.
- Dados: sempre `store.set('colecao/id', {...})`; nunca chamar o Supabase direto
  para documentos (quebra o modo offline).
- Texto vindo do usuário sempre passa por `esc()`.
- Botão só com ícone: `aria-label` que diga **o que** e **de quê** ("Tirar 1 de Fralda P"), nunca só "Editar"/"Abrir".
  O `title` é posto sozinho por `17-acessibilidade.js`.
- Ação assíncrona: devolva a Promise em `A.nome`; o botão fica ocupado sozinho (`busy()` em `07-dom.js`).
- Leitura do banco: sempre por `store.col/doc` (vira 1 consulta em lote). `npm test` falha se voltar a N+1.
- Ilustração nova: SVG 64×64 em `ILL` ou `FART`, formas arredondadas, sem contorno, sombra suave; não use emoji.
- Tela nova com passo a passo: acrescente em `TOURS` (19-tour.js) e um tópico em `HELP` (18-ajuda.js).
- Decisões da auditoria (acessibilidade, carregamento, N+1, avisos): `docs/AUDITORIA.md`.
- Segredos (chave de serviço, VAPID privada, segredo do cron) ficam só no
  Supabase. Nunca no repositório. A chave `anon` no `02-dados.js` é pública.

## Comandos

- `npm run lint`: travas de qualidade (350 linhas, sem console direto)
- `npm test`: trava de N+1 (abrir o app = 1 consulta), roda sem internet
- Testar localmente: `python3 -m http.server 8765` e abrir no navegador
- Banco/funções: API de gerenciamento do Supabase com token de acesso
