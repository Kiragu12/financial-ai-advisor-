import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AuthShell } from '../components/layout/AuthShell';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Field, HelperText } from '../components/ui/field';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export function Register() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
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

        <Button variant="primary" type="submit" className="w-full justify-center">
          Create account
        </Button>

        {submitted ? (
          <Alert variant="info" title="Backend not ready">
            Registration goes live once Paul ships{' '}
            <code className="font-mono">POST /api/auth/register</code>. Form is wired and waiting.
          </Alert>
        ) : null}
      </form>
    </AuthShell>
  );
}
