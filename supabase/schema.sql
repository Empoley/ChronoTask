-- ==============================================================================
-- ChronoTasks Database Schema & Row-Level Security (RLS) Setup
-- Run this in the Supabase SQL Editor: Dashboard -> SQL Editor -> New query -> Run
-- ==============================================================================

-- 1. Profiles Table (syncs with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  last_overload_email_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT '📁',
  milestones JSONB DEFAULT '[]'::jsonb,
  deadline TEXT,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Project Members (Collaboration & Inviting)
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  role TEXT DEFAULT 'editor' CHECK (role IN ('owner', 'editor', 'viewer')),
  status TEXT DEFAULT 'accepted' CHECK (status IN ('accepted', 'pending')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(project_id, user_email)
);

-- 4. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quest_id TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  deadline TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'epic')),
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT ARRAY['General']::TEXT[],
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row-Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- RLS HELPER FUNCTIONS (SECURITY DEFINER to completely eliminate RLS recursion)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_project_owner(p_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = p_id AND owner_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_project_collaborator(p_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = p_id 
      AND (user_id = auth.uid() OR lower(user_email) = lower(coalesce(auth.jwt()->>'email', '')))
  );
$$;

CREATE OR REPLACE FUNCTION public.can_edit_project(p_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = p_id AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = p_id 
      AND (user_id = auth.uid() OR lower(user_email) = lower(coalesce(auth.jwt()->>'email', '')))
      AND role IN ('owner', 'editor')
  );
$$;

-- Profiles RLS
DROP POLICY IF EXISTS "Public profiles are readable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles are readable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Projects RLS
DROP POLICY IF EXISTS "Projects viewable by owner or members" ON public.projects;
CREATE POLICY "Projects viewable by owner or members"
  ON public.projects FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR public.is_project_collaborator(id)
  );

DROP POLICY IF EXISTS "Projects insertable by owner" ON public.projects;
CREATE POLICY "Projects insertable by owner"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Projects updatable by owner or editor members" ON public.projects;
CREATE POLICY "Projects updatable by owner or editor members"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (public.can_edit_project(id));

DROP POLICY IF EXISTS "Projects deletable by owner" ON public.projects;
CREATE POLICY "Projects deletable by owner"
  ON public.projects FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- Project Members RLS
DROP POLICY IF EXISTS "Members readable by project collaborators" ON public.project_members;
CREATE POLICY "Members readable by project collaborators"
  ON public.project_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    lower(user_email) = lower(coalesce(auth.jwt()->>'email', '')) OR
    public.is_project_owner(project_id)
  );

DROP POLICY IF EXISTS "Members insertable by project owner" ON public.project_members;
CREATE POLICY "Members insertable by project owner"
  ON public.project_members FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_project_owner(project_id)
  );

DROP POLICY IF EXISTS "Members deletable by project owner or self" ON public.project_members;
CREATE POLICY "Members deletable by project owner or self"
  ON public.project_members FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    lower(user_email) = lower(coalesce(auth.jwt()->>'email', '')) OR
    public.is_project_owner(project_id)
  );

-- Tasks RLS
DROP POLICY IF EXISTS "Tasks viewable by owner or project collaborators" ON public.tasks;
CREATE POLICY "Tasks viewable by owner or project collaborators"
  ON public.tasks FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    (quest_id IS NOT NULL AND public.is_project_collaborator(quest_id))
  );

DROP POLICY IF EXISTS "Tasks insertable by authenticated users" ON public.tasks;
CREATE POLICY "Tasks insertable by authenticated users"
  ON public.tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    (quest_id IS NOT NULL AND public.can_edit_project(quest_id))
  );

DROP POLICY IF EXISTS "Tasks updatable by task owner or project editors" ON public.tasks;
CREATE POLICY "Tasks updatable by task owner or project editors"
  ON public.tasks FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    (quest_id IS NOT NULL AND public.can_edit_project(quest_id))
  );

DROP POLICY IF EXISTS "Tasks deletable by task owner or project owner" ON public.tasks;
CREATE POLICY "Tasks deletable by task owner or project owner"
  ON public.tasks FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    (quest_id IS NOT NULL AND public.is_project_owner(quest_id))
  );

-- Enable Realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'tasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'projects'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'project_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.project_members;
  END IF;
END $$;
