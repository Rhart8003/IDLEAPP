-- IDLE private-beta hardening
-- Booking mutations are server-side only during beta.
drop policy if exists bookings_update_party on public.bookings;
drop policy if exists bookings_insert_renter on public.bookings;
revoke insert, update, delete on public.bookings from authenticated;
grant select on public.bookings to authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id, display_name)
  values(new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email,''),'@',1)))
  on conflict(id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

insert into storage.buckets(id,name,public)
values('condition-photos','condition-photos',false)
on conflict(id) do nothing;

drop policy if exists condition_photos_select_own on storage.objects;
drop policy if exists condition_photos_insert_own on storage.objects;
drop policy if exists condition_photos_update_own on storage.objects;
drop policy if exists condition_photos_delete_own on storage.objects;

create policy condition_photos_select_own on storage.objects for select to authenticated
using(bucket_id='condition-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy condition_photos_insert_own on storage.objects for insert to authenticated
with check(bucket_id='condition-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy condition_photos_update_own on storage.objects for update to authenticated
using(bucket_id='condition-photos' and (storage.foldername(name))[1]=(select auth.uid())::text)
with check(bucket_id='condition-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy condition_photos_delete_own on storage.objects for delete to authenticated
using(bucket_id='condition-photos' and (storage.foldername(name))[1]=(select auth.uid())::text);