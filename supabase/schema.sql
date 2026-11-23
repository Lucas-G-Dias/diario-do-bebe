-- Diário do Bebê: estrutura do banco
-- Cada família tem seus documentos; só membros da família leem e escrevem.

create extension if not exists pgcrypto;

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text,
  invite_code text unique not null default upper(substr(encode(gen_random_bytes(6),'hex'),1,8)),
  created_at timestamptz not null default now()
);

create table if not exists public.members (
  family_id uuid not null references public.families on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

create table if not exists public.docs (
  family_id uuid not null references public.families on delete cascade,
  path text not null,
  data jsonb not null default '{}'::jsonb,
  deleted boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid(),
  primary key (family_id, path)
);
create index if not exists docs_family_path on public.docs (family_id, path text_pattern_ops);

create table if not exists public.push_subs (
  endpoint text primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  family_id uuid not null references public.families on delete cascade,
  sub jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notif_log (
  family_id uuid not null references public.families on delete cascade,
  key text not null,
  sent_at timestamptz not null default now(),
  primary key (family_id, key)
);

create or replace function public.is_member(f uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from members where family_id = f and user_id = auth.uid())
$$;

alter table public.families enable row level security;
alter table public.members  enable row level security;
alter table public.docs     enable row level security;
alter table public.push_subs enable row level security;
alter table public.notif_log enable row level security;

drop policy if exists fam_read on public.families;
create policy fam_read on public.families for select to authenticated using (public.is_member(id));
drop policy if exists mem_read on public.members;
create policy mem_read on public.members for select to authenticated using (public.is_member(family_id));
drop policy if exists mem_update_self on public.members;
create policy mem_update_self on public.members for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists docs_all on public.docs;
create policy docs_all on public.docs for all to authenticated using (public.is_member(family_id)) with check (public.is_member(family_id));
drop policy if exists push_own on public.push_subs;
create policy push_own on public.push_subs for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid() and public.is_member(family_id));

-- criar família / entrar com código
create or replace function public.create_family(p_name text, p_display text) returns uuid
language plpgsql security definer set search_path = public as $$
declare f uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  insert into families(name) values (p_name) returning id into f;
  insert into members(family_id, user_id, display_name) values (f, auth.uid(), coalesce(p_display,''));
  return f;
end $$;

create or replace function public.join_family(p_code text, p_display text) returns uuid
language plpgsql security definer set search_path = public as $$
declare f uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select id into f from families where invite_code = upper(trim(p_code));
  if f is null then raise exception 'codigo invalido'; end if;
  insert into members(family_id, user_id, display_name) values (f, auth.uid(), coalesce(p_display,''))
    on conflict (family_id, user_id) do update set display_name = excluded.display_name;
  return f;
end $$;

revoke all on function public.create_family(text,text), public.join_family(text,text), public.is_member(uuid) from public, anon;
grant execute on function public.create_family(text,text), public.join_family(text,text), public.is_member(uuid) to authenticated;

grant usage on schema public to authenticated, service_role;
grant select on public.families, public.members to authenticated;
grant update (display_name) on public.members to authenticated;
grant select, insert, update, delete on public.docs, public.push_subs to authenticated;
grant all on all tables in schema public to service_role;

-- tempo real
alter table public.docs replica identity full;
do $$ begin
  alter publication supabase_realtime add table public.docs;
exception when duplicate_object then null; end $$;

-- arquivos dos exames: pasta por família
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('files','files', false, 20971520, array['image/png','image/jpeg','image/webp','image/heic','application/pdf'])
on conflict (id) do nothing;

drop policy if exists files_family on storage.objects;
create policy files_family on storage.objects for all to authenticated
  using (bucket_id = 'files' and public.is_member(((storage.foldername(name))[1])::uuid))
  with check (bucket_id = 'files' and public.is_member(((storage.foldername(name))[1])::uuid));

-- Contagem de todo o histórico da família (para medalhas como "1.000 fraldas").
-- Roda com as permissões de quem chama: o RLS de docs garante que só a própria família é lida.
create or replace function public.family_stats(f uuid) returns jsonb language sql stable as $$
  with ev as (select data from public.docs where family_id = f and deleted = false and path like 'months/%/events/%')
  select jsonb_build_object(
    'types', (select coalesce(jsonb_object_agg(t, n), '{}'::jsonb) from (select data->>'type' t, count(*) n from ev group by 1) x),
    'total', (select count(*) from ev),
    'days', (select coalesce(jsonb_agg(d order by d), '[]'::jsonb) from (
       select distinct (to_timestamp((data->>'start')::bigint / 1000.0) at time zone 'America/Sao_Paulo')::date d
       from ev where data->>'start' ~ '^[0-9]+$') y));
$$;
grant execute on function public.family_stats(uuid) to authenticated;
