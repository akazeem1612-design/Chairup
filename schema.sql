-- ============================================================
-- ChairUp Database Schema  (safe to re-run at any time)
-- Paste into: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- ── 1. PROFILES (extends Supabase auth.users) ──────────────
create table if not exists public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  full_name        text,
  role             text not null default 'renter' check (role in ('renter', 'host', 'both')),
  avatar_url       text,
  bio              text,
  phone            text,
  city             text,
  license_verified boolean default false,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- Auto-create profile when user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'renter')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Trigger (drop first so re-runs don't fail)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 2. LISTINGS ────────────────────────────────────────────
create table if not exists public.listings (
  id            uuid primary key default gen_random_uuid(),
  host_id       uuid references public.profiles(id) on delete cascade not null,
  title         text not null,
  type          text not null check (type in ('barber', 'salon', 'nail', 'spa', 'lash')),
  description   text,
  address       text,
  city          text,
  state         text,
  latitude      numeric(9,6),
  longitude     numeric(9,6),
  price_hourly  numeric(8,2) not null,
  price_daily   numeric(8,2),
  seats         integer default 1,
  min_booking   text default '1 hour',
  policy        text default 'instant' check (policy in ('instant', 'manual')),
  amenities     text[] default '{}',
  images        text[] default '{}',
  is_active     boolean default true,
  rating        numeric(3,2) default 0,
  review_count  integer default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── 3. AVAILABILITY ────────────────────────────────────────
create table if not exists public.availability (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid references public.listings(id) on delete cascade not null,
  day_of_week text not null check (day_of_week in ('monday','tuesday','wednesday','thursday','friday','saturday','sunday')),
  open_time   time not null default '09:00',
  close_time  time not null default '18:00',
  is_open     boolean default true
);

-- ── 4. BOOKINGS ────────────────────────────────────────────
create table if not exists public.bookings (
  id            uuid primary key default gen_random_uuid(),
  listing_id    uuid references public.listings(id) on delete restrict not null,
  renter_id     uuid references public.profiles(id) on delete restrict not null,
  booking_date  date not null,
  time_slot     text not null,
  hours         integer not null default 2,
  total_price   numeric(8,2) not null,
  service_fee   numeric(8,2) not null,
  status        text default 'confirmed' check (status in ('pending','confirmed','cancelled','completed')),
  notes         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Prevent double-booking same slot
create unique index if not exists bookings_no_overlap
  on public.bookings (listing_id, booking_date, time_slot)
  where status not in ('cancelled');

-- ── 5. REVIEWS ─────────────────────────────────────────────
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid references public.listings(id) on delete cascade not null,
  booking_id  uuid references public.bookings(id) on delete cascade not null unique,
  reviewer_id uuid references public.profiles(id) on delete cascade not null,
  rating      integer not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz default now()
);

-- Auto-update listing rating when review is added/deleted
create or replace function update_listing_rating()
returns trigger language plpgsql as $$
begin
  update public.listings
  set
    rating = (select round(avg(rating)::numeric, 2) from public.reviews
              where listing_id = coalesce(new.listing_id, old.listing_id)),
    review_count = (select count(*) from public.reviews
                    where listing_id = coalesce(new.listing_id, old.listing_id))
  where id = coalesce(new.listing_id, old.listing_id);
  return new;
end;
$$;

drop trigger if exists on_review_change on public.reviews;
create trigger on_review_change
  after insert or delete on public.reviews
  for each row execute procedure update_listing_rating();

-- ── 6. FAVORITES ───────────────────────────────────────────
create table if not exists public.favorites (
  user_id    uuid references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, listing_id)
);

-- ── 7. ROW LEVEL SECURITY ──────────────────────────────────
alter table public.profiles     enable row level security;
alter table public.listings     enable row level security;
alter table public.availability enable row level security;
alter table public.bookings     enable row level security;
alter table public.reviews      enable row level security;
alter table public.favorites    enable row level security;

-- Profiles
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Public profiles readable' and tablename = 'profiles') then
    create policy "Public profiles readable" on public.profiles for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users update own profile' and tablename = 'profiles') then
    create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
  end if;
end $$;

-- Listings
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Active listings readable' and tablename = 'listings') then
    create policy "Active listings readable" on public.listings for select using (is_active = true or host_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Hosts manage own listings' and tablename = 'listings') then
    create policy "Hosts manage own listings" on public.listings for insert with check (auth.uid() = host_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Hosts update own listings' and tablename = 'listings') then
    create policy "Hosts update own listings" on public.listings for update using (auth.uid() = host_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Hosts delete own listings' and tablename = 'listings') then
    create policy "Hosts delete own listings" on public.listings for delete using (auth.uid() = host_id);
  end if;
end $$;

-- Availability
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Availability readable' and tablename = 'availability') then
    create policy "Availability readable" on public.availability for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Hosts manage availability' and tablename = 'availability') then
    create policy "Hosts manage availability" on public.availability for all using (
      auth.uid() = (select host_id from public.listings where id = listing_id)
    );
  end if;
end $$;

-- Bookings
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Renters see own bookings' and tablename = 'bookings') then
    create policy "Renters see own bookings" on public.bookings for select using (
      auth.uid() = renter_id or
      auth.uid() = (select host_id from public.listings where id = listing_id)
    );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Renters create bookings' and tablename = 'bookings') then
    create policy "Renters create bookings" on public.bookings for insert with check (auth.uid() = renter_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Renters cancel own bookings' and tablename = 'bookings') then
    create policy "Renters cancel own bookings" on public.bookings for update using (auth.uid() = renter_id);
  end if;
end $$;

-- Reviews
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Reviews readable' and tablename = 'reviews') then
    create policy "Reviews readable" on public.reviews for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Reviewers insert own' and tablename = 'reviews') then
    create policy "Reviewers insert own" on public.reviews for insert with check (auth.uid() = reviewer_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Reviewers update own' and tablename = 'reviews') then
    create policy "Reviewers update own" on public.reviews for update using (auth.uid() = reviewer_id);
  end if;
end $$;

-- Favorites
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Users manage own favorites' and tablename = 'favorites') then
    create policy "Users manage own favorites" on public.favorites for all using (auth.uid() = user_id);
  end if;
end $$;

-- ── 8. STORAGE (safe insert) ───────────────────────────────
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict do nothing;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Public can view images' and tablename = 'objects') then
    create policy "Public can view images" on storage.objects for select using (bucket_id = 'listing-images');
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Authenticated users upload images' and tablename = 'objects') then
    create policy "Authenticated users upload images" on storage.objects for insert with check (
      bucket_id = 'listing-images' and auth.role() = 'authenticated'
    );
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users delete own images' and tablename = 'objects') then
    create policy "Users delete own images" on storage.objects for delete using (
      bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]
    );
  end if;
end $$;

-- ── Done! ──────────────────────────────────────────────────
-- Tables: profiles, listings, availability, bookings, reviews, favorites
-- To verify: go to Table Editor in Supabase and you should see all 6 tables.
