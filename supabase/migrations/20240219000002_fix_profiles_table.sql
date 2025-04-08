
-- Remove redundant user_id column and update policies
alter table public.profiles drop column user_id;

-- Drop existing policies
drop policy if exists "Public profiles are viewable by everyone." on profiles;
drop policy if exists "Users can insert their own profile." on profiles;
drop policy if exists "Users can update own profile." on profiles;

-- Create clearer policies
create policy "Profiles are viewable by everyone."
    on profiles for select
    using ( true );

create policy "Users can insert their own profile."
    on profiles for insert
    with check ( auth.uid() = id );

create policy "Users can update their own profile."
    on profiles for update
    using ( auth.uid() = id );

create policy "Users can delete their own profile."
    on profiles for delete
    using ( auth.uid() = id );