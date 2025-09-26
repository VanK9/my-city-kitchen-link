-- Add new columns to recipes table for enhanced features
ALTER TABLE public.recipes 
ADD COLUMN IF NOT EXISTS sharing_type text DEFAULT 'private' CHECK (sharing_type IN ('private', 'public', 'paid')),
ADD COLUMN IF NOT EXISTS spread_price integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS calories integer,
ADD COLUMN IF NOT EXISTS protein numeric,
ADD COLUMN IF NOT EXISTS carbs numeric,
ADD COLUMN IF NOT EXISTS fats numeric,
ADD COLUMN IF NOT EXISTS fiber numeric,
ADD COLUMN IF NOT EXISTS tags text[],
ADD COLUMN IF NOT EXISTS cuisine_type text,
ADD COLUMN IF NOT EXISTS meal_type text,
ADD COLUMN IF NOT EXISTS dietary_info text[],
ADD COLUMN IF NOT EXISTS tips text,
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS total_views integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_saves integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS rating_count integer DEFAULT 0;

-- Create recipe images table for multiple photos
CREATE TABLE IF NOT EXISTS public.recipe_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on recipe_images
ALTER TABLE public.recipe_images ENABLE ROW LEVEL SECURITY;

-- Create policies for recipe_images
CREATE POLICY "Recipe authors can manage their images" 
ON public.recipe_images 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.recipes 
    WHERE recipes.id = recipe_images.recipe_id 
    AND recipes.author_id = auth.uid()
  )
);

CREATE POLICY "Public images viewable by everyone" 
ON public.recipe_images 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.recipes 
    WHERE recipes.id = recipe_images.recipe_id 
    AND (recipes.sharing_type = 'public' OR recipes.sharing_type = 'paid')
  )
);

-- Create user spreads table for platform currency
CREATE TABLE IF NOT EXISTS public.user_spreads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on user_spreads
ALTER TABLE public.user_spreads ENABLE ROW LEVEL SECURITY;

-- Create policies for user_spreads
CREATE POLICY "Users can view their own spreads" 
ON public.user_spreads 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own spread account" 
ON public.user_spreads 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update spreads" 
ON public.user_spreads 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create recipe purchases table
CREATE TABLE IF NOT EXISTS public.recipe_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  spread_amount INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(buyer_id, recipe_id)
);

-- Enable RLS on recipe_purchases
ALTER TABLE public.recipe_purchases ENABLE ROW LEVEL SECURITY;

-- Create policies for recipe_purchases
CREATE POLICY "Users can view their own purchases" 
ON public.recipe_purchases 
FOR SELECT 
USING (auth.uid() = buyer_id);

CREATE POLICY "Users can make purchases" 
ON public.recipe_purchases 
FOR INSERT 
WITH CHECK (auth.uid() = buyer_id);

-- Create recipe saves table
CREATE TABLE IF NOT EXISTS public.recipe_saves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(user_id, recipe_id)
);

-- Enable RLS on recipe_saves
ALTER TABLE public.recipe_saves ENABLE ROW LEVEL SECURITY;

-- Create policies for recipe_saves
CREATE POLICY "Users can manage their own saves" 
ON public.recipe_saves 
FOR ALL 
USING (auth.uid() = user_id);

-- Update RLS policies for recipes table to handle new sharing types
DROP POLICY IF EXISTS "Free recipes are viewable by everyone" ON public.recipes;
DROP POLICY IF EXISTS "Premium recipes viewable by subscribers" ON public.recipes;

CREATE POLICY "Public recipes viewable by everyone" 
ON public.recipes 
FOR SELECT 
USING (sharing_type = 'public');

CREATE POLICY "Private recipes viewable by owner" 
ON public.recipes 
FOR SELECT 
USING (author_id = auth.uid() AND sharing_type = 'private');

CREATE POLICY "Paid recipes viewable by purchasers" 
ON public.recipes 
FOR SELECT 
USING (
  sharing_type = 'paid' AND (
    author_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.recipe_purchases 
      WHERE recipe_purchases.recipe_id = recipes.id 
      AND recipe_purchases.buyer_id = auth.uid()
    )
  )
);

-- Create storage bucket for recipe images
INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-images', 'recipe-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for recipe images
CREATE POLICY "Authenticated users can upload recipe images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'recipe-images' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Recipe images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'recipe-images');

CREATE POLICY "Users can update their own recipe images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'recipe-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own recipe images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'recipe-images' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);