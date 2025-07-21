-- Enable necessary extensions
create extension if not exists "http" with schema extensions;

-- Create custom claims function for Clerk integration
create or replace function auth.uid() returns uuid
language sql stable
as $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim.sub', true), ''),
        (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    )::uuid;
$$;

-- Create tables with proper structure for Clerk integration
create table if not exists public.users (
  id uuid references auth.users not null primary key,
  email text unique,
  first_name text,
  last_name text,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.agents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  system_prompt text not null,
  avatar_url text,
  model_config jsonb default '{
    "model": "gpt-4",
    "temperature": 0.7,
    "max_tokens": 1000,
    "top_p": 1
  }'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  agent_id uuid references public.agents(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.agents enable row level security;
alter table public.chat_messages enable row level security;

-- Create RLS policies using auth.uid()
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can view own agents" on public.agents
  for select using (auth.uid() = user_id);

create policy "Users can create own agents" on public.agents
  for insert with check (auth.uid() = user_id);

create policy "Users can update own agents" on public.agents
  for update using (auth.uid() = user_id);

create policy "Users can delete own agents" on public.agents
  for delete using (auth.uid() = user_id);

create policy "Users can view messages for own agents" on public.chat_messages
  for select using (
    exists (
      select 1 from public.agents
      where agents.id = chat_messages.agent_id
      and agents.user_id = auth.uid()
    )
  );

create policy "Users can create messages for own agents" on public.chat_messages
  for insert with check (
    exists (
      select 1 from public.agents
      where agents.id = chat_messages.agent_id
      and agents.user_id = auth.uid()
    )
  );

-- Create indexes for performance
create index if not exists agents_user_id_idx on public.agents(user_id);
create index if not exists chat_messages_agent_id_idx on public.chat_messages(agent_id);
create index if not exists chat_messages_created_at_idx on public.chat_messages(created_at);

-- Create function to handle user creation from Clerk webhook
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, first_name, last_name, image_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'image_url'
  );
  return new;
end;
$$;

-- Create trigger for new user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create function to sync updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Create triggers for updated_at
create trigger users_updated_at before update on public.users
  for each row execute procedure public.handle_updated_at();

create trigger agents_updated_at before update on public.agents
  for each row execute procedure public.handle_updated_at();