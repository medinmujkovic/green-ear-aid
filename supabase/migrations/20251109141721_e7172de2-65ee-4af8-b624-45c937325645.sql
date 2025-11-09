-- Allow 'other' as a valid category in tasks table
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_category_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_category_check 
  CHECK (category IN ('cleanup', 'planting', 'monitoring', 'education', 'other'));