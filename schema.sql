-- SCHEMA: Unmuted Voice MVP

-- Users are handled by Supabase Auth. We keep a profile table for extras.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamp with time zone default now()
);

-- Rooms (public in MVP)
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  is_private boolean default false,
  created_at timestamp with time zone default now()
);

-- Posts (voice-only in MVP)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  audio_path text not null, -- path in storage bucket (audio)
  duration_ms integer not null default 0,
  transcript text,
  created_at timestamp with time zone default now()
);

-- Replies (voice-only)
create table if not exists public.replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  audio_path text not null,
  duration_ms integer not null default 0,
  transcript text,
  created_at timestamp with time zone default now()
);

-- Reports
create type report_target as enum ('post','reply');
create type report_status as enum ('pending','actioned','dismissed');

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  target_type report_target not null,
  target_id uuid not null,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text,
  status report_status default 'pending',
  created_at timestamp with time zone default now()
);

-- Journal entries
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  mood int not null check (mood between 1 and 5),
  note text,
  audio_path text,
  created_at timestamp with time zone default now(),
  unique (user_id, entry_date)
);

-- Indexes
create index if not exists idx_posts_room_created on public.posts(room_id, created_at desc);
create index if not exists idx_replies_post_created on public.replies(post_id, created_at desc);
create index if not exists idx_journal_user_date on public.journal_entries(user_id, entry_date);
