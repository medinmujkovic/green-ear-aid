-- Add missing fields to task_requests table to match tasks table
ALTER TABLE public.task_requests
ADD COLUMN IF NOT EXISTS assignee TEXT NOT NULL DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS reward_type TEXT NOT NULL DEFAULT 'money',
ADD COLUMN IF NOT EXISTS reward_details TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS asdi_insight TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS reward INTEGER NOT NULL DEFAULT 0;