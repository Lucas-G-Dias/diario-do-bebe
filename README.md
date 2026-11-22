# Diário do Bebê

App da família para acompanhar o bebê: sono, mamadas, fraldas e estoque, crescimento, agenda, exames (com anexos), vacinas do SUS e as fases do desenvolvimento. Funciona como app instalável no celular (PWA), com notificações.

- **Endereço:** https://lucas-g-dias.github.io/diario-do-bebe/
- **Dados:** Supabase (banco, login, arquivos). Só membros da família leem e escrevem; nenhum dado fica neste repositório.
- **Notificações:** função `supabase/functions/notify`, chamada a cada hora pelo `pg_cron`.

## Estrutura

| Arquivo | O que é |
|---|---|
| `index.html` | o app inteiro |
| `sw.js` | service worker: modo offline e notificações |
| `manifest.webmanifest`, `icons/` | instalação e ícones |
| `vendor/supabase.js` | biblioteca do Supabase (v2.45.4) |
| `supabase/schema.sql` | tabelas e regras de acesso |
| `supabase/functions/notify/` | envio das notificações |
