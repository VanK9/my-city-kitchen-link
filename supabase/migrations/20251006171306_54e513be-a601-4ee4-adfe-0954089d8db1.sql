-- Fix 1: Restrict profiles table to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Fix 2: Make recipe-images storage bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'recipe-images';

-- Fix 3: Add storage RLS policies for recipe images

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload own recipe images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recipe-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own images
CREATE POLICY "Users can update own recipe images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'recipe-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete own recipe images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'recipe-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view images from recipes they have access to
CREATE POLICY "Users can view authorized recipe images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'recipe-images' AND
  (
    -- Own images
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- Images from public recipes
    EXISTS (
      SELECT 1 FROM public.recipes r
      JOIN public.recipe_images ri ON ri.recipe_id = r.id
      WHERE ri.image_url = name
      AND r.sharing_type = 'public'
    )
    OR
    -- Images from recipes they authored
    EXISTS (
      SELECT 1 FROM public.recipes r
      JOIN public.recipe_images ri ON ri.recipe_id = r.id
      WHERE ri.image_url = name
      AND r.author_id = auth.uid()
    )
    OR
    -- Images from paid recipes they purchased
    EXISTS (
      SELECT 1 FROM public.recipes r
      JOIN public.recipe_images ri ON ri.recipe_id = r.id
      WHERE ri.image_url = name
      AND r.sharing_type = 'paid'
      AND EXISTS (
        SELECT 1 FROM public.recipe_purchases rp
        WHERE rp.recipe_id = r.id AND rp.buyer_id = auth.uid()
      )
    )
  )
);