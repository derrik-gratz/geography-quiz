create table public.users (
  id uuid not null default auth.uid (),
  username character varying null,
  constraint users_pkey primary key (id),
  constraint users_username_key unique (username)
) TABLESPACE pg_default;