-- Run this command in your Supabase SQL Editor to add the missing columns for contact settings

ALTER TABLE public.store_settings 
ADD COLUMN IF NOT EXISTS whatsapp_number text, 
ADD COLUMN IF NOT EXISTS alternate_number text;

-- Optional: Update the comment/description if supported
COMMENT ON COLUMN public.store_settings.whatsapp_number IS 'Primary WhatsApp number for receiving orders';
COMMENT ON COLUMN public.store_settings.alternate_number IS 'Alternate mobile number for contact';
