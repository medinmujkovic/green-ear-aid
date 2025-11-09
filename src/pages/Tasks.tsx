import { Navigation } from '@/components/Navigation';
import { TaskCard } from '@/components/TaskCard';
import { TaskFilters } from '@/components/TaskFilters';
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Tasks = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [userTaskIds, setUserTaskIds] = useState<string[]>([]);
  const [isOfficial, setIsOfficial] = useState(false);

  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [selectedRewardType, setSelectedRewardType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      setUserId(session.user.id);

      // Check if user is official
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      const userIsOfficial = roleData?.role === 'official';
      setIsOfficial(userIsOfficial);

      // Fetch all tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*');

      setTasks(tasksData || []);

      // Fetch user's accepted tasks (only for regular users)
      if (!userIsOfficial) {
        const { data: userTasksData } = await supabase
          .from('user_tasks')
          .select('task_id')
          .eq('user_id', session.user.id);

        setUserTaskIds(userTasksData?.map(ut => ut.task_id) || []);
      }
    };

    loadData();
  }, [navigate]);

  // Get unique locations
  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(tasks.map(task => task.location)));
  }, [tasks]);

  // Filter tasks based on user role
  const availableTasksFiltered = useMemo(() => {
    return tasks.filter(task => {
      // Officials see all tasks, regular users don't see accepted tasks
      if (!isOfficial && userTaskIds.includes(task.id)) return false;

      // Apply filters
      if (selectedAssignee !== 'all' && task.assignee !== selectedAssignee) return false;
      if (selectedRewardType !== 'all' && task.reward_type !== selectedRewardType) return false;
      if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;
      if (selectedLocation !== 'all' && task.location !== selectedLocation) return false;

      return true;
    });
  }, [tasks, userTaskIds, selectedAssignee, selectedRewardType, selectedCategory, selectedLocation, isOfficial]);

  const handleClearFilters = () => {
    setSelectedAssignee('all');
    setSelectedRewardType('all');
    setSelectedCategory('all');
    setSelectedLocation('all');
  };

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete task. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Task Deleted',
      description: 'The task has been removed successfully.',
    });

    // Refresh tasks list
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  if (!userId) return null;


  return (
    <div className="min-h-screen bg-gradient-sky">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isOfficial ? 'All Tasks' : 'Available Tasks'}
          </h1>
          <p className="text-muted-foreground">
            {isOfficial 
              ? 'View all environmental tasks in the system'
              : 'Choose from AI-analyzed environmental tasks in your area'
            }
          </p>
        </div>

        <TaskFilters
          selectedAssignee={selectedAssignee}
          selectedRewardType={selectedRewardType}
          selectedCategory={selectedCategory}
          selectedLocation={selectedLocation}
          onAssigneeChange={setSelectedAssignee}
          onRewardTypeChange={setSelectedRewardType}
          onCategoryChange={setSelectedCategory}
          onLocationChange={setSelectedLocation}
          onClearFilters={handleClearFilters}
          locations={uniqueLocations}
        />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableTasksFiltered.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              isOfficial={isOfficial}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>

        {availableTasksFiltered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No tasks match your filters. Try adjusting your criteria!
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Tasks;
