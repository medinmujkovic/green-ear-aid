import { Task } from '@/types/task';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Coins, Building2, User, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TaskCardProps {
  task: Task;
}

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

export const TaskCard = ({ task }: TaskCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-medium hover:-translate-y-1"
      onClick={() => navigate(`/task/${task.id}`)}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3 mb-3">
          <CardTitle className="text-lg leading-tight">{task.title}</CardTitle>
          <Badge className={categoryColors[task.category]} variant="outline">
            {task.category}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {task.assignee === 'government' ? (
              <><Building2 className="h-3 w-3 mr-1" />Government</>
            ) : (
              <><User className="h-3 w-3 mr-1" />Individual</>
            )}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Gift className="h-3 w-3 mr-1" />
            {rewardTypeLabels[task.rewardType]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {task.description}
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{task.location}</span>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/30 pt-4">
        <div className="flex items-center gap-2 text-primary font-semibold">
          <Gift className="h-5 w-5" />
          <span className="text-base">{task.rewardDetails}</span>
        </div>
      </CardFooter>
    </Card>
  );
};
