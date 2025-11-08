import { Navigation } from '@/components/Navigation';
import { TaskCard } from '@/components/TaskCard';
import { TaskFilters } from '@/components/TaskFilters';
import { availableTasks } from '@/data/mockTasks';
import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '@/utils/auth';
import { getUserTasks } from '@/utils/userTasks';

const Tasks = () => {
  const navigate = useNavigate();
  const user = getUser();
  const userTasks = getUserTasks();

  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [selectedRewardType, setSelectedRewardType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) return null;

  // Get unique locations
  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(availableTasks.map(task => task.location)));
  }, []);

  // Filter out tasks that the user has already accepted
  const userTaskIds = userTasks.map(task => task.id);
  const availableTasksFiltered = useMemo(() => {
    return availableTasks.filter(task => {
      // Filter out accepted tasks
      if (userTaskIds.includes(task.id)) return false;

      // Apply filters
      if (selectedAssignee !== 'all' && task.assignee !== selectedAssignee) return false;
      if (selectedRewardType !== 'all' && task.rewardType !== selectedRewardType) return false;
      if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;
      if (selectedLocation !== 'all' && task.location !== selectedLocation) return false;

      return true;
    });
  }, [userTaskIds, selectedAssignee, selectedRewardType, selectedCategory, selectedLocation]);

  const handleClearFilters = () => {
    setSelectedAssignee('all');
    setSelectedRewardType('all');
    setSelectedCategory('all');
    setSelectedLocation('all');
  };

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
            <TaskCard key={task.id} task={task} />
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
