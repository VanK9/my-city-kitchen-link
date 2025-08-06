-- Create enum for subscription tiers
CREATE TYPE public.subscription_tier AS ENUM ('basic', 'premium', 'pro');

-- Create enum for verification status
CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'rejected');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT,
  bio TEXT,
  specialty TEXT,
  experience_years INTEGER,
  city TEXT,
  country TEXT DEFAULT 'Ελλάδα',
  verification_status verification_status DEFAULT 'pending',
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscribers table for subscription management
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier subscription_tier,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create recipes table
CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  ingredients JSONB NOT NULL,
  instructions JSONB NOT NULL,
  prep_time INTEGER, -- in minutes
  cook_time INTEGER, -- in minutes
  servings INTEGER,
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  image_url TEXT,
  is_premium BOOLEAN DEFAULT false,
  price DECIMAL(10,2), -- price in euros for premium recipes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  price DECIMAL(10,2),
  materials_needed TEXT[],
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tutorials table
CREATE TABLE public.tutorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL, -- structured content with steps, videos, images
  category TEXT NOT NULL, -- e.g., 'knife-skills', 'basic-techniques', etc.
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  duration INTEGER, -- in minutes
  video_url TEXT,
  is_free BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for subscribers
CREATE POLICY "Users can view own subscription" 
ON public.subscribers FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can manage subscriptions" 
ON public.subscribers FOR ALL USING (true);

-- RLS Policies for recipes
CREATE POLICY "Free recipes are viewable by everyone" 
ON public.recipes FOR SELECT USING (NOT is_premium);

CREATE POLICY "Premium recipes viewable by subscribers" 
ON public.recipes FOR SELECT USING (
  is_premium AND EXISTS (
    SELECT 1 FROM public.subscribers 
    WHERE user_id = auth.uid() AND subscribed = true
  )
);

CREATE POLICY "Authors can manage own recipes" 
ON public.recipes FOR ALL USING (auth.uid() = author_id);

-- RLS Policies for events
CREATE POLICY "Approved events are viewable by everyone" 
ON public.events FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can create events" 
ON public.events FOR INSERT WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can update own events" 
ON public.events FOR UPDATE USING (auth.uid() = organizer_id);

-- RLS Policies for tutorials
CREATE POLICY "Free tutorials are viewable by everyone" 
ON public.tutorials FOR SELECT USING (is_free = true);

CREATE POLICY "Premium tutorials viewable by subscribers" 
ON public.tutorials FOR SELECT USING (
  NOT is_free AND EXISTS (
    SELECT 1 FROM public.subscribers 
    WHERE user_id = auth.uid() AND subscribed = true
  )
);

CREATE POLICY "Authors can manage own tutorials" 
ON public.tutorials FOR ALL USING (auth.uid() = author_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tutorials_updated_at
  BEFORE UPDATE ON public.tutorials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();