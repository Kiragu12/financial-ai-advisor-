import { type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useLogin } from '../api/hooks/use-auth';
import { useAuth } from '../features/auth/useAuth';
import { AuthShell } from '../components/layout/AuthShell';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Field, HelperText } from '../components/ui/field';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const login = useLogin();

  // Where to land after login: the page they were bounced from, else dashboard.
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  // Already signed in (e.g. navigated here manually) — skip the form.
  if (!isLoading && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    login.mutate(
      {
        email: String(form.get('email') ?? ''),
        password: String(form.get('password') ?? ''),
      },
      { onSuccess: () => navigate(from, { replace: true }) },
    );
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Log in to Akiba"
      description="Pick up where you left off — your wallets, transactions and goals, ready when you are."
      footer={
        <>
          New to Akiba?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="grid gap-5">
        <Field>
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@strathmore.edu"
            required
          />
        </Field>

        <Field>
          <Label htmlFor="login-password">Password</Label>
          <Input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            minLength={8}
            required
          />
          <HelperText>At least 8 characters.</HelperText>
        </Field>

        <Button
          variant="primary"
          type="submit"
          className="w-full justify-center"
          loading={login.isPending}
        >
          Log in
        </Button>

        {login.isError ? (
          <Alert variant="error" title="Could not log in">
            {login.error instanceof Error ? login.error.message : 'Please try again.'}
          </Alert>
        ) : null}
      </form>
    </AuthShell>
  );
}
