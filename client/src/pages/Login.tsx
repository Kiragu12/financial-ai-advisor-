import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AuthShell } from '../components/layout/AuthShell';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Field, HelperText } from '../components/ui/field';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export function Login() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
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
      <form onSubmit={handleSubmit} noValidate={false} className="grid gap-5">
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

        <Button variant="primary" type="submit" className="w-full justify-center">
          Log in
        </Button>

        {submitted ? (
          <Alert variant="info" title="Backend not ready">
            The login endpoint goes live once Paul ships{' '}
            <code className="font-mono">POST /api/auth/login</code>. Form is wired and waiting.
          </Alert>
        ) : null}
      </form>
    </AuthShell>
  );
}
