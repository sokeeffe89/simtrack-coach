create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique not null,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists tracks (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  country text,
  length_km numeric,
  sims text[] not null default '{}',
  classes text[] not null default '{}',
  lap_focus text,
  ai_hint text,
  created_at timestamptz not null default now()
);
