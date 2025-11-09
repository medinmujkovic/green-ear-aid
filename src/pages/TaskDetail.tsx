import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Gift, Volume2, CheckCircle, Building2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const categoryColors = {
  cleanup: 'bg-accent/10 text-accent border-accent/20',
  planting: 'bg-success/10 text-success border-success/20',
  monitoring: 'bg-warning/10 text-warning border-warning/20',
  education: 'bg-primary/10 text-primary border-primary/20',
};

const rewardTypeLabels: Record<string, string> = {
  money: 'Money',
  transport: 'Free Transport',
  coupon: 'Shopping Coupon',
  cinema: 'Cinema Ticket',
  other: 'Reward',
};

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [task, setTask] = useState<any>(null);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      setUserId(session.user.id);

      // Fetch task from database
      const { data: taskData } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();

      if (taskData) {
        setTask(taskData);
      }

      // Check if user has accepted this task
      const { data: userTaskData } = await supabase
        .from('user_tasks')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('task_id', id)
        .maybeSingle();

      setHasAccepted(!!userTaskData);
    };

    loadData();
  }, [id, navigate]);

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-sky">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <p>Loading task...</p>
        </div>
      </div>
    );
  }

  const handleAcceptTask = async () => {
    const { error } = await supabase
      .from('user_tasks')
      .insert({
        user_id: userId,
        task_id: task.id,
        status: 'in-progress'
      });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to accept task. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Task Accepted!',
      description: 'Check your Personal tab to manage this task.',
    });
    navigate('/personal');
  };

  const handlePlayAudio = async () => {
    setIsPlayingAudio(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: task.asdi_insight }
      });

      if (error) throw error;

      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
      
      toast({
        title: 'Playing AI Analysis',
        description: 'Listen to the ASDI insights for this task.',
      });
    } catch (error) {
      console.error('Audio playback error:', error);
      toast({
        title: 'Audio Error',
        description: 'Failed to play audio. Please try again.',
        variant: 'destructive',
      });
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-sky">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/tasks')}
          className="mb-6"
        >
          ← Back to Tasks
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <CardTitle className="text-2xl">{task.title}</CardTitle>
                  <Badge className={categoryColors[task.category as keyof typeof categoryColors]} variant="outline">
                    {task.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs">
                    {task.assignee === 'government' ? (
                      <><Building2 className="h-3 w-3 mr-1" />Government</>
                    ) : (
                      <><User className="h-3 w-3 mr-1" />Individual</>
                    )}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Gift className="h-3 w-3 mr-1" />
                    {task.reward_type}
                  </Badge>
                </div>
                <CardDescription className="text-base">
                  {task.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>{task.location}</span>
                </div>
                
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <span className="text-primary">ASDI Insight</span>
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {task.asdi_insight}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="bg-gradient-eco text-primary-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-6 w-6" />
                  Reward
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{task.reward_details}</p>
              </CardContent>
            </Card>

            <Button 
              className="w-full" 
              size="lg"
              onClick={handlePlayAudio}
              disabled={isPlayingAudio}
              variant="outline"
            >
              <Volume2 className="h-5 w-5 mr-2" />
              {isPlayingAudio ? 'Playing...' : 'Listen to AI Analysis'}
            </Button>

            {!hasAccepted ? (
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleAcceptTask}
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Accept Task
              </Button>
            ) : (
              <Button 
                className="w-full" 
                size="lg"
                variant="secondary"
                disabled
              >
                Task Already Accepted
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TaskDetail;
