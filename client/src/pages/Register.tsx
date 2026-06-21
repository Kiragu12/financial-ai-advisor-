import { type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useRegister } from '../api/hooks/use-auth';
import { useAuth } from '../features/auth/useAuth';
import { AuthShell } from '../components/layout/AuthShell';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Field, HelperText } from '../components/ui/field';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const register = useRegister();

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    register.mutate(
      {
        fullName: String(form.get('name') ?? ''),
        email: String(form.get('email') ?? ''),
        password: String(form.get('password') ?? ''),
      },
      { onSuccess: () => navigate('/dashboard', { replace: true }) },
    );
  }

  return (
    <AuthShell
      eyebrow="Create your account"
      title="Get started with Akiba"
      description="Two minutes to set up. Free while in beta — built quietly in Nairobi."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-5">
        <Field>
          <Label htmlFor="register-name">Full name</Label>
          <Input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Amara Njoroge"
            required
          />
        </Field>

        <Field>
          <Label htmlFor="register-email">Email</Label>
          <Input
            id="register-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@strathmore.edu"
            required
          />
          <HelperText>We use this to send password resets and important account notes.</HelperText>
        </Field>

        <Field>
          <Label htmlFor="register-password">Password</Label>
          <Input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            minLength={8}
            required
          />
          <HelperText>Use at least 8 characters with a mix of letters and numbers.</HelperText>
        </Field>

        <Button
          variant="primary"
          type="submit"
          className="w-full justify-center"
          loading={register.isPending}
        >
          Create account
        </Button>

        {register.isError ? (
          <Alert variant="error" title="Could not create account">
            {register.error instanceof Error ? register.error.message : 'Please try again.'}
          </Alert>
        ) : null}
      </form>
    </AuthShell>
  );
}
