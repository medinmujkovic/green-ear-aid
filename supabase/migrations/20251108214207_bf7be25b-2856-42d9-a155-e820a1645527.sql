-- Create task_requests table for user-submitted task requests
CREATE TABLE public.task_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view their own requests"
ON public.task_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create requests"
ON public.task_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Officials can view all requests
CREATE POLICY "Officials can view all requests"
ON public.task_requests
FOR SELECT
USING (has_role(auth.uid(), 'official'::app_role));

-- Officials can update requests
CREATE POLICY "Officials can update requests"
ON public.task_requests
FOR UPDATE
USING (has_role(auth.uid(), 'official'::app_role));

-- Officials can delete requests
CREATE POLICY "Officials can delete requests"
ON public.task_requests
FOR DELETE
USING (has_role(auth.uid(), 'official'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_task_requests_updated_at
BEFORE UPDATE ON public.task_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();