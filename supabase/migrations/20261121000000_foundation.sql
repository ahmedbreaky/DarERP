-- =============================================================================
-- DarERP foundation: user profiles, roles, permissions, Row Level Security.
--
-- How it works
--   * Every Supabase Auth user gets a row in public.profiles (via trigger).
--   * The FIRST user to sign up becomes an active admin.
--   * Everyone after that signs up as an INACTIVE "staff" user and must be
--     approved (activated) by someone with the users.manage permission.
--   * Each role has a set of permissions (public.role_permissions).
--     Admins always have every permission.
--   * public.has_permission('...') is used by RLS policies and by the app.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type public.app_role as enum ('admin', 'manager', 'staff');

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  role        public.app_role not null default 'staff',
  is_active   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.profiles is 'One row per user. role + is_active control access.';

-- Catalogue of every permission the app knows about.
create table public.permissions (
  key         text primary key,
  module      text not null,
  sort_order  integer not null default 0
);

-- Which role has which permission. Admin is implicit (always everything).
create table public.role_permissions (
  role        public.app_role not null,
  permission  text not null references public.permissions (key) on delete cascade,
  primary key (role, permission),
  constraint role_permissions_not_admin check (role <> 'admin')
);

-- ---------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER so RLS policies can call them without
-- recursing into the profiles policies).
-- ---------------------------------------------------------------------------
create or replace function public.has_permission(perm text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.is_active
      and (
        p.role = 'admin'
        or exists (
          select 1 from public.role_permissions rp
          where rp.role = p.role and rp.permission = perm
        )
      )
  );
$$;

-- Permissions of the signed-in user (empty when inactive or signed out).
create or replace function public.my_permissions()
returns setof text
language sql
stable
security definer
set search_path = ''
as $$
  select perm.key
  from public.profiles p
  cross join public.permissions perm
  where p.id = (select auth.uid())
    and p.is_active
    and (
      p.role = 'admin'
      or exists (
        select 1 from public.role_permissions rp
        where rp.role = p.role and rp.permission = perm.key
      )
    )
  order by perm.sort_order, perm.key;
$$;

revoke execute on function public.has_permission(text) from public, anon;
revoke execute on function public.my_permissions() from public, anon;
grant execute on function public.has_permission(text) to authenticated;
grant execute on function public.my_permissions() to authenticated;

-- ---------------------------------------------------------------------------
-- Trigger: create a profile when a user signs up.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  is_first_user boolean;
begin
  -- Serialise sign-ups so two "first" users can't both become admin.
  lock table public.profiles in share row exclusive mode;
  select not exists (select 1 from public.profiles) into is_first_user;

  insert into public.profiles (id, email, full_name, role, is_active)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case when is_first_user then 'admin'::public.app_role else 'staff'::public.app_role end,
    is_first_user
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep profiles.email in sync when a user changes their email.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = coalesce(new.email, '') where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

-- ---------------------------------------------------------------------------
-- Trigger: guard sensitive profile columns.
--   * Only users.manage may change role / is_active.
--   * email and id are never changed from the API.
--   * The last active admin can't be demoted or deactivated.
-- Calls made without a signed-in user (SQL editor, service role) are trusted.
-- ---------------------------------------------------------------------------
create or replace function public.guard_profile_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();

  if (select auth.uid()) is null then
    return new;
  end if;

  if new.id <> old.id or new.email <> old.email or new.created_at <> old.created_at then
    raise exception 'profile_readonly_field' using errcode = '42501';
  end if;

  if (new.role <> old.role or new.is_active <> old.is_active) then
    if not public.has_permission('users.manage') then
      raise exception 'not_allowed' using errcode = '42501';
    end if;

    if old.role = 'admin' and old.is_active
       and (new.role <> 'admin' or not new.is_active)
       and not exists (
         select 1 from public.profiles
         where role = 'admin' and is_active and id <> old.id
       ) then
      raise exception 'last_admin' using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

create trigger guard_profile_update
  before update on public.profiles
  for each row execute function public.guard_profile_update();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;

-- profiles: see yourself, or everyone if you have users.view
create policy "profiles_select" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.has_permission('users.view')));

-- profiles: edit yourself (name only - the trigger blocks the rest),
-- or anyone if you have users.manage
create policy "profiles_update" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or (select public.has_permission('users.manage')))
  with check (id = (select auth.uid()) or (select public.has_permission('users.manage')));

-- No insert/delete policies: rows are created by the sign-up trigger and
-- removed when the auth user is deleted.

create policy "permissions_select" on public.permissions
  for select to authenticated
  using (true);

create policy "role_permissions_select" on public.role_permissions
  for select to authenticated
  using (true);

create policy "role_permissions_insert" on public.role_permissions
  for insert to authenticated
  with check ((select public.has_permission('roles.manage')));

create policy "role_permissions_delete" on public.role_permissions
  for delete to authenticated
  using ((select public.has_permission('roles.manage')));

-- Anonymous visitors get nothing.
revoke all on public.profiles, public.permissions, public.role_permissions from anon;

-- ---------------------------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------------------------
insert into public.permissions (key, module, sort_order) values
  ('users.view',   'users', 10),
  ('users.manage', 'users', 20),
  ('roles.manage', 'roles', 30);

insert into public.role_permissions (role, permission) values
  ('manager', 'users.view');
