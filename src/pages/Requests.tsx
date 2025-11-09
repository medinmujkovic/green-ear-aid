import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Trash2 } from 'lucide-react';

const categoryColors = {
  cleanup: 'bg-accent/10 text-accent border-accent/20',
  planting: 'bg-success/10 text-success border-success/20',
  monitoring: 'bg-warning/10 text-warning border-warning/20',
  education: 'bg-primary/10 text-primary border-primary/20',
};

const Requests = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [isOfficial, setIsOfficial] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    location: '',
    category: '',
    assignee: '',
    rewardType: '',
    rewardDetails: '',
    reward: '0',
    asdiInsight: '',
    taskType: 'personal', // personal or government
  });

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
        .maybeSingle();

      if (roleData?.role === 'official') {
        setIsOfficial(true);
        fetchRequests();
      } else {
        setIsOfficial(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('task_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching requests:', error);
      return;
    }

    setRequests(data || []);
  };

  const handleGetAISuggestion = async (request: any) => {
    setLoading(true);
    setSelectedRequest(request);
    
    try {
      const { data, error } = await supabase.functions.invoke('suggest-task', {
        body: { request }
      });

      if (error) throw error;

      setAiSuggestion(data.suggestion);
      
      try {
        const parsed = JSON.parse(data.suggestion);
        setTaskForm({
          title: parsed.title || request.title,
          description: parsed.description || request.description,
          location: parsed.location || request.location,
          category: parsed.category || request.category,
          assignee: parsed.assignee || 'government',
          rewardType: parsed.rewardType || 'money',
          rewardDetails: parsed.rewardDetails || '',
          reward: '100',
          asdiInsight: parsed.asdiInsight || '',
          taskType: 'personal',
        });
      } catch {
        setTaskForm({
          title: request.title,
          description: request.description,
          location: request.location,
          category: request.category,
          assignee: 'government',
          rewardType: 'money',
          rewardDetails: '',
          reward: '100',
          asdiInsight: '',
          taskType: 'personal',
        });
      }

      toast({
        title: 'AI Suggestion Generated',
        description: 'Review the suggestion and create the task.',
      });
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      toast({
        title: 'Error',
        description: 'Failed to get AI suggestion.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // If user selected "personal" task type, create directly in tasks table
      if (taskForm.taskType === 'personal') {
        const { error } = await supabase
          .from('tasks')
          .insert({
            title: taskForm.title,
            description: taskForm.description,
            location: taskForm.location,
            category: taskForm.category,
            assignee: taskForm.assignee,
            reward_type: taskForm.rewardType,
            reward_details: taskForm.rewardDetails,
            reward: parseInt(taskForm.reward),
            asdi_insight: taskForm.asdiInsight,
            created_by: session.user.id,
          });

        if (error) throw error;

        toast({
          title: 'Personal Task Created',
          description: 'Your task has been added to the tasks list.',
        });
      } else {
        // If "government" task type, create in task_requests for approval
        const { error } = await supabase
          .from('task_requests')
          .insert({
            user_id: session.user.id,
            title: taskForm.title,
            description: taskForm.description,
            location: taskForm.location,
            category: taskForm.category,
            assignee: taskForm.assignee,
            reward_type: taskForm.rewardType,
            reward_details: taskForm.rewardDetails,
            reward: parseInt(taskForm.reward),
            asdi_insight: taskForm.asdiInsight,
            status: 'pending',
          });

        if (error) throw error;

        toast({
          title: 'Government Task Request Submitted',
          description: 'Your request will be reviewed by officials.',
        });
      }

      setTaskForm({
        title: '',
        description: '',
        location: '',
        category: '',
        assignee: '',
        rewardType: '',
        rewardDetails: '',
        reward: '0',
        asdiInsight: '',
        taskType: 'personal',
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateTaskFromRequest = async () => {
    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          title: taskForm.title,
          description: taskForm.description,
          location: taskForm.location,
          category: taskForm.category,
          assignee: taskForm.assignee,
          reward_type: taskForm.rewardType,
          reward_details: taskForm.rewardDetails,
          reward: parseInt(taskForm.reward),
          asdi_insight: taskForm.asdiInsight,
        });

      if (error) throw error;

      if (selectedRequest) {
        await supabase
          .from('task_requests')
          .update({ status: 'approved' })
          .eq('id', selectedRequest.id);
      }

      toast({
        title: 'Task Created',
        description: 'The task has been added to the tasks list.',
      });

      setTaskForm({
        title: '',
        description: '',
        location: '',
        category: '',
        assignee: '',
        rewardType: '',
        rewardDetails: '',
        reward: '0',
        asdiInsight: '',
        taskType: 'personal',
      });
      setSelectedRequest(null);
      setAiSuggestion('');
      fetchRequests();
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from('task_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Request Deleted',
        description: 'The task request has been removed.',
      });

      fetchRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete request.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-sky">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isOfficial ? 'Task Requests' : 'Request Tasks'}
          </h1>
          <p className="text-muted-foreground">
            {isOfficial 
              ? 'Review user requests and create official tasks with AI assistance' 
              : 'Create your own tasks or request government tasks'}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {isOfficial && (
            <div>
              <h2 className="text-xl font-bold mb-4">Pending Requests</h2>
              {requests.filter(r => r.status === 'pending').length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No pending requests
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {requests.filter(r => r.status === 'pending').map((request) => (
                    <Card key={request.id} className={selectedRequest?.id === request.id ? 'border-primary' : ''}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-3">
                          <CardTitle className="text-lg">{request.title}</CardTitle>
                          <Badge className={categoryColors[request.category]} variant="outline">
                            {request.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">{request.description}</p>
                        <p className="text-sm"><strong>Location:</strong> {request.location}</p>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleGetAISuggestion(request)}
                            disabled={loading}
                            size="sm"
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            AI Suggestion
                          </Button>
                          <Button
                            onClick={() => handleDeleteRequest(request.id)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className={isOfficial ? '' : 'lg:col-span-2 max-w-2xl mx-auto w-full'}>
            <h2 className="text-xl font-bold mb-4">
              {isOfficial ? 'Create Official Task' : 'Create Task'}
            </h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                {aiSuggestion && (
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm font-semibold mb-2">AI Suggestion:</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{aiSuggestion}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    placeholder="Task title"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    placeholder="Task description"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={taskForm.location}
                    onChange={(e) => setTaskForm({ ...taskForm, location: e.target.value })}
                    placeholder="Location"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={taskForm.category} onValueChange={(v) => setTaskForm({ ...taskForm, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cleanup">Cleanup</SelectItem>
                      <SelectItem value="planting">Planting</SelectItem>
                      <SelectItem value="monitoring">Monitoring</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>


                <div>
                  <label className="text-sm font-medium">Reward Type</label>
                  <Select value={taskForm.rewardType} onValueChange={(v) => setTaskForm({ ...taskForm, rewardType: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reward type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="money">Money</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                      <SelectItem value="coupon">Coupon</SelectItem>
                      <SelectItem value="cinema">Cinema</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Reward Details</label>
                  <Input
                    value={taskForm.rewardDetails}
                    onChange={(e) => setTaskForm({ ...taskForm, rewardDetails: e.target.value })}
                    placeholder="e.g., $50 cash reward"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">ASDI Insight</label>
                  <Textarea
                    value={taskForm.asdiInsight}
                    onChange={(e) => setTaskForm({ ...taskForm, asdiInsight: e.target.value })}
                    placeholder="AI insights about task impact"
                  />
                </div>

                {!isOfficial && (
                  <div>
                    <label className="text-sm font-medium">Task Type</label>
                    <Select value={taskForm.taskType} onValueChange={(v) => setTaskForm({ ...taskForm, taskType: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select task type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">Personal Task (Auto-approved)</SelectItem>
                        <SelectItem value="government">Government Task (Needs Approval)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button
                  onClick={isOfficial ? handleCreateTaskFromRequest : handleCreateTask}
                  disabled={!taskForm.title || !taskForm.description}
                  className="w-full"
                >
                  {isOfficial 
                    ? 'Create Task' 
                    : taskForm.taskType === 'personal' 
                      ? 'Create Personal Task' 
                      : 'Submit Government Task Request'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Requests;
