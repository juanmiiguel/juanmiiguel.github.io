-- Run in Supabase SQL Editor. Public menus; private editing by owner.
create extension if not exists pgcrypto;
create table if not exists public.restaurants (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null unique references auth.users(id) on delete cascade,
 name text not null check (length(name) between 2 and 70),
 intro text not null default '',
 slug text not null unique check (slug ~ '^[a-z0-9-]{3,50}$')
);
create table if not exists public.products (
 id uuid primary key default gen_random_uuid(),
 restaurant_id uuid not null references public.restaurants(id) on delete cascade,
 category text not null, name text not null,
 price numeric(10,2) not null check(price>=0),
 description text not null default '', allergens text not null default '',
 photo_path text, sort_order integer not null default 0
);
alter table public.restaurants enable row level security;
alter table public.products enable row level security;
create policy "Public read restaurants" on public.restaurants for select using(true);
create policy "Owner create restaurant" on public.restaurants for insert to authenticated with check(owner_id=(select auth.uid()));
create policy "Owner update restaurant" on public.restaurants for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy "Public read products" on public.products for select using(true);
create policy "Owner create products" on public.products for insert to authenticated with check(exists(select 1 from public.restaurants r where r.id=restaurant_id and r.owner_id=(select auth.uid())));
create policy "Owner update products" on public.products for update to authenticated using(exists(select 1 from public.restaurants r where r.id=restaurant_id and r.owner_id=(select auth.uid()))) with check(exists(select 1 from public.restaurants r where r.id=restaurant_id and r.owner_id=(select auth.uid())));
create policy "Owner delete products" on public.products for delete to authenticated using(exists(select 1 from public.restaurants r where r.id=restaurant_id and r.owner_id=(select auth.uid())));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('menu-photos','menu-photos',true,250000,array['image/webp'])
on conflict(id) do nothing;
create policy "Public view menu photos" on storage.objects for select using(bucket_id='menu-photos');
create policy "Owner upload menu photos" on storage.objects for insert to authenticated with check(bucket_id='menu-photos' and (storage.foldername(name))[1]=(select auth.uid())::text and lower(storage.extension(name))='webp');
create policy "Owner remove menu photos" on storage.objects for delete to authenticated using(bucket_id='menu-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
