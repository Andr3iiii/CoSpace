import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../stores/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Sparkles, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await registerAuth(data);
      navigate('/workspaces');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-lg shadow-2xl border-border/80 bg-card/80 backdrop-blur-xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Sparkles className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-black tracking-tight">Create Your Account</CardTitle>
          <CardDescription className="text-xs">
            Book desks, private suites, and meeting rooms instantly
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="First Name"
                placeholder="John"
                error={errors.firstName?.message as string}
                {...register('firstName', { required: 'First name is required' })}
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                error={errors.lastName?.message as string}
                {...register('lastName', { required: 'Last name is required' })}
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="john.doe@company.com"
              error={errors.email?.message as string}
              {...register('email', { required: 'Email address is required' })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Phone (Optional)"
                placeholder="+63 917 000 0000"
                {...register('phone')}
              />
              <Input
                label="Company (Optional)"
                placeholder="Company Inc."
                {...register('companyName')}
              />
            </div>

            <Input
              label="Password (min 8 chars)"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message as string}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
              })}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2 font-semibold shadow-lg shadow-primary/20"
            >
              Create Account
            </Button>
          </form>

          <div className="text-center text-xs text-muted-foreground pt-2">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
