
-- Create tasks table
create table if not exists public.tasks (
    id uuid default gen_random_uuid() primary key,
    created_at timestamptz default timezone('utc'::text, now()) not null,
    title text not null,
    is_complete boolean default false,
    user_id uuid not null references auth.users(id) on delete cascade
);

-- Enable RLS
alter table public.tasks enable row level security;

-- Create policies
create policy "Users can view their own tasks."
    on tasks for select
    using ( auth.uid() = user_id );

create policy "Users can create their own tasks."
    on tasks for insert
    with check ( auth.uid() = user_id );

create policy "Users can update their own tasks."
    on tasks for update
    using ( auth.uid() = user_id );

create policy "Users can delete their own tasks."
    on tasks for delete
    using ( auth.uid() = user_id );

-- Create indexes for better performance
create index if not exists tasks_user_id_idx on public.tasks(user_id);
create index if not exists tasks_created_at_idx on public.tasks(created_at);

-- Set up Row Level Security (RLS)
alter table public.tasks force row level security;

-- Grant necessary permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all privileges on public.tasks to postgres, anon, authenticated, service_role;