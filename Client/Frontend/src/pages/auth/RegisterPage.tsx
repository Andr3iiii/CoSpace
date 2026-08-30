import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../stores/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { theme } from '../../theme/theme';
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
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: theme.colors.surfaceCard,
          borderRadius: theme.radius.lg,
          border: `1px solid ${theme.colors.border}`,
          boxShadow: theme.shadows.lg,
          padding: '36px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.primary,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: theme.shadows.glow,
              marginBottom: '12px',
            }}
          >
            <Sparkles size={24} />
          </div>
          <h2 style={{ fontSize: theme.typography.fontSize.xxl, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text }}>
            Create Your Account
          </h2>
          <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textMuted, marginTop: '4px' }}>
            Book desks, private suites, and meeting rooms instantly
          </p>
        </div>

        {errorMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px',
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.dangerBg,
              border: `1px solid ${theme.colors.dangerBorder}`,
              color: theme.colors.danger,
              fontSize: theme.typography.fontSize.sm,
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
            style={{ width: '100%', marginTop: '12px' }}
          >
            Create Account
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: theme.colors.textDim }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: theme.colors.primary, textDecoration: 'none', fontWeight: 600 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
