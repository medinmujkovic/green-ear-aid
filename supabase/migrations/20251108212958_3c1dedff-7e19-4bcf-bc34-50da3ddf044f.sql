-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  reward INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL CHECK (category IN ('cleanup', 'planting', 'monitoring', 'education')),
  assignee TEXT NOT NULL CHECK (assignee IN ('government', 'individual')),
  reward_type TEXT NOT NULL CHECK (reward_type IN ('money', 'transport', 'coupon', 'cinema', 'other')),
  reward_details TEXT NOT NULL,
  asdi_insight TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create user_tasks junction table to track accepted tasks
CREATE TABLE public.user_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'pending-approval', 'completed')),
  accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, task_id)
);

-- Enable RLS on tasks table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Everyone can view available tasks
CREATE POLICY "Anyone can view tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (true);

-- Only officials can create tasks
CREATE POLICY "Officials can create tasks"
ON public.tasks
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'official'));

-- Only officials can update tasks
CREATE POLICY "Officials can update tasks"
ON public.tasks
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'official'));

-- Only officials can delete tasks
CREATE POLICY "Officials can delete tasks"
ON public.tasks
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'official'));

-- Enable RLS on user_tasks table
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;

-- Users can view their own accepted tasks
CREATE POLICY "Users can view their own tasks"
ON public.user_tasks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can accept tasks (insert)
CREATE POLICY "Users can accept tasks"
ON public.user_tasks
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own task status
CREATE POLICY "Users can update their task status"
ON public.user_tasks
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Officials can view all user tasks
CREATE POLICY "Officials can view all user tasks"
ON public.user_tasks
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'official'));

-- Officials can update any user task (for approval)
CREATE POLICY "Officials can update user tasks"
ON public.user_tasks
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'official'));