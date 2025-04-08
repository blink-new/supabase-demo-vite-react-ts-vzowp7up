
-- Create profiles table
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    created_at timestamptz default timezone('utc'::text, now()) not null,
    updated_at timestamptz default timezone('utc'::text, now()),
    avatar_url text,
    user_id uuid not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone."
    on profiles for select
    using ( true );

create policy "Users can insert their own profile."
    on profiles for insert
    with check ( auth.uid() = id );

create policy "Users can update own profile."
    on profiles for update
    using ( auth.uid() = id );

-- Create indexes for better performance
create index if not exists profiles_user_id_idx on public.profiles(user_id);

-- Set up Row Level Security (RLS)
alter table public.profiles force row level security;

-- Grant necessary permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all privileges on public.profiles to postgres, anon, authenticated, service_role;