import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Leaf } from 'lucide-react';
import { saveUser, getUser } from '@/utils/auth';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  useEffect(() => {
    if (getUser()) {
      navigate('/tasks');
    }
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    const user = {
      name: loginEmail.split('@')[0],
      email: loginEmail,
      tasksCompleted: 0,
      totalRewards: 0,
    };

    saveUser(user);
    toast({
      title: 'Welcome back!',
      description: `Logged in as ${user.name}`,
    });
    navigate('/tasks');
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupName || !signupEmail || !signupPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    const user = {
      name: signupName,
      email: signupEmail,
      tasksCompleted: 0,
      totalRewards: 0,
    };

    saveUser(user);
    toast({
      title: 'Account created!',
      description: `Welcome, ${user.name}!`,
    });
    navigate('/tasks');
  };

  return (
    <div className="min-h-screen bg-gradient-sky flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Leaf className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold text-primary">EcoEcho</h1>
          </div>
          <p className="text-muted-foreground">
            Connect with your city's environmental goals
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Join EcoEcho and start making a difference
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Sign Up
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
