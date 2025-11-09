import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { Leaf, LogOut, User, ListTodo } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

export const Navigation = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');
  const [isOfficial, setIsOfficial] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', session.user.id)
          .single();
        
        setUserName(profile?.full_name || session.user.email || 'User');

        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        setIsOfficial(roleData?.role === 'official');
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
            {isOfficial ? (
              <NavLink 
                to="/tasks-review" 
                className="text-foreground/70 hover:text-foreground transition-colors"
                activeClassName="text-primary font-semibold"
              >
                Tasks Review
              </NavLink>
            ) : (
              <NavLink 
                to="/personal" 
                className="text-foreground/70 hover:text-foreground transition-colors"
                activeClassName="text-primary font-semibold"
              >
                Personal
              </NavLink>
            )}
            {isOfficial && (
              <NavLink 
                to="/requests" 
                className="text-foreground/70 hover:text-foreground transition-colors flex items-center gap-1"
                activeClassName="text-primary font-semibold"
              >
                <ListTodo className="h-4 w-4" />
                Requests
              </NavLink>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <User className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="text-center py-2">
                  <p className="text-lg font-semibold text-foreground">
                    Welcome, {userName}!
                  </p>
                </div>
              </PopoverContent>
            </Popover>
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
