import { Plus } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { useContribute, useCreateGoal } from '../../api/hooks/use-goals';
import { MoneyInput } from '../../components/finance/MoneyInput';
import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '../../components/ui/dialog';
import { ErrorText, Field, HelperText } from '../../components/ui/field';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { todayIso } from '../../lib/date';

interface AddGoalDialogProps {
  trigger?: ReactNode;
}

export function AddGoalDialog({ trigger }: AddGoalDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [initial, setInitial] = useState('');
  const [errors, setErrors] = useState<{ name?: string; target?: string; deadline?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createGoal = useCreateGoal();
  const contribute = useContribute();
  const pending = createGoal.isPending || contribute.isPending;

  function reset() {
    setName('');
    setTarget('');
    setDeadline('');
    setInitial('');
    setErrors({});
    setSubmitError(null);
    createGoal.reset();
    contribute.reset();
  }

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    setOpen(next);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: { name?: string; target?: string; deadline?: string } = {};
    if (name.trim() === '') next.name = 'Give the goal a name.';
    if (target.trim() === '' || Number(target) <= 0) {
      next.target = 'Set a target greater than zero.';
    }
    if (deadline && deadline < todayIso()) {
      next.deadline = 'Deadline cannot be in the past.';
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitError(null);
    try {
      const { goal } = await createGoal.mutateAsync({
        name: name.trim(),
        targetAmount: Number(target),
        deadline: deadline || undefined,
      });
      // Optional opening contribution — a manual one (no wallet) just seeds the
      // running total; it doesn't move any wallet balance.
      if (initial.trim() !== '' && Number(initial) > 0) {
        await contribute.mutateAsync({ goalId: goal.id, amount: Number(initial) });
      }
      handleOpenChange(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Please try again.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="primary" leftIcon={<Plus size={16} />}>
            Add goal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader
          eyebrow="New goal"
          title="Set a savings goal"
          description="A laptop, a trip, an emergency fund — Akiba tracks progress as you save."
        />
        <form onSubmit={handleSubmit} noValidate className="grid gap-5">
          <Field>
            <Label htmlFor="goal-name">Name</Label>
            <Input
              id="goal-name"
              autoFocus
              required
              value={name}
              invalid={Boolean(errors.name)}
              onChange={(event) => {
                setName(event.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="e.g. New laptop"
            />
            {errors.name ? <ErrorText>{errors.name}</ErrorText> : null}
          </Field>

          <Field>
            <Label htmlFor="goal-target">Target</Label>
            <MoneyInput
              id="goal-target"
              required
              value={target}
              invalid={Boolean(errors.target)}
              onChange={(event) => {
                setTarget(event.target.value);
                if (errors.target) setErrors((prev) => ({ ...prev, target: undefined }));
              }}
            />
            {errors.target ? <ErrorText>{errors.target}</ErrorText> : null}
          </Field>

          <Field>
            <Label htmlFor="goal-deadline">Deadline (optional)</Label>
            <Input
              id="goal-deadline"
              type="date"
              value={deadline}
              min={todayIso()}
              invalid={Boolean(errors.deadline)}
              onChange={(event) => {
                setDeadline(event.target.value);
                if (errors.deadline) setErrors((prev) => ({ ...prev, deadline: undefined }));
              }}
            />
            {errors.deadline ? (
              <ErrorText>{errors.deadline}</ErrorText>
            ) : (
              <HelperText>Akiba paces you towards this date.</HelperText>
            )}
          </Field>

          <Field>
            <Label htmlFor="goal-initial">Initial contribution (optional)</Label>
            <MoneyInput
              id="goal-initial"
              value={initial}
              onChange={(event) => setInitial(event.target.value)}
            />
            <HelperText>Seeds the running total. Doesn&rsquo;t move a wallet balance.</HelperText>
          </Field>

          {submitError ? (
            <Alert variant="error" title="Could not create goal">
              {submitError}
            </Alert>
          ) : null}

          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={pending}>
              Create goal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
