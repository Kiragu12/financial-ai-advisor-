import { Gauge, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { useBudgets, useCreateBudget, useDeleteBudget, useUpdateBudget } from '../api/hooks/use-budgets';
import { useCategories } from '../api/hooks/use-categories';
import type { Budget } from '../api/types';
import { EmptyState } from '../components/finance/EmptyState';
import { MoneyInput } from '../components/finance/MoneyInput';
import { PageHeader } from '../components/layout/PageHeader';
import { Alert } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ErrorText, Field, HelperText } from '../components/ui/field';
import { Label } from '../components/ui/label';
import { Spinner } from '../components/ui/spinner';
import { formatMoney } from '../lib/money';

export function Budgets() {
  const budgets = useBudgets();
  const { data: categories = [] } = useCategories('expense');
  const createBudget = useCreateBudget();
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState<string | null>(null);

  const budgetedCategoryIds = useMemo(
    () => new Set((budgets.data ?? []).map((budget) => budget.categoryId)),
    [budgets.data],
  );

  const availableCategories = categories.filter((category) => !budgetedCategoryIds.has(category.id));
  const effectiveCategoryId = categoryId || availableCategories[0]?.id || '';

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (amount.trim() === '' || Number(amount) <= 0) {
      setAmountError('Enter a budget amount greater than zero.');
      return;
    }
    if (!effectiveCategoryId) return;

    createBudget.mutate(
      { categoryId: effectiveCategoryId, amount: Number(amount) },
      {
        onSuccess: () => {
          setCategoryId('');
          setAmount('');
          setAmountError(null);
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Plan"
        title="Budgets"
        description="Set monthly spending limits for expense categories and watch this month's progress."
      />

      <Card>
        <form onSubmit={handleSubmit} noValidate className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <Field>
            <Label htmlFor="budget-category">Expense category</Label>
            <select
              id="budget-category"
              className="input"
              value={effectiveCategoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              disabled={availableCategories.length === 0}
            >
              {availableCategories.length === 0 ? (
                <option>Every expense category has a budget</option>
              ) : (
                availableCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                    {category.isCustom ? ' (custom)' : ''}
                  </option>
                ))
              )}
            </select>
            <HelperText>Only expense categories can have spending budgets.</HelperText>
          </Field>

          <Field>
            <Label htmlFor="budget-amount">Monthly limit</Label>
            <MoneyInput
              id="budget-amount"
              value={amount}
              invalid={amountError !== null}
              onChange={(event) => {
                setAmount(event.target.value);
                if (amountError) setAmountError(null);
              }}
            />
            {amountError ? <ErrorText>{amountError}</ErrorText> : null}
          </Field>

          <Button
            variant="primary"
            type="submit"
            leftIcon={<Plus size={16} />}
            loading={createBudget.isPending}
            disabled={availableCategories.length === 0}
          >
            Set budget
          </Button>
        </form>

        {createBudget.isError ? (
          <Alert variant="error" title="Could not set budget" className="mt-4">
            {createBudget.error instanceof Error ? createBudget.error.message : 'Please try again.'}
          </Alert>
        ) : null}
      </Card>

      {budgets.isError ? (
        <Alert variant="error" title="Couldn't load budgets">
          {budgets.error instanceof Error ? budgets.error.message : 'Please try again.'}
        </Alert>
      ) : budgets.isLoading ? (
        <div className="grid place-items-center py-16">
          <Spinner size={24} label="Loading budgets" />
        </div>
      ) : budgets.data && budgets.data.length > 0 ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {budgets.data.map((budget) => (
            <BudgetCard key={budget.id} budget={budget} />
          ))}
        </section>
      ) : (
        <EmptyState
          icon={Gauge}
          title="No budgets yet"
          description="Set a monthly limit for categories like Food, Transport or Rent to track spending as you log transactions."
        />
      )}
    </div>
  );
}

function BudgetCard({ budget }: { budget: Budget }) {
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(String(budget.amount));
  const [amountError, setAmountError] = useState<string | null>(null);

  const overBudget = budget.remaining < 0;
  const nearLimit = !overBudget && budget.percentage >= 80;
  const barClass = overBudget ? 'bg-expense' : nearLimit ? 'bg-amber' : 'bg-income';
  const status = overBudget
    ? `${formatMoney(Math.abs(budget.remaining))} over`
    : `${formatMoney(budget.remaining)} left`;

  function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (amount.trim() === '' || Number(amount) <= 0) {
      setAmountError('Enter an amount greater than zero.');
      return;
    }

    updateBudget.mutate(
      { budgetId: budget.id, amount: Number(amount) },
      {
        onSuccess: () => {
          setAmountError(null);
          setEditing(false);
        },
      },
    );
  }

  function handleDelete() {
    if (window.confirm(`Remove the ${budget.categoryName} budget?`)) {
      deleteBudget.mutate(budget.id);
    }
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">{budget.categoryName}</h2>
          <p className="mt-1 text-sm text-ink-2">
            {formatMoney(budget.spent)} spent of {formatMoney(budget.amount)}
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${budget.categoryName} budget`}
            onClick={() => {
              setAmount(String(budget.amount));
              setEditing((value) => !value);
            }}
          >
            <Pencil size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Remove ${budget.categoryName} budget`}
            onClick={handleDelete}
            loading={deleteBudget.isPending}
          >
            <Trash2 size={15} />
          </Button>
        </div>
      </div>

      <div>
        <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
          <div
            className={`h-full rounded-full ${barClass}`}
            style={{ width: `${budget.percentage}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between gap-3 text-xs font-medium text-ink-3">
          <span>{budget.percentage}% used</span>
          <span className={overBudget ? 'text-expense' : nearLimit ? 'text-amber' : 'text-income'}>
            {status}
          </span>
        </div>
      </div>

      {editing ? (
        <form onSubmit={handleUpdate} noValidate className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
          <Field>
            <Label htmlFor={`budget-${budget.id}`}>New monthly limit</Label>
            <MoneyInput
              id={`budget-${budget.id}`}
              value={amount}
              invalid={amountError !== null}
              onChange={(event) => {
                setAmount(event.target.value);
                if (amountError) setAmountError(null);
              }}
            />
            {amountError ? <ErrorText>{amountError}</ErrorText> : null}
          </Field>
          <div className="flex gap-2 sm:pt-6">
            <Button variant="ghost" type="button" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" loading={updateBudget.isPending}>
              Save
            </Button>
          </div>
          {updateBudget.isError ? (
            <Alert variant="error" title="Could not update budget" className="sm:col-span-2">
              {updateBudget.error instanceof Error ? updateBudget.error.message : 'Please try again.'}
            </Alert>
          ) : null}
        </form>
      ) : null}
    </Card>
  );
}
