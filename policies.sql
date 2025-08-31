-- Enable RLS
alter table public.profiles enable row level security;
alter table public.rooms    enable row level security;
alter table public.posts    enable row level security;
alter table public.replies  enable row level security;
alter table public.reports  enable row level security;
alter table public.journal_entries enable row level security;

-- Profiles
create policy "read own profile" on public.profiles
  for select using ( auth.uid() = user_id );
create policy "insert own profile" on public.profiles
  for insert with check ( auth.uid() = user_id );
create policy "update own profile" on public.profiles
  for update using ( auth.uid() = user_id );

-- Rooms (public read)
create policy "rooms are readable" on public.rooms
  for select using ( true );
create policy "insert rooms (admin-only placeholder)" on public.rooms
  for insert to authenticated with check ( true ); -- tighten later

-- Posts
create policy "read posts" on public.posts
  for select using ( true ); -- public in MVP (auth not required if you prefer)
create policy "insert own posts" on public.posts
  for insert to authenticated with check ( auth.uid() = user_id );
create policy "update own posts" on public.posts
  for update to authenticated using ( auth.uid() = user_id );
create policy "delete own posts" on public.posts
  for delete to authenticated using ( auth.uid() = user_id );

-- Replies
create policy "read replies" on public.replies
  for select using ( true );
create policy "insert own replies" on public.replies
  for insert to authenticated with check ( auth.uid() = user_id );
create policy "update own replies" on public.replies
  for update to authenticated using ( auth.uid() = user_id );
create policy "delete own replies" on public.replies
  for delete to authenticated using ( auth.uid() = user_id );

-- Reports (only reporter can see theirs)
create policy "insert reports" on public.reports
  for insert to authenticated with check ( auth.uid() = reporter_id );
create policy "read own reports" on public.reports
  for select to authenticated using ( auth.uid() = reporter_id );

-- Journal (private)
create policy "read own journal" on public.journal_entries
  for select to authenticated using ( auth.uid() = user_id );
create policy "insert own journal" on public.journal_entries
  for insert to authenticated with check ( auth.uid() = user_id );
create policy "update own journal" on public.journal_entries
  for update to authenticated using ( auth.uid() = user_id );
create policy "delete own journal" on public.journal_entries
  for delete to authenticated using ( auth.uid() = user_id );
