-- Additional auth utility functions for PersonaForge
-- Run this migration after the initial Clerk integration

-- Function to check if current user is authenticated
create or replace function auth.is_authenticated() returns boolean
language sql stable
as $$
  select auth.uid() is not null;
$$;

-- Function to get current user's email from JWT claims
create or replace function auth.email() returns text
language sql stable
as $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim.email', true), ''),
        (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
    );
$$;

-- Function to check if current user owns a specific agent
create or replace function auth.user_owns_agent(agent_uuid uuid) returns boolean
language sql stable
as $$
  select exists(
    select 1 from public.agents 
    where id = agent_uuid 
    and user_id = auth.uid()
  );
$$;

-- Function to check if current user can access a specific chat message
create or replace function auth.user_can_access_message(message_uuid uuid) returns boolean
language sql stable
as $$
  select exists(
    select 1 from public.chat_messages cm
    join public.agents a on a.id = cm.agent_id
    where cm.id = message_uuid 
    and a.user_id = auth.uid()
  );
$$;

-- Function to get current user's full profile
create or replace function auth.user_profile() returns public.users
language sql stable
as $$
  select * from public.users where id = auth.uid();
$$;

-- Custom type for user context
create type user_context_type as (
  authenticated boolean,
  user_id uuid,
  email text,
  profile public.users
);

-- Function returning custom object/record type
create or replace function public.get_current_user_context() 
returns user_context_type
language plpgsql
security invoker
as $$
declare
  result user_context_type;
begin
  -- Check if user is authenticated
  if auth.uid() is null then
    result.authenticated := false;
    result.user_id := null;
    result.email := null;
    result.profile := null;
    return result;
  end if;
  
  -- Build authenticated user context
  result.authenticated := true;
  result.user_id := auth.uid();
  result.email := auth.email();
  
  -- Get user profile
  select * into result.profile 
  from public.users 
  where id = auth.uid();
  
  return result;
end;
$$;

-- Alternative: Function returning table row directly
create or replace function public.get_current_user_profile() 
returns public.users
language sql
security invoker
as $$
  select * from public.users where id = auth.uid();
$$;

-- Alternative: Function returning setof (multiple rows)
create or replace function public.get_user_agents() 
returns setof public.agents
language sql
security invoker
as $$
  select * from public.agents where user_id = auth.uid();
$$;

-- Alternative: Function returning table with multiple columns
create or replace function public.get_user_stats() 
returns table(
  user_id uuid,
  email text,
  agent_count bigint,
  message_count bigint,
  created_at timestamptz
)
language plpgsql
security invoker
as $$
begin
  return query
  select 
    u.id,
    u.email,
    count(distinct a.id) as agent_count,
    count(distinct cm.id) as message_count,
    u.created_at
  from public.users u
  left join public.agents a on a.user_id = u.id
  left join public.chat_messages cm on cm.agent_id = a.id
  where u.id = auth.uid()
  group by u.id, u.email, u.created_at;
end;
$$; 