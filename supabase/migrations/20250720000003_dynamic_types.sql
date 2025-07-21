-- Dynamic/Unknown Type Functions for PersonaForge
-- For cases where return type is not known ahead of time

-- 1. RECORD type - Generic record when structure is unknown
create or replace function public.get_dynamic_data(table_name text, record_id uuid)
returns record
language plpgsql
security invoker
as $$
declare
  result record;
begin
  -- Dynamic query execution
  execute format('SELECT * FROM %I WHERE id = $1', table_name) 
  into result 
  using record_id;
  
  return result;
end;
$$;

-- 2. JSON/JSONB - Most flexible for completely unknown structures
create or replace function public.get_flexible_data(table_name text, filters jsonb default '{}')
returns jsonb
language plpgsql
security invoker
as $$
declare
  result jsonb;
  where_clause text := '';
  key text;
  value text;
begin
  -- Build dynamic WHERE clause from JSON filters
  if jsonb_typeof(filters) = 'object' and jsonb_object_keys(filters) is not null then
    for key in select jsonb_object_keys(filters) loop
      if where_clause != '' then
        where_clause := where_clause || ' AND ';
      end if;
      where_clause := where_clause || format('%I = %L', key, filters->>key);
    end loop;
    
    if where_clause != '' then
      where_clause := ' WHERE ' || where_clause;
    end if;
  end if;
  
  -- Execute dynamic query and return as JSON
  execute format('SELECT jsonb_agg(row_to_json(t)) FROM %I t%s', table_name, where_clause)
  into result;
  
  return coalesce(result, '[]'::jsonb);
end;
$$;

-- 3. ANYELEMENT - Polymorphic function (accepts any single type)
create or replace function public.safe_cast(input_value anyelement, default_value anyelement)
returns anyelement
language plpgsql
security invoker
as $$
begin
  return coalesce(input_value, default_value);
exception
  when others then
    return default_value;
end;
$$;

-- 4. TEXT - For completely unknown content
create or replace function public.get_serialized_data(table_name text, record_id uuid, format_type text default 'json')
returns text
language plpgsql
security invoker
as $$
declare
  result text;
begin
  case format_type
    when 'json' then
      execute format('SELECT row_to_json(t) FROM %I t WHERE id = $1', table_name)
      into result
      using record_id;
      
    when 'xml' then
      execute format('SELECT row_to_xml(t) FROM %I t WHERE id = $1', table_name)
      into result
      using record_id;
      
    when 'csv' then
      -- Simple CSV representation
      execute format('SELECT string_agg(value::text, '','') FROM (SELECT unnest(array[t.*]) as value FROM %I t WHERE id = $1) sub', table_name)
      into result
      using record_id;
      
    else
      result := 'Unknown format';
  end case;
  
  return result;
end;
$$;

-- 5. SETOF RECORD - Multiple unknown records
create or replace function public.search_all_tables(search_term text)
returns setof record
language plpgsql
security invoker
as $$
declare
  table_record record;
  query_text text;
begin
  -- Search across user's tables
  for table_record in 
    select table_name 
    from information_schema.tables 
    where table_schema = 'public' 
    and table_name in ('users', 'agents', 'chat_messages')
  loop
    -- Build dynamic search query
    query_text := format(
      'SELECT ''%s'' as table_name, * FROM %I WHERE user_id = auth.uid() AND cast(row_to_json(%I) as text) ILIKE ''%%%s%%''',
      table_record.table_name,
      table_record.table_name,
      table_record.table_name,
      search_term
    );
    
    -- Return results from this table
    return query execute query_text;
  end loop;
  
  return;
end;
$$;

-- 6. Variadic function - Variable number of arguments
create or replace function public.build_dynamic_object(variadic key_values text[])
returns jsonb
language plpgsql
security invoker
as $$
declare
  result jsonb := '{}';
  i integer;
begin
  -- Must have even number of arguments (key-value pairs)
  if array_length(key_values, 1) % 2 != 0 then
    raise exception 'Must provide even number of arguments (key-value pairs)';
  end if;
  
  -- Build JSON object from key-value pairs
  for i in 1..array_length(key_values, 1) by 2 loop
    result := result || jsonb_build_object(key_values[i], key_values[i + 1]);
  end loop;
  
  return result;
end;
$$;

-- 7. Function returning refcursor (for very large unknown datasets)
create or replace function public.get_cursor_data(table_name text, filter_conditions text default '')
returns refcursor
language plpgsql
security invoker
as $$
declare
  ref refcursor;
  query_text text;
begin
  open ref for execute format(
    'SELECT * FROM %I WHERE user_id = auth.uid() %s',
    table_name,
    case when filter_conditions != '' then 'AND ' || filter_conditions else '' end
  );
  
  return ref;
end;
$$; 