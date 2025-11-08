import { Navigation } from '@/components/Navigation';
import { TaskCard } from '@/components/TaskCard';
import { availableTasks } from '@/data/mockTasks';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '@/utils/auth';
import { getUserTasks } from '@/utils/userTasks';

const Tasks = () => {
  const navigate = useNavigate();
  const user = getUser();
  const userTasks = getUserTasks();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) return null;

  // Filter out tasks that the user has already accepted
  const userTaskIds = userTasks.map(task => task.id);
  const availableTasksFiltered = availableTasks.filter(
    task => !userTaskIds.includes(task.id)
  );

  return (
    <div className="min-h-screen bg-gradient-sky">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Available Tasks
          </h1>
          <p className="text-muted-foreground">
            Choose from AI-analyzed environmental tasks in your area
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {availableTasksFiltered.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>

        {availableTasksFiltered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No available tasks at the moment. Check back later!
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Tasks;
