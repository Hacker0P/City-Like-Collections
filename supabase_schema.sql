-- Run this command in your Supabase SQL Editor to add the missing columns for the new profile features

ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS owner_name text,
ADD COLUMN IF NOT EXISTS whatsapp_number text,
ADD COLUMN IF NOT EXISTS mobile_number text,
ADD COLUMN IF NOT EXISTS instagram_url text,
ADD COLUMN IF NOT EXISTS facebook_url text,
ADD COLUMN IF NOT EXISTS youtube_url text;

-- Optional: Add comments for clarity
COMMENT ON COLUMN public.store_settings.owner_name IS 'Name of the shop owner';
COMMENT ON COLUMN public.store_settings.whatsapp_number IS 'Primary WhatsApp number for receiving orders';
COMMENT ON COLUMN public.store_settings.mobile_number IS 'Alternate mobile number for calls';
COMMENT ON COLUMN public.store_settings.instagram_url IS 'Instagram profile link';
COMMENT ON COLUMN public.store_settings.facebook_url IS 'Facebook page link';
COMMENT ON COLUMN public.store_settings.youtube_url IS 'YouTube channel link';
