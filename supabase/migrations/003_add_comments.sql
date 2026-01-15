-- Table des commentaires
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX idx_comments_story_id ON comments(story_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Table des signalements de commentaires
CREATE TABLE comment_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  admin_note TEXT,
  resolved_at TIMESTAMPTZ,
  UNIQUE(comment_id, reporter_id)
);

-- Index pour les performances
CREATE INDEX idx_comment_reports_status ON comment_reports(status);
CREATE INDEX idx_comment_reports_comment_id ON comment_reports(comment_id);

-- RLS (Row Level Security) pour comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policies pour comments
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE USING (auth.uid() = user_id);

-- RLS pour comment_reports
ALTER TABLE comment_reports ENABLE ROW LEVEL SECURITY;

-- Policies pour comment_reports
CREATE POLICY "Authenticated users can create comment reports"
  ON comment_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own comment reports"
  ON comment_reports FOR SELECT USING (auth.uid() = reporter_id);
