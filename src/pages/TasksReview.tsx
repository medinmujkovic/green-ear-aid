import { Navigation } from '@/components/Navigation';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface PendingTask {
  id: string;
  user_id: string;
  task_id: string;
  completed_at: string;
  task: {
    title: string;
    description: string;
    location: string;
    reward: number;
    category: string;
    reward_type: string;
    reward_details: string;
  };
  profile: {
    full_name: string;
    email: string;
  };
}

const categoryColors = {
  cleanup: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  planting: 'bg-green-500/10 text-green-500 border-green-500/20',
  monitoring: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  education: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
};

const TasksReview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOfficial, setIsOfficial] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (roleData?.role !== 'official') {
        navigate('/tasks');
        return;
      }

      setIsOfficial(true);
      fetchPendingTasks();
    };

    checkAuth();
  }, [navigate]);

  const fetchPendingTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_tasks')
      .select(`
        id,
        user_id,
        task_id,
        completed_at,
        tasks(title, description, location, reward, category, reward_type, reward_details)
      `)
      .eq('status', 'pending-approval')
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pending tasks',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    // Fetch user profiles separately
    const userIds = data?.map(t => t.user_id) || [];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds);

    const tasksWithProfiles = data?.map(task => ({
      ...task,
      task: task.tasks,
      profile: profiles?.find(p => p.id === task.user_id) || { full_name: 'Unknown', email: '' }
    })) || [];

    setPendingTasks(tasksWithProfiles as any);
    setLoading(false);
  };

  const handleApprove = async (userTaskId: string, taskId: string) => {
    // Update user_tasks status to completed
    const { error: updateError } = await supabase
      .from('user_tasks')
      .update({ status: 'completed' })
      .eq('id', userTaskId);

    if (updateError) {
      toast({
        title: 'Error',
        description: 'Failed to approve task',
        variant: 'destructive',
      });
      return;
    }

    // Delete the task from tasks table so it's no longer available
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (deleteError) {
      console.error('Error deleting task:', deleteError);
      // Still show success since the user task was approved
      toast({
        title: 'Warning',
        description: 'Task approved but could not remove from tasks list.',
      });
    } else {
      toast({
        title: 'Success',
        description: 'Task approved and removed from available tasks!',
      });
    }
    
    fetchPendingTasks();
  };

  const handleDeny = async (userTaskId: string) => {
    const { error } = await supabase
      .from('user_tasks')
      .delete()
      .eq('id', userTaskId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to deny task',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Task Denied',
        description: 'Task has been returned to available tasks.',
      });
      fetchPendingTasks();
    }
  };

  if (!isOfficial) return null;

  return (
    <div className="min-h-screen bg-gradient-sky">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Tasks Review
          </h1>
          <p className="text-muted-foreground">
            Review and approve completed tasks submitted by users
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading pending tasks...</p>
          </div>
        ) : pendingTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tasks pending review</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pendingTasks.map((item) => (
              <Card key={item.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-xl">{item.task.title}</CardTitle>
                    <Badge className={categoryColors[item.task.category as keyof typeof categoryColors]}>
                      {item.task.category}
                    </Badge>
                  </div>
                  <CardDescription>{item.task.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Submitted by</p>
                      <p className="text-sm">{item.profile.full_name}</p>
                      <p className="text-xs text-muted-foreground">{item.profile.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Location</p>
                      <p className="text-sm">{item.task.location}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Reward</p>
                      <p className="text-sm">{item.task.reward} points - {item.task.reward_details}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completed at</p>
                      <p className="text-sm">{new Date(item.completed_at).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button 
                    onClick={() => handleApprove(item.id, item.task_id)}
                    className="flex-1"
                  >
                    Approve
                  </Button>
                  <Button 
                    onClick={() => handleDeny(item.id)}
                    variant="destructive"
                    className="flex-1"
                  >
                    Deny
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default TasksReview;
