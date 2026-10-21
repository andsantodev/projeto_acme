-- Acme Portal — seed dos três perfis de demonstração.
-- Pré-requisito: criar os usuários no painel do Supabase (Authentication > Users),
-- com e-mail confirmado, ANTES de rodar este script.
-- Executar pelo MCP do Supabase ou pelo SQL Editor do projeto Supabase compartilhado.

insert into public.acme_profiles (id, role, category, display_name)
select u.id, 'colaborador', null, 'Ana Souza'
from auth.users u
where u.email = 'ana@acme.demo'
on conflict (id) do update
  set role = excluded.role,
      category = excluded.category,
      display_name = excluded.display_name;

insert into public.acme_profiles (id, role, category, display_name)
select u.id, 'atendente', 'ti', 'Bruno Lima (TI)'
from auth.users u
where u.email = 'ti@acme.demo'
on conflict (id) do update
  set role = excluded.role,
      category = excluded.category,
      display_name = excluded.display_name;

insert into public.acme_profiles (id, role, category, display_name)
select u.id, 'atendente', 'rh', 'Carla Mendes (RH)'
from auth.users u
where u.email = 'rh@acme.demo'
on conflict (id) do update
  set role = excluded.role,
      category = excluded.category,
      display_name = excluded.display_name;

-- Conferência: deve retornar 3 linhas com role/category corretos.
select p.display_name, p.role, p.category, u.email
from public.acme_profiles p
join auth.users u on u.id = p.id
order by p.role, p.category nulls first;
