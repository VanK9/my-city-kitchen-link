-- Create storage bucket for profile avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for tutorial images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tutorial-images',
  'tutorial-images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- RLS policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policies for tutorial-images bucket
CREATE POLICY "Tutorial images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'tutorial-images');

CREATE POLICY "Authenticated users can upload tutorial images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tutorial-images' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own tutorial images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'tutorial-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own tutorial images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tutorial-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);