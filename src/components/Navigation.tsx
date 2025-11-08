import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { Leaf, LogOut } from 'lucide-react';
import { clearUser } from '@/utils/auth';
import { useNavigate } from 'react-router-dom';

export const Navigation = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearUser();
    navigate('/auth');
  };

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-primary">
              <Leaf className="h-8 w-8" />
              <span className="text-2xl font-bold">EcoEcho</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <NavLink 
              to="/tasks" 
              className="text-foreground/70 hover:text-foreground transition-colors"
              activeClassName="text-primary font-semibold"
            >
              Tasks
            </NavLink>
            <NavLink 
              to="/personal" 
              className="text-foreground/70 hover:text-foreground transition-colors"
              activeClassName="text-primary font-semibold"
            >
              Personal
            </NavLink>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
