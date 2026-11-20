-- Supabase Schema for NotesApp
-- Copy and run this in your Supabase Project's SQL Editor

-- 1. Create notes table
create table if not exists public.notes (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default '',
  icon text default '📝',
  cover_image text,
  is_pinned boolean default false,
  is_archived boolean default false,
  is_trash boolean default false,
  parent_id text references public.notes(id) on delete set null,
  blocks jsonb not null default '[]'::jsonb,
  tags text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.notes enable row level security;

-- 3. Create security policies: Users can only see, insert, update, delete their own notes
create policy "Users can view their own notes"
  on public.notes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own notes"
  on public.notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own notes"
  on public.notes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own notes"
  on public.notes for delete
  using (auth.uid() = user_id);

-- 4. Automatically set updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trigger_notes_updated_at
  before update on public.notes
  for each row execute function public.handle_updated_at();
