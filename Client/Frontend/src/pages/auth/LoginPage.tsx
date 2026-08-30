import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../stores/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Sparkles, Lock, Mail, AlertCircle } from 'lucide-react';

interface LoginFormInputs {
  email: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      email: 'client@cospace.com',
      password: 'Client@123456',
    },
  });

  const from = (location.state as any)?.from?.pathname || '/workspaces';

  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md shadow-2xl border-border/80 bg-card/80 backdrop-blur-xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Sparkles className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-black tracking-tight">Welcome Back</CardTitle>
          <CardDescription className="text-xs">
            Sign in to manage your coworking bookings & passes
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive animate-in fade-in-50">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="client@cospace.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email', { required: 'Email address is required' })}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register('password', { required: 'Password is required' })}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2 font-semibold shadow-lg shadow-primary/20"
            >
              Sign In to CoSpace
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground pt-2">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Sign up for free
            </Link>
          </div>

          {/* Demo credentials helper */}
          <div className="mt-4 rounded-lg border border-border/80 bg-background/50 p-3 text-center text-xs text-muted-foreground">
            <div className="font-semibold text-foreground/80 mb-1">Development Credentials:</div>
            <div>
              Email: <strong className="text-foreground">client@cospace.com</strong>
            </div>
            <div>
              Password: <strong className="text-foreground">Client@123456</strong>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
