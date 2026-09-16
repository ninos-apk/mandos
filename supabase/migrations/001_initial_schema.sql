create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null default '',
  role text not null default 'viewer' check (role in ('viewer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create table if not exists public.site_settings (
  id text primary key default 'main',
  restaurant_name text not null,
  tagline text not null,
  about_title text not null,
  about_text text not null,
  phone_primary text not null,
  phone_secondary text not null default '',
  email text not null,
  street text not null,
  postal_code text not null,
  city text not null,
  maps_url text not null default '',
  instagram_url text not null default '',
  tiktok_url text not null default '',
  hero_path text not null,
  logo_path text not null,
  seo_title text not null,
  seo_description text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.opening_hours (
  day_index smallint primary key check (day_index between 1 and 20),
  label text not null,
  display_text text not null,
  is_closed boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.news_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  image_path text,
  image_alt text not null default '',
  is_pinned boolean not null default false,
  is_published boolean not null default false,
  publish_from timestamptz,
  publish_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (publish_until is null or publish_from is null or publish_until >= publish_from)
);

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('food', 'rooms')),
  image_path text not null unique,
  alt_text text not null default '',
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  seed_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.menu_documents (
  id text primary key default 'main',
  file_path text not null,
  original_name text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.legal_content (
  id text primary key default 'main',
  imprint text not null,
  privacy text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.seed_runs (
  id text primary key,
  completed_at timestamptz not null default now(),
  details jsonb not null default '{}'::jsonb
);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists site_settings_updated_at on public.site_settings;
create trigger site_settings_updated_at before update on public.site_settings
for each row execute function public.set_updated_at();

drop trigger if exists opening_hours_updated_at on public.opening_hours;
create trigger opening_hours_updated_at before update on public.opening_hours
for each row execute function public.set_updated_at();

drop trigger if exists news_posts_updated_at on public.news_posts;
create trigger news_posts_updated_at before update on public.news_posts
for each row execute function public.set_updated_at();

drop trigger if exists gallery_images_updated_at on public.gallery_images;
create trigger gallery_images_updated_at before update on public.gallery_images
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.opening_hours enable row level security;
alter table public.news_posts enable row level security;
alter table public.gallery_images enable row level security;
alter table public.menu_documents enable row level security;
alter table public.legal_content enable row level security;
alter table public.seed_runs enable row level security;

create policy "Profiles are visible to their owner"
on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "Admins manage profiles"
on public.profiles for all using (public.is_admin()) with check (public.is_admin());

create policy "Public reads site settings"
on public.site_settings for select using (true);
create policy "Admins manage site settings"
on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

create policy "Public reads opening hours"
on public.opening_hours for select using (true);
create policy "Admins manage opening hours"
on public.opening_hours for all using (public.is_admin()) with check (public.is_admin());

create policy "Public reads published news"
on public.news_posts for select using (
  is_published = true
  and (publish_from is null or publish_from <= now())
  and (publish_until is null or publish_until >= now())
);
create policy "Admins manage news"
on public.news_posts for all using (public.is_admin()) with check (public.is_admin());

create policy "Public reads visible gallery images"
on public.gallery_images for select using (is_visible = true);
create policy "Admins manage gallery images"
on public.gallery_images for all using (public.is_admin()) with check (public.is_admin());

create policy "Public reads menu document"
on public.menu_documents for select using (true);
create policy "Admins manage menu document"
on public.menu_documents for all using (public.is_admin()) with check (public.is_admin());

create policy "Public reads legal content"
on public.legal_content for select using (true);
create policy "Admins manage legal content"
on public.legal_content for all using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('menu', 'menu', true, 20971520, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public reads media"
on storage.objects for select using (bucket_id in ('media', 'menu'));
create policy "Admins upload files"
on storage.objects for insert with check (bucket_id in ('media', 'menu') and public.is_admin());
create policy "Admins update files"
on storage.objects for update using (bucket_id in ('media', 'menu') and public.is_admin());
create policy "Admins delete files"
on storage.objects for delete using (bucket_id in ('media', 'menu') and public.is_admin());

grant execute on function public.is_admin() to anon, authenticated;
