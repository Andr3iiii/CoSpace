import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../stores/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { theme } from '../../theme/theme';
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
    setValue,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      email: 'admin@cospace.com',
      password: 'Admin@123456',
    },
  });

  const from = (location.state as any)?.from?.pathname || '/admin';

  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: theme.colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: theme.colors.surfaceCard,
          borderRadius: theme.radius.lg,
          border: `1px solid ${theme.colors.border}`,
          boxShadow: theme.shadows.lg,
          padding: '36px',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
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
            <Sparkles size={26} />
          </div>
          <h2 style={{ fontSize: theme.typography.fontSize.xxl, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text }}>
            CoSpace Admin
          </h2>
          <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textMuted, marginTop: '4px' }}>
            Enterprise Space Management System
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
          <Input
            label="Administrator Email"
            type="email"
            placeholder="admin@cospace.com"
            leftIcon={<Mail size={16} />}
            error={errors.email?.message}
            {...register('email', {
              required: 'Email address is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address',
              },
            })}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock size={16} />}
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            style={{ width: '100%', marginTop: '12px' }}
          >
            Sign In to Dashboard
          </Button>
        </form>

        {/* Demo credentials helper */}
        <div
          style={{
            marginTop: '24px',
            padding: '12px',
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.md,
            border: `1px solid ${theme.colors.border}`,
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.textDim,
            textAlign: 'center',
          }}
        >
          <div style={{ fontWeight: 600, color: theme.colors.textMuted, marginBottom: '4px' }}>
            Development Credentials:
          </div>
          <div>Email: <strong style={{ color: theme.colors.text }}>admin@cospace.com</strong></div>
          <div>Password: <strong style={{ color: theme.colors.text }}>Admin@123456</strong></div>
        </div>
      </div>
    </div>
  );
};
