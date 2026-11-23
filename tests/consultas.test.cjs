// Trava contra N+1: carregar todas as coleções da família tem de custar UMA consulta ao banco.
// Roda sem internet: o Supabase é trocado por um falso que só conta as chamadas. Uso: npm test
const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const vm = require("node:vm");
const path = require("node:path");

function app() {
  const calls = [];
  const rows = [{ path: "config/main", data: { name: "Davi" }, deleted: false }, { path: "agenda/a1", data: { title: "Pediatra" }, deleted: false }];
  const query = (kind, cols) => { const q = { cols, filters: [] }; const chain = new Proxy(q, { get: (t, k) => k === "then" ? (ok) => { calls.push({ kind, ...t }); return Promise.resolve({ data: rows, error: null }).then(ok) } : (...a) => { t.filters.push([k, ...a]); return chain } }); return chain };
  const sb = { from: (table) => ({ select: (cols) => query("select:" + table, cols), upsert: () => query("upsert:" + table) }), auth: {}, storage: {} };
  const store = {};
  const ctx = {
    supabase: { createClient: () => sb }, console, setTimeout, clearTimeout, setInterval: () => 0, performance,
    navigator: { onLine: true }, addEventListener() {}, document: { addEventListener() {}, visibilityState: "visible" }, window: { addEventListener() {} },
    localStorage: { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v) }, removeItem: (k) => { delete store[k] } },
    S: { stale: false }, render() {}, toast() {},
  };
  vm.createContext(ctx);
  const src = fs.readFileSync(path.join(__dirname, "../js/02-dados.js"), "utf8");
  vm.runInContext(src + "\n;globalThis.__t={store,subs,refetchAll,refetchNow,QSTATS,setFam:f=>{FAM=f;ME={id:'u'}}};", ctx);
  return { t: ctx.__t, calls };
}
const COLS = ["inventory", "growth", "agenda", "vaccines", "milestones", "exams", "photos", "enxoval", "albums", "albnotes", "months/2026-11/events", "months/2026-10/events"];
const flush = () => new Promise((r) => setTimeout(r, 20));

test("abrir o app: 1 doc + 12 coleções = 1 consulta", async () => {
  const { t, calls } = app(); t.setFam("fam-1");
  const got = {};
  t.store.doc("config/main", (d) => { got.cfg = d });
  COLS.forEach((c) => t.store.col(c, (l) => { got[c] = l }));
  await flush();
  const reads = calls.filter((c) => c.kind === "select:docs");
  assert.strictEqual(reads.length, 1, `esperava 1 consulta, houve ${reads.length}`);
  assert.deepStrictEqual(got.cfg, { name: "Davi" });
  assert.strictEqual(got.agenda.length, 1);
  // só as colunas usadas pela tela
  assert.strictEqual(reads[0].cols, "path,data,deleted");
  // apagados ficam de fora das coleções (só o documento único precisa saber que foi apagado)
  assert.ok(reads[0].filters.some(([k, v]) => k === "or" && v.includes("deleted.is.false")));
});

test("voltar ao app logo depois não repete a leitura; forçar faz 1 consulta", async () => {
  const { t, calls } = app(); t.setFam("fam-1");
  COLS.forEach((c) => t.store.col(c, () => {}));
  await flush(); const n = calls.length;
  t.refetchAll(); await flush();
  assert.strictEqual(calls.length, n, "releu tudo em menos de 4 s");
  t.refetchAll(true); await flush();
  assert.strictEqual(calls.filter((c) => c.kind === "select:docs").length - 1, 1);
});
