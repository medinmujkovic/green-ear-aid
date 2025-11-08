import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface TaskFiltersProps {
  selectedAssignee: string;
  selectedRewardType: string;
  selectedCategory: string;
  selectedLocation: string;
  onAssigneeChange: (value: string) => void;
  onRewardTypeChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onClearFilters: () => void;
  locations: string[];
}

const rewardTypeLabels: Record<string, string> = {
  money: 'Money',
  transport: 'Free Transport',
  coupon: 'Shopping Coupon',
  cinema: 'Cinema Ticket',
  other: 'Other Rewards',
};

export const TaskFilters = ({
  selectedAssignee,
  selectedRewardType,
  selectedCategory,
  selectedLocation,
  onAssigneeChange,
  onRewardTypeChange,
  onCategoryChange,
  onLocationChange,
  onClearFilters,
  locations,
}: TaskFiltersProps) => {
  const hasActiveFilters = selectedAssignee !== 'all' || selectedRewardType !== 'all' || 
                          selectedCategory !== 'all' || selectedLocation !== 'all';

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Filter Tasks</h2>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Assignee
          </label>
          <Select value={selectedAssignee} onValueChange={onAssigneeChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              <SelectItem value="government">Government</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Reward Type
          </label>
          <Select value={selectedRewardType} onValueChange={onRewardTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Rewards" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rewards</SelectItem>
              <SelectItem value="money">Money</SelectItem>
              <SelectItem value="transport">Free Transport</SelectItem>
              <SelectItem value="coupon">Shopping Coupon</SelectItem>
              <SelectItem value="cinema">Cinema Ticket</SelectItem>
              <SelectItem value="other">Other Rewards</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Task Type
          </label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="cleanup">Cleanup</SelectItem>
              <SelectItem value="planting">Planting</SelectItem>
              <SelectItem value="monitoring">Monitoring</SelectItem>
              <SelectItem value="education">Education</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Location
          </label>
          <Select value={selectedLocation} onValueChange={onLocationChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">
          {selectedAssignee !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Assignee: {selectedAssignee}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onAssigneeChange('all')}
              />
            </Badge>
          )}
          {selectedRewardType !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Reward: {rewardTypeLabels[selectedRewardType]}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onRewardTypeChange('all')}
              />
            </Badge>
          )}
          {selectedCategory !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Type: {selectedCategory}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onCategoryChange('all')}
              />
            </Badge>
          )}
          {selectedLocation !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Location: {selectedLocation}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onLocationChange('all')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
