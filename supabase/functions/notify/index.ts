// Diário do Bebê: envia as notificações (roda a cada hora pelo pg_cron)
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const APP_URL = "https://lucas-g-dias.github.io/diario-do-bebe/";
const DAY = 864e5, HR = 36e5, TZ = -3; // horário de Brasília
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
webpush.setVapidDetails(Deno.env.get("VAPID_SUBJECT")!, Deno.env.get("VAPID_PUBLIC_KEY")!, Deno.env.get("VAPID_PRIVATE_KEY")!);

const VAX: [string, string, number, string][] = [
  ["bcg","BCG",0,"dose única"],["hepb0","Hepatite B",0,"ao nascer"],
  ["penta1","Penta",2,"1ª dose"],["vip1","VIP (pólio)",2,"1ª dose"],["pneu1","Pneumocócica 10V",2,"1ª dose"],["rota1","Rotavírus",2,"1ª dose"],
  ["menc1","Meningocócica C",3,"1ª dose"],
  ["penta2","Penta",4,"2ª dose"],["vip2","VIP (pólio)",4,"2ª dose"],["pneu2","Pneumocócica 10V",4,"2ª dose"],["rota2","Rotavírus",4,"2ª dose"],
  ["menc2","Meningocócica C",5,"2ª dose"],
  ["penta3","Penta",6,"3ª dose"],["vip3","VIP (pólio)",6,"3ª dose"],["covid1","Covid-19",6,"1ª dose"],["flu","Influenza",6,"anual"],
  ["covid2","Covid-19",7,"2ª dose"],["fa1","Febre amarela",9,"1ª dose"],["covid3","Covid-19",9,"3ª dose"],
  ["pneur","Pneumocócica 10V",12,"reforço"],["menr","Meningocócica",12,"reforço"],["scr1","Tríplice viral",12,"1ª dose"],
  ["dtp1","DTP",15,"1º reforço"],["vipr","VIP (pólio)",15,"reforço"],["hepa","Hepatite A",15,"dose única"],["tetra","Tetra viral",15,"dose única"],
  ["dtp2","DTP",48,"2º reforço"],["fa2","Febre amarela",48,"reforço"],["var2","Varicela",48,"2ª dose"],
];

const local = (ms: number) => { const d = new Date(ms + TZ * HR); return { iso: d.toISOString().slice(0, 10), hour: d.getUTCHours(), ym: d.toISOString().slice(0, 7) }; };
const addDays = (iso: string, n: number) => { const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const toMs = (date: string, time?: string) => Date.parse(`${date}T${time || "00:00"}:00Z`) - TZ * HR;
const prevYm = (ym: string) => { let [y, m] = ym.split("-").map(Number); m--; if (!m) { m = 12; y--; } return `${y}-${String(m).padStart(2, "0")}`; };
const ddmm = (iso: string) => iso.slice(8, 10) + "/" + iso.slice(5, 7);
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };

const DEF_OFF = ["mamada", "resumo"];
type Sub = { endpoint: string; sub: unknown; prefs: Record<string, unknown> | null };
const wants = (s: Sub, cat?: string) => !cat || ((s.prefs || {})[cat] ?? !DEF_OFF.includes(cat)) === true;
async function send(fid: string, payload: Record<string, unknown>, onlyUser?: string, cat?: string, filter?: (s: Sub) => boolean) {
  let q = db.from("push_subs").select("endpoint,sub,prefs").eq("family_id", fid);
  if (onlyUser) q = q.eq("user_id", onlyUser);
  const { data } = await q; let ok = 0;
  for (const s of ((data || []) as Sub[]).filter((x) => wants(x, cat) && (!filter || filter(x)))) {
    try { await webpush.sendNotification(s.sub, JSON.stringify(payload), { TTL: 43200 }); ok++; }
    catch (e) { const c = (e as { statusCode?: number }).statusCode; if (c === 404 || c === 410) await db.from("push_subs").delete().eq("endpoint", s.endpoint); else console.error("push", c); }
  }
  return ok;
}
const once = async (fid: string, key: string) => !(await db.from("notif_log").insert({ family_id: fid, key })).error;

