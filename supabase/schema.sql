-- No Catch v1 schema (Supabase/Postgres)

create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  date_pst date not null unique,
  title text not null,
  description text not null default '',
  image_urls jsonb not null default '[]'::jsonb,
  is_open boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.subscribers (
  email text primary key,
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz null
);

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  date_pst date not null,
  email text not null,
  first_name text null,
  state text null,
  display_name text not null,
  display_state text not null,
  created_at timestamptz not null default now(),
  constraint entries_unique_email_per_day unique (date_pst, email)
);

create index if not exists entries_date_idx on public.entries(date_pst);
create index if not exists entries_email_idx on public.entries(email);

create table if not exists public.winners (
  id uuid primary key default gen_random_uuid(),
  date_pst date not null unique,
  item_id uuid null references public.items(id) on delete set null,
  email text not null,
  display_name text not null,
  display_state text not null,
  picked_at timestamptz not null default now(),
  notified_at timestamptz null,
  shipping_status text not null default 'pending',
  shipping_address jsonb null,
  created_at timestamptz not null default now()
);

-- A convenience view used by the public winners page.
-- Includes a thumbnail (first image) and entry count for that day.
create or replace view public.winners_view as
select
  w.date_pst,
  w.display_name,
  w.display_state,
  w.picked_at,
  i.title as item_title,
  (case
    when jsonb_typeof(i.image_urls) = 'array' and jsonb_array_length(i.image_urls) > 0
      then (i.image_urls->>0)
    else null
  end) as item_image_url,
  (select count(*)::int from public.entries e where e.date_pst = w.date_pst) as entries_count
from public.winners w
left join public.items i on i.id = w.item_id;

