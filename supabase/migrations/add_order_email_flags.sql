alter table public.orders
  add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  add column if not exists email_order_confirmation_sent boolean default false not null,
  add column if not exists email_payment_confirmed_sent boolean default false not null,
  add column if not exists email_shipped_sent boolean default false not null;

