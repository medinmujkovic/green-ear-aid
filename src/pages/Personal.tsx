import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Gift, CheckCircle, Volume2 } from 'lucide-react';
import { getUserTasks, completeTask } from '@/utils/userTasks';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '@/utils/auth';
import { useToast } from '@/hooks/use-toast';

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
  const user = getUser();
  const [tasks, setTasks] = useState(getUserTasks());
  const [playingRewardFor, setPlayingRewardFor] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleMarkComplete = (taskId: string) => {
    completeTask(taskId);
    setTasks(getUserTasks());
    toast({
      title: 'Task Marked Complete',
      description: 'Waiting for approval from the city.',
    });
  };

  const handlePlayReward = async (taskId: string, taskTitle: string) => {
    setPlayingRewardFor(taskId);
    
    try {
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      
      if (!apiKey) {
        toast({
          title: 'Configuration Error',
          description: 'ElevenLabs API key not configured.',
          variant: 'destructive',
        });
        setPlayingRewardFor(null);
        return;
      }

      const rewardMessage = `Congratulations ${user.name}! You've successfully completed the task: ${taskTitle}. Your dedication to making our city cleaner and greener is truly inspiring. Thank you for your contribution to our community's environmental health!`;

      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/9BWtsMINqrJLrRacOk9x', {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: rewardMessage,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.8,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const audioBlob = await response.blob();
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

  const completedTasks = tasks.filter(task => task.status === 'completed' || task.status === 'pending-approval');

  return (
    <div className="min-h-screen bg-gradient-sky">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome, {user.name}!
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

        <h2 className="text-2xl font-bold mb-4">Your Tasks</h2>
        
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                You haven't accepted any tasks yet.
              </p>
              <Button onClick={() => navigate('/tasks')}>
                Browse Available Tasks
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map(task => (
              <Card key={task.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <CardTitle className="text-lg leading-tight">{task.title}</CardTitle>
                    <Badge className={categoryColors[task.category]} variant="outline">
                      {task.category}
                    </Badge>
                  </div>
                  <Badge className={statusColors[task.status || 'in-progress']} variant="outline">
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
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  {task.status === 'in-progress' && (
                    <Button 
                      className="w-full"
                      onClick={() => handleMarkComplete(task.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Complete
                    </Button>
                  )}
                  {task.status === 'pending-approval' && (
                    <Button 
                      className="w-full"
                      variant="outline"
                      onClick={() => handlePlayReward(task.id, task.title)}
                      disabled={playingRewardFor === task.id}
                    >
                      <Volume2 className="h-4 w-4 mr-2" />
                      {playingRewardFor === task.id ? 'Playing...' : 'Hear Your Reward'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Personal;
