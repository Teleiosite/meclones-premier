
-- Fix mutable search_path on set_updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Lock down trigger-only functions: revoke from API roles
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

-- has_role: keep callable by authenticated (needed in RLS), revoke from anon/public
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