async function checkFamily(fid: string) {
  const now = Date.now(), L = local(now), sent: string[] = [];
  const { data: rows } = await db.from("docs").select("path,data").eq("family_id", fid).eq("deleted", false)
    .or(`path.like.config/*,path.like.inventory/*,path.like.agenda/*,path.like.exams/*,path.like.vaccines/*,path.like.months/${L.ym}/*,path.like.months/${prevYm(L.ym)}/*`);
  const by = (p: string) => (rows || []).filter((r) => r.path.startsWith(p + "/")).map((r) => ({ id: r.path.split("/").pop()!, ...r.data }));
  const cfg = (rows || []).find((r) => r.path === "config/main")?.data || {};
  const baby = cfg.name || "o bebê";
  const notify = async (key: string, title: string, body: string, tab: string, cat: string, filter?: (s: Sub) => boolean) => { if (await once(fid, key)) { await send(fid, { title, body, url: APP_URL + "#" + tab, tag: key }, undefined, cat, filter); sent.push(key); } };
  const hm = (ms: number) => new Date(ms + TZ * HR).toISOString().slice(11, 16);
  const events = by(`months/${L.ym}/events`).concat(by(`months/${prevYm(L.ym)}/events`));

  // fraldas
  const inv = by("inventory"), fr = inv.filter((i) => i.cat === "fralda");
  if (fr.length && L.hour >= 9) {
    const ns = (x: unknown) => String(x || "").toUpperCase().replace(/\s/g, "");
    const act = fr.find((i) => i.id === cfg.diaperItem), pool = act ? fr.filter((i) => ns(i.size) === ns(act.size)) : fr;
    const total = pool.reduce((s, i) => s + (+i.qty || 0), 0), szTxt = act && ns(act.size) ? " " + ns(act.size) : "";
    const evs = events.filter((e) => e.type === "diaper" && e.start <= now);
    const last7 = evs.filter((e) => e.start >= now - 7 * DAY);
    let avg: number;
    if (last7.length >= 3) { const first = Math.min(...evs.map((e) => e.start)); avg = last7.length / Math.max(1, Math.min(7, (now - first) / DAY)); }
    else { const m = cfg.birth ? (now - Date.parse(cfg.birth)) / (30.44 * DAY) : 0; avg = m < 1 ? 10 : m < 6 ? 8 : m < 12 ? 6 : 5; }
    const days = total / avg;
    if (days <= 3) await notify(`diaper:${L.iso}`, total ? "Fraldas acabando" : "Acabaram as fraldas", total ? `Restam ${total} fraldas${szTxt}, dá para ${days < 1 ? "menos de 1 dia" : "uns " + Math.floor(days) + (Math.floor(days) > 1 ? " dias" : " dia")}. Hora de comprar!` : "O estoque de fraldas está zerado no app.", "estoque", "fralda");
  }
  // lista de compras
  const low = inv.filter((i) => i.cat !== "fralda" && +i.min > 0 && (+i.qty || 0) <= +i.min);
  if (low.length && L.hour >= 9) await notify(`shop:${L.iso}`, "Lista de compras", "Está acabando: " + low.map((i) => i.name).slice(0, 5).join(", ") + (low.length > 5 ? "…" : ""), "estoque", "compras");

  // compromissos e exames
  const items = by("agenda").filter((a) => !a.done && a.date).map((a) => ({ id: a.id, title: a.title, date: a.date, time: a.time, place: a.place, tab: "agenda" }))
    .concat(by("exams").filter((e) => e.status === "agendado" && e.date).map((e) => ({ id: e.id, title: "Exame: " + e.name, date: e.date, time: e.time, place: e.place, tab: "exames" })));
  const tomorrow = addDays(L.iso, 1);
  for (const it of items) {
    const where = it.place ? ` · ${it.place}` : "";
    if (it.date === tomorrow && L.hour >= 19) await notify(`d1:${it.id}:${it.date}`, "Amanhã: " + it.title, (it.time ? "às " + it.time : "dia todo") + where, it.tab, "agenda");
    if (it.date === L.iso) {
      if (it.time) { const diff = toMs(it.date, it.time) - now; if (diff > 0 && diff <= 2 * HR) await notify(`h2:${it.id}:${it.date}${it.time}`, "Daqui a pouco: " + it.title, "às " + it.time + where, it.tab, "agenda"); }
      else if (L.hour >= 8) await notify(`d0:${it.id}:${it.date}`, "Hoje: " + it.title, where.replace(" · ", "") || "Não esqueça!", it.tab, "agenda");
    }
  }
  // resultado de exame pendente
  if (L.hour >= 9) for (const e of by("exams").filter((e) => e.status === "realizado" && e.date && toMs(e.date) < now - 10 * DAY))
    await notify(`res:${e.id}`, "Resultado de exame", `Já saiu o resultado de ${e.name}? Registre no app.`, "exames", "exames");

  // vacinas
  if (cfg.birth && L.hour >= 9) {
    const done = Object.fromEntries(by("vaccines").map((v) => [v.id, v.done]));
    const due = (m: number) => { const d = new Date(cfg.birth + "T12:00:00Z"); d.setUTCMonth(d.getUTCMonth() + m); return d.toISOString().slice(0, 10); };
    const late: string[] = [];
    for (const [code, name, m, dose] of VAX) {
      if (done[code]) continue;
      const d = due(m), ms = toMs(d);
      if (ms - now > 0 && ms - now <= 7 * DAY) await notify(`vs:${code}`, "Vacina chegando", `${name} (${dose}) de ${baby} está prevista para ${ddmm(d)}. Já agendou?`, "saude", "vacinas");
      if (now > ms + 14 * DAY && m < 48 + 12) late.push(`${name} (${dose})`);
    }
    if (late.length) await notify(`vl:${Math.floor(now / (7 * DAY))}`, late.length > 1 ? `${late.length} vacinas atrasadas` : "Vacina atrasada", late.slice(0, 4).join(", ") + (late.length > 4 ? "…" : "") + ". Se já tomou, marque na caderneta do app.", "saude", "vacinas");
  }
  // remédio: próxima dose do último registro de cada remédio
  const latestMed: Record<string, any> = {};
  for (const e of events) if (e.type === "med" && e.name) { const k = String(e.name).toLowerCase(); if (!latestMed[k] || e.start > latestMed[k].start) latestMed[k] = e; }
  for (const e of Object.values(latestMed)) {
    if (!(+e.remindEvery > 0)) continue;
    const due = e.start + e.remindEvery * HR;
    if (e.remindUntil && due > e.remindUntil + 60000) continue;
    if (now >= due - 2 * 60000 && now - due < 30 * 60000) await notify(`med:${e.id}`, "Hora do remédio: " + e.name, (e.dose ? e.dose + " · " : "") + "última dose às " + hm(e.start), "inicio", "remedios");
  }
  // tempo desde a última mamada (opcional, por aparelho: 2, 3 ou 4 h)
  const feeds = events.filter((e) => e.type === "feed" && e.start <= now).sort((a, b) => b.start - a.start);
  const lf = feeds[0];
  if (lf && !(lf.kind === "peito" && lf.end == null)) for (const h of [2, 3, 4]) {
    const gap = now - lf.start;
    if (gap >= h * HR && gap < h * HR + 30 * 60000) await notify(`feed:${lf.id}:${h}`, `Última mamada há ${h} horas`, "Foi às " + hm(lf.start) + ".", "inicio", "mamada", (s) => (+(s.prefs || {}).mamadaH || 3) === h);
  }
  // resumo do dia às 21h (opcional)
  if (L.hour >= 21) {
    const d0 = toMs(L.iso), d1 = d0 + DAY;
    let sleep = 0; for (const e of events) if (e.type === "sleep") { const a = Math.max(e.start, d0), b = Math.min(e.end ?? now, d1, now); if (b > a) sleep += b - a; }
    const today = events.filter((e) => e.start >= d0 && e.start < d1);
    const nf = today.filter((e) => e.type === "feed").length, nd = today.filter((e) => e.type === "diaper").length;
    if (nf + nd + sleep > 0) { const sh = Math.floor(sleep / HR), sm = Math.round((sleep % HR) / 60000);
      await notify(`sum:${L.iso}`, `O dia de ${baby}`, `${sh}h${String(sm).padStart(2, "0")} de sono · ${nf} ${nf === 1 ? "mamada" : "mamadas"} · ${nd} ${nd === 1 ? "fralda" : "fraldas"}`, "diario", "resumo"); }
  }
  // mesversário e nova fase
  if (cfg.birth && L.hour >= 9) {
    const b = new Date(cfg.birth + "T12:00:00Z"), t = new Date(L.iso + "T12:00:00Z");
    const months = (t.getUTCFullYear() - b.getUTCFullYear()) * 12 + t.getUTCMonth() - b.getUTCMonth();
    const lastDay = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() + 1, 0)).getUTCDate();
    if (months > 0 && t.getUTCDate() === Math.min(b.getUTCDate(), lastDay)) {
      const fases: Record<number, string> = { 1: "Primeiros sorrisos", 3: "Descobrindo as mãos", 6: "Hora de sentar e provar", 9: "Explorador", 12: "Primeiros passos", 18: "Pequeno falante", 24: "Dois anos", 36: "Três anos ou mais" };
      const y = Math.floor(months / 12), m = months % 12, idade = y ? `${y} ${y > 1 ? "anos" : "ano"}${m ? ` e ${m} ${m > 1 ? "meses" : "mês"}` : ""}` : `${months} ${months > 1 ? "meses" : "mês"}`;
      await notify(`mes:${L.iso}`, `Hoje ${baby} completa ${idade}!`, fases[months] ? `Começa a fase "${fases[months]}". Veja o que muda no app.` : "Que tal registrar uma conquista de hoje?", fases[months] ? "fases" : "inicio", "marcos");
    }
  }
  return sent;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const body = await req.json().catch(() => ({}));
  if (body.test) {
    const jwt = (req.headers.get("authorization") || "").replace(/^Bearer /, "");
    const { data: { user } } = await db.auth.getUser(jwt);
    if (!user) return json({ error: "login necessário" }, 401);
    const { data: m } = await db.from("members").select("family_id").eq("user_id", user.id);
    let n = 0;
    for (const r of m || []) n += await send(r.family_id, { title: "Diário do Bebê", body: "Pronto! As notificações estão funcionando neste aparelho.", url: APP_URL, tag: "teste" }, user.id);
    return json({ sent: n });
  }
  if (req.headers.get("x-cron-secret") !== Deno.env.get("CRON_SECRET")) return json({ error: "forbidden" }, 403);
  const { data } = await db.from("push_subs").select("family_id");
  const out: Record<string, unknown> = {};
  for (const fid of [...new Set((data || []).map((r) => r.family_id))]) { try { out[fid] = await checkFamily(fid); } catch (e) { console.error(e); out[fid] = "erro"; } }
  return json(out);
});
