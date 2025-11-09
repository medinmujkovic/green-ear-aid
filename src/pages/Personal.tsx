import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Gift, CheckCircle, Volume2, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const categoryColors = {
  cleanup: 'bg-accent/10 text-accent border-accent/20',
  planting: 'bg-success/10 text-success border-success/20',
  monitoring: 'bg-warning/10 text-warning border-warning/20',
  education: 'bg-primary/10 text-primary border-primary/20',
};

const statusColors = {
  'in-progress': 'bg-warning/10 text-warning border-warning/20',
  'pending-approval': 'bg-accent/10 text-accent border-accent/20',
  'completed': 'bg-success/10 text-success border-success/20',
  'available': 'bg-muted/10 text-muted-foreground border-muted/20',
};

const Personal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState<string>('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [playingRewardFor, setPlayingRewardFor] = useState<string | null>(null);
  const [requestForm, setRequestForm] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
  });

  const fetchTasks = async (uid: string) => {
    const { data, error } = await supabase
      .from('user_tasks')
      .select(`
        id,
        status,
        accepted_at,
        completed_at,
        task:tasks (
          id,
          title,
          location,
          category,
          reward_details
        )
      `)
      .eq('user_id', uid);

    if (error) {
      console.error('Error fetching tasks:', error);
      return;
    }

    setTasks(data?.map(ut => ({
      id: ut.task.id,
      userTaskId: ut.id,
      title: ut.task.title,
      location: ut.task.location,
      category: ut.task.category,
      rewardDetails: ut.task.reward_details,
      status: ut.status,
      completedAt: ut.completed_at
    })) || []);
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      setUserId(session.user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .maybeSingle();

      setUserName(profile?.full_name || session.user.email || 'User');
      
      await fetchTasks(session.user.id);
    };

    checkUser();
  }, [navigate]);

  if (!userName) return null;

  const handleMarkComplete = async (userTaskId: string) => {
    const { error } = await supabase
      .from('user_tasks')
      .update({ 
        status: 'pending-approval',
        completed_at: new Date().toISOString()
      })
      .eq('id', userTaskId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark task as complete.',
        variant: 'destructive',
      });
      return;
    }

    await fetchTasks(userId);
    toast({
      title: 'Task Marked Complete',
      description: 'Waiting for approval from the city.',
    });
  };

  const handlePlayReward = async (taskId: string, taskTitle: string) => {
    setPlayingRewardFor(taskId);
    
    try {
      const rewardMessage = `Congratulations ${userName}! You've successfully completed the task: ${taskTitle}. Your dedication to making our city cleaner and greener is truly inspiring. Thank you for your contribution to our community's environmental health!`;

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: rewardMessage }
      });

      if (error) throw error;

      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setPlayingRewardFor(null);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
      
      toast({
        title: 'Playing Reward Message',
        description: 'Enjoy your personalized congratulations!',
      });
    } catch (error) {
      console.error('Audio playback error:', error);
      toast({
        title: 'Audio Error',
        description: 'Failed to play reward message.',
        variant: 'destructive',
      });
      setPlayingRewardFor(null);
    }
  };

  const handleSubmitRequest = async () => {
    try {
      const { error } = await supabase
        .from('task_requests')
        .insert({
          user_id: userId,
          title: requestForm.title,
          description: requestForm.description,
          location: requestForm.location,
          category: requestForm.category,
        });

      if (error) throw error;

      toast({
        title: 'Request Submitted',
        description: 'Your task request has been sent to officials for review.',
      });

      setRequestForm({
        title: '',
        description: '',
        location: '',
        category: '',
      });
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit request.',
        variant: 'destructive',
      });
    }
  };

  const completedTasks = tasks.filter(task => task.status === 'completed' || task.status === 'pending-approval');

  return (
    <div className="min-h-screen bg-gradient-sky">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome, {userName}!
          </h1>
          <p className="text-muted-foreground">
            Track your environmental impact and manage your tasks
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {tasks.filter(t => t.status === 'in-progress').length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-accent">
                {tasks.filter(t => t.status === 'pending-approval').length}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-eco text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-sm font-medium opacity-90">
                Completed Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {completedTasks.length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active Tasks</TabsTrigger>
            <TabsTrigger value="completed">Completed Tasks</TabsTrigger>
            <TabsTrigger value="request">Request Task</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Active Tasks</h2>
            
            {tasks.filter(t => t.status === 'in-progress').length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    You don't have any active tasks.
                  </p>
                  <Button onClick={() => navigate('/tasks')}>
                    Browse Available Tasks
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tasks.filter(t => t.status === 'in-progress').map(task => (
                  <Card key={task.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <CardTitle className="text-lg leading-tight">{task.title}</CardTitle>
                        <Badge className={categoryColors[task.category]} variant="outline">
                          {task.category}
                        </Badge>
                      </div>
                      <Badge className={statusColors[task.status]} variant="outline">
                        IN PROGRESS
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{task.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-primary font-semibold">
                        <Gift className="h-5 w-5" />
                        <span>{task.rewardDetails}</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full"
                        onClick={() => handleMarkComplete(task.userTaskId)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Complete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Completed & Pending Approval</h2>
            
            {completedTasks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    You haven't completed any tasks yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {completedTasks.map(task => (
                  <Card key={task.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <CardTitle className="text-lg leading-tight">{task.title}</CardTitle>
                        <Badge className={categoryColors[task.category]} variant="outline">
                          {task.category}
                        </Badge>
                      </div>
                      <Badge className={statusColors[task.status]} variant="outline">
                        {task.status?.replace('-', ' ').toUpperCase()}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{task.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-primary font-semibold">
                        <Gift className="h-5 w-5" />
                        <span>{task.rewardDetails}</span>
                      </div>
                      {task.completedAt && (
                        <p className="text-xs text-muted-foreground">
                          Completed: {new Date(task.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </CardContent>
                    {task.status === 'pending-approval' && (
                      <CardFooter>
                        <Button 
                          className="w-full"
                          variant="outline"
                          onClick={() => handlePlayReward(task.id, task.title)}
                          disabled={playingRewardFor === task.id}
                        >
                          <Volume2 className="h-4 w-4 mr-2" />
                          {playingRewardFor === task.id ? 'Playing...' : 'Hear Your Reward'}
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="request" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Request a New Task</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Submit a request for a task you need completed in your area
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Task Title</label>
                  <Input
                    value={requestForm.title}
                    onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })}
                    placeholder="e.g., Clean up park entrance"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={requestForm.description}
                    onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                    placeholder="Describe what needs to be done"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={requestForm.location}
                    onChange={(e) => setRequestForm({ ...requestForm, location: e.target.value })}
                    placeholder="e.g., Central Park, Main Street"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={requestForm.category} onValueChange={(v) => setRequestForm({ ...requestForm, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cleanup">Cleanup</SelectItem>
                      <SelectItem value="planting">Planting</SelectItem>
                      <SelectItem value="monitoring">Monitoring</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleSubmitRequest}
                  disabled={!requestForm.title || !requestForm.description || !requestForm.location || !requestForm.category}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Personal;
