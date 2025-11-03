-- Update comments table for secure comment system
-- This migration adds the necessary fields for the secure comment system

-- First, drop the existing comments table (this will delete all existing comments)
DROP TABLE IF EXISTS comments CASCADE;

-- Recreate comments table with security fields
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE NOT NULL,
  nickname TEXT NOT NULL,
  content TEXT NOT NULL,
  ip_hash TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id),
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  moderation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_comments_article ON comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_ip_hash ON comments(ip_hash);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

-- Create secure comment insertion function
CREATE OR REPLACE FUNCTION create_comment_secure(
  p_article_id UUID,
  p_nickname TEXT,
  p_content TEXT,
  p_ip_hash TEXT,
  p_parent_id UUID DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  article_id UUID,
  nickname TEXT,
  content TEXT,
  parent_id UUID,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
DECLARE
  v_article_status TEXT;
  v_parent_status TEXT;
BEGIN
  -- Check if article exists and is published
  SELECT status INTO v_article_status
  FROM articles
  WHERE id = p_article_id;
  
  IF v_article_status IS NULL THEN
    RAISE EXCEPTION 'Article not found';
  END IF;
  
  IF v_article_status != 'published' THEN
    RAISE EXCEPTION 'Cannot comment on unpublished articles';
  END IF;
  
  -- If parent_id is provided, validate it
  IF p_parent_id IS NOT NULL THEN
    SELECT status INTO v_parent_status
    FROM comments
    WHERE id = p_parent_id AND article_id = p_article_id;
    
    IF v_parent_status IS NULL THEN
      RAISE EXCEPTION 'Parent comment not found';
    END IF;
    
    IF v_parent_status != 'approved' THEN
      RAISE EXCEPTION 'Cannot reply to unapproved comments';
    END IF;
  END IF;
  
  -- Insert the comment
  INSERT INTO comments (
    article_id,
    nickname,
    content,
    ip_hash,
    parent_id,
    status
  ) VALUES (
    p_article_id,
    p_nickname,
    p_content,
    p_ip_hash,
    p_parent_id,
    'pending'
  )
  RETURNING 
    id,
    article_id,
    nickname,
    content,
    parent_id,
    status,
    created_at,
    updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on the new comments table
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Approved comments are viewable by everyone" ON comments;
DROP POLICY IF EXISTS "Users can manage their comments" ON comments;
DROP POLICY IF EXISTS "Admins can manage all comments" ON comments;

-- Recreate policies for the updated table structure
-- Public read access for approved comments
CREATE POLICY "Approved comments are viewable by everyone" ON comments
    FOR SELECT USING (status = 'approved');

-- Service role can manage all comments (for admin functions)
CREATE POLICY "Service role can manage all comments" ON comments
    FOR ALL USING (
        -- This allows service role operations (bypasses RLS)
        current_setting('request.jwt.claims.role', true) = 'service_role'
    );

-- Apply trigger for updated_at
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at 
    BEFORE UPDATE ON comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update the article_stats view to work with new comments table
CREATE OR REPLACE VIEW article_stats AS
SELECT 
  a.id as article_id,
  a.title,
  a.slug,
  a.view_count,
  COUNT(DISTINCT c.id) as comment_count,
  COUNT(DISTINCT at.tag_id) as tag_count,
  COUNT(DISTINCT ac.category_id) as category_count,
  a.published_at
FROM articles a
LEFT JOIN comments c ON a.id = c.article_id AND c.status = 'approved'
LEFT JOIN article_tags at ON a.id = at.article_id
LEFT JOIN article_categories ac ON a.id = ac.article_id
GROUP BY a.id, a.title, a.slug, a.view_count, a.published_at;