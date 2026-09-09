-- =====================================================================
-- IoAtleta — tabella dei profili e regole di accesso
--
-- Da incollare nell'editor SQL di Supabase ed eseguire una volta sola.
-- SENZA QUESTO FILE il database è aperto: la chiave anon è pubblica e
-- sta nel codice, quindi è la Row Level Security a decidere chi legge
-- cosa. È il passaggio da non saltare.
-- =====================================================================

create table if not exists public.profili (
  id            uuid primary key references auth.users(id) on delete cascade,
  dati          jsonb       not null default '{}'::jsonb,
  creato_il     timestamptz not null default now(),
  aggiornato_il timestamptz not null default now()
);

comment on table  public.profili is 'Un profilo IoAtleta per utente: tutto lo stato dell''app in un unico documento.';
comment on column public.profili.dati is 'Stato completo dell''app: profilo, misure, sedute, calendario, preferenze.';

-- ---------------------------------------------------------------------
-- L'orario lo mette il database, non il client: un telefono con la data
-- sbagliata vincerebbe ogni confronto e cancellerebbe il lavoro fatto
-- da un altro dispositivo.
-- ---------------------------------------------------------------------
create or replace function public.tocca_aggiornato_il()
returns trigger
language plpgsql
as $$
begin
  new.aggiornato_il = now();
  return new;
end;
$$;

drop trigger if exists profili_tocca on public.profili;
create trigger profili_tocca
  before update on public.profili
  for each row execute function public.tocca_aggiornato_il();

-- ---------------------------------------------------------------------
-- Row Level Security: ognuno vede e tocca soltanto la propria riga.
-- auth.uid() è l'utente che ha fatto l'accesso; senza accesso è null e
-- non corrisponde a nessun id, quindi non passa niente.
-- ---------------------------------------------------------------------
alter table public.profili enable row level security;

drop policy if exists "profili: leggo la mia riga"     on public.profili;
drop policy if exists "profili: creo la mia riga"      on public.profili;
drop policy if exists "profili: aggiorno la mia riga"  on public.profili;
drop policy if exists "profili: cancello la mia riga"  on public.profili;

create policy "profili: leggo la mia riga"
  on public.profili for select
  using (auth.uid() = id);

create policy "profili: creo la mia riga"
  on public.profili for insert
  with check (auth.uid() = id);

create policy "profili: aggiorno la mia riga"
  on public.profili for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profili: cancello la mia riga"
  on public.profili for delete
  using (auth.uid() = id);

-- ---------------------------------------------------------------------
-- Verifica: dopo aver eseguito, questa riga deve restituire true.
-- ---------------------------------------------------------------------
-- select relrowsecurity from pg_class where oid = 'public.profili'::regclass;
