import { Task } from '@/types/task';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Coins, Building2, User, Gift, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TaskCardProps {
  task: Task | any;
  isOfficial?: boolean;
  onDelete?: (taskId: string) => void;
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

export const TaskCard = ({ task, isOfficial = false, onDelete }: TaskCardProps) => {
  const navigate = useNavigate();

  // Normalize fields from DB (snake_case) or client types (camelCase)
  const rewardTypeKey = (task?.rewardType ?? task?.reward_type) as string | undefined;
  const rewardDetails = (task?.rewardDetails ?? task?.reward_details) as string | undefined;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(task.id);
    }
  };

  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-medium hover:-translate-y-1"
      onClick={() => navigate(`/task/${(task as any).id}`)}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3 mb-3">
          <CardTitle className="text-lg leading-tight">{(task as any).title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={categoryColors[(task as any).category as keyof typeof categoryColors]} variant="outline">
              {(task as any).category}
            </Badge>
            {isOfficial && (
              <Button
                variant="destructive"
                size="icon"
                className="h-8 w-8"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {(task as any).assignee === 'government' ? (
              <><Building2 className="h-3 w-3 mr-1" />Government</>
            ) : (
              <><User className="h-3 w-3 mr-1" />Individual</>
            )}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Gift className="h-3 w-3 mr-1" />
            {rewardTypeKey ? (rewardTypeLabels[rewardTypeKey] ?? rewardTypeKey) : 'Reward'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {(task as any).description}
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{(task as any).location}</span>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/30 pt-4">
        <div className="flex items-center gap-2 text-primary font-semibold">
          <Gift className="h-5 w-5" />
          {/* Prefer the specific reward details text; fallback to points if needed */}
          <span className="text-base">{rewardDetails || (typeof (task as any).reward === 'number' ? `Reward: ${(task as any).reward} points` : 'Reward available')}</span>
        </div>
      </CardFooter>
    </Card>
  );
};
