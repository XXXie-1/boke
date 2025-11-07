-- Create posts table for the blog
CREATE TABLE public.posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text NOT NULL,
  excerpt text,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  published boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  published_at timestamp with time zone
);

-- Create indexes for better performance
CREATE INDEX posts_author_id_idx ON public.posts(author_id);
CREATE INDEX posts_published_idx ON public.posts(published);
CREATE INDEX posts_published_at_idx ON public.posts(published_at);
CREATE INDEX posts_slug_idx ON public.posts(slug);

-- Enable RLS on posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view published posts
CREATE POLICY "Anyone can view published posts" ON public.posts
  FOR SELECT USING (published = true);

-- Create policy for authors to view their own posts (including drafts)
CREATE POLICY "Authors can view their own posts" ON public.posts
  FOR SELECT USING (auth.uid() = author_id);

-- Create policy for authors to insert their own posts
CREATE POLICY "Authors can insert their own posts" ON public.posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Create policy for authors to update their own posts
CREATE POLICY "Authors can update their own posts" ON public.posts
  FOR UPDATE USING (auth.uid() = author_id);

-- Create policy for authors to delete their own posts
CREATE POLICY "Authors can delete their own posts" ON public.posts
  FOR DELETE USING (auth.uid() = author_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at on posts
CREATE TRIGGER handle_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
