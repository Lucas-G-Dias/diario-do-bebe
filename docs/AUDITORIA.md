# Auditoria de novembro/2026

Medido com Playwright contra o Supabase real (conta de teste apagada depois), celular 360–390 px.

## 1. Botões e ações

| Problema | Por que confundia | Correção |
|---|---|---|
| "Editar" (agenda, ficha), "Abrir" (exames), "Ver" (apresentação) | Na lista de botões do leitor de tela aparecem dez "Editar" iguais | `aria-label` começa pelo texto visível e diz de quê: "Editar compromisso: Pediatra" |
| − / + / "Compra" no estoque, − / + / "Abri" nos lenços | Não dizia de qual item nem o que "Abri" faz | "Tirar 1 de Fralda P", "Compra de X: somar ao estoque", dica no "Abri" |
| Botão + da barra ("Registrar") | Não dizia que abre um menu de opções | "Novo registro: fralda, mamada, sono e mais" + `aria-haspopup` |
| "Dispensar", "Parar", "Favorita", setas da foto | Genéricos ou sem estado | Contexto no nome, `aria-pressed` na favorita, "Foto anterior/Próxima foto" |
| Cartão da fase, linhas de crescimento, exames e conquistas | `div`/`tr` clicáveis: o teclado não chegava | Viram `role=button` + `tabindex=0`, Enter/Espaço funcionam, anel de foco |
| Ícones sem dica | Quem usa o computador não sabia o que eram | `title` igual ao `aria-label` (automático) |
| Campo de data do Diário | Sem nome | "Escolher o dia do diário" |
| Diálogos | No celular o foco ficava atrás do diálogo; Tab escapava; ao fechar o foco se perdia | Foco vai para o título, Tab preso dentro, Esc fecha e devolve o foco para o botão que abriu |
| Avisos (toast) | O leitor de tela não lia | `role=status` (erro: `role=alert`) |
| Links "Ver diário", "Editar", "Sair" | Alvo de toque de 19 px | Mínimo de 24 px sem mudar o desenho |

## 2. Carregamento, envio e erro

- Botões ficam "ocupados" (desabilitados, `aria-busy`, giratório) se a ação demorar mais de 150 ms. Os formulários dizem "Salvando…", "Entrando…" ou "Criando conta…".
- Sem dados no aparelho, a tela mostra um esqueleto do layout em vez de um falso "vazio". Antes, a Agenda dizia que todas as vacinas estavam atrasadas.
- Se o servidor não responde: mensagem clara e botão "Tentar de novo" (também na faixa "Mostrando os últimos dados salvos").
- O registro aparece na hora (interface otimista), com desfazer seguro: guarda o valor anterior e o devolve se o servidor recusar. Antes, o item ficava na tela depois do erro. Se a falha é de rede, o registro vai para a fila offline.
- Internet muito lenta (mais de 8 s): o formulário fecha com "Salvo no aparelho. Enviando…". Se o servidor recusar depois, o registro é desfeito e o app avisa.
- Fotos: se uma falha, o envio parcial é apagado (nenhum arquivo órfão) e aparece "Tentar de novo" só para as fotos que falharam.
- Com a opção do sistema de reduzir animações, o giratório e o esqueleto ficam parados.

## 3. Consultas N+1

Caminho: `store.col/doc` → `fetchSub` → Supabase REST (`docs`) → Postgres (RLS por família) → cache → telas.

| Onde | Antes | Depois |
|---|---|---|
| Abrir o app | 26 consultas (13 coleções × 2: leitura + reconexão em tempo real) | 1 |
| Voltar ao app | 13 | 1 (0 se acabou de ler) |
| Atualizar tudo (mediana de 5) | 1.033 ms | 510 ms |
| Aviso automático com 15 avisos | 31 consultas, 1.657 ms (1 + 2 por aviso) | 4 consultas, 259 ms (fixo) |

- Colunas: só `path,data,deleted`. Itens apagados ficam de fora das coleções.
- Trava: `tests/consultas.test.cjs` (`npm test`, roda no GitHub). Na versão antiga ela falha com "esperava 1 consulta, houve 13".
- Métrica: `QSTATS` no app; `q` e `ms` por família na resposta e no log da função `notify`.
- Compromisso aceito: se a leitura completa aconteceu há menos de 4 s, a reconexão em tempo real não relê tudo.

## 4. Trabalho pesado fora da requisição

| Operação | Decisão |
|---|---|
| Avisos (fralda, agenda, vacina, remédio...) | Já é tarefa de fundo (pg_cron a cada 5 min chama a função `notify`). Ganhou envio em paralelo, tempo-limite de 8 s por aparelho, log por família e nova tentativa: se um aviso falha em todos os aparelhos por motivo passageiro, a chave é apagada e a próxima rodada tenta de novo. A chave (`notif_log`) garante que o mesmo aviso nunca sai duas vezes. Para consultar o resultado: tabela `notif_log` e Logs da função. |
| Fotos (reduzir, miniatura) | Feito no celular, com barra de progresso. Não pesa no servidor; fila no servidor seria custo sem ganho. |
| Anexos de exames | Envio direto ao Storage, com o nome do arquivo e "Enviando…". Pequeno: fica simples. |
| Relatórios, importação, e-mail | Não existem no app hoje. |
| Teste de notificação | Síncrono de propósito (1 aparelho, menos de 1 s). |
