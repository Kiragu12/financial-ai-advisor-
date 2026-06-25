import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useCreateBudget } from '../../api/hooks/use-budgets';
import { useCategories, useCreateCategory } from '../../api/hooks/use-categories';
import type { CategoryType } from '../../api/types';
import { MoneyInput } from '../../components/finance/MoneyInput';
import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { ErrorText, Field, HelperText } from '../../components/ui/field';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

interface CategoryPickerProps {
  id: string;
  type: CategoryType;
  value: string;
  onChange: (categoryId: string) => void;
}

export function CategoryPicker({ id, type, value, onChange }: CategoryPickerProps) {
  const { data: categories = [] } = useCategories(type);
  const createCategory = useCreateCategory();
  const createBudget = useCreateBudget();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [withBudget, setWithBudget] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [budgetError, setBudgetError] = useState<string | null>(null);

  function resetCreateForm() {
    setName('');
    setWithBudget(false);
    setBudgetAmount('');
    setNameError(null);
    setBudgetError(null);
    createCategory.reset();
    createBudget.reset();
  }

  async function handleCreate() {
    const cleanName = name.trim();
    let hasError = false;

    if (cleanName === '') {
      setNameError('Enter a category name.');
      hasError = true;
    }
    if (type === 'expense' && withBudget && (budgetAmount.trim() === '' || Number(budgetAmount) <= 0)) {
      setBudgetError('Enter a budget amount greater than zero.');
      hasError = true;
    }
    if (hasError) return;

    try {
      const { category } = await createCategory.mutateAsync({ name: cleanName, type });
      if (type === 'expense' && withBudget) {
        await createBudget.mutateAsync({
          categoryId: category.id,
          amount: Number(budgetAmount),
        });
      }
      onChange(category.id);
      resetCreateForm();
      setCreating(false);
    } catch {
      // The mutation objects carry the displayable error state.
    }
  }

  const isSaving = createCategory.isPending || createBudget.isPending;
  const saveError = createCategory.error ?? createBudget.error;

  return (
    <Field>
      <Label htmlFor={id}>Category (optional)</Label>
      <select
        id={id}
        className="input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Uncategorised</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
            {category.isCustom ? ' (custom)' : ''}
          </option>
        ))}
      </select>

      {creating ? (
        <div className="rounded-card-sm border border-line p-3">
          <Field>
            <Label htmlFor={`${id}-new`}>New {type} category</Label>
            <Input
              id={`${id}-new`}
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (nameError) setNameError(null);
              }}
              placeholder={type === 'expense' ? 'e.g. Boda' : 'e.g. Freelance work'}
            />
            {nameError ? <ErrorText>{nameError}</ErrorText> : null}
          </Field>

          {type === 'expense' ? (
            <div className="rounded-card-sm bg-surface-2 p-3">
              <label className="flex items-center gap-2 text-sm font-medium text-ink">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-line"
                  checked={withBudget}
                  onChange={(event) => {
                    setWithBudget(event.target.checked);
                    if (!event.target.checked) setBudgetError(null);
                  }}
                />
                Set monthly budget now
              </label>
              {withBudget ? (
                <Field className="mt-3">
                  <Label htmlFor={`${id}-budget`}>Monthly budget</Label>
                  <MoneyInput
                    id={`${id}-budget`}
                    value={budgetAmount}
                    invalid={budgetError !== null}
                    onChange={(event) => {
                      setBudgetAmount(event.target.value);
                      if (budgetError) setBudgetError(null);
                    }}
                  />
                  {budgetError ? <ErrorText>{budgetError}</ErrorText> : null}
                </Field>
              ) : (
                <HelperText className="mt-2">
                  You can also set or edit budgets later from the Budgets page.
                </HelperText>
              )}
            </div>
          ) : null}

          {saveError ? (
            <Alert variant="error" title="Could not create category">
              {saveError instanceof Error ? saveError.message : 'Please try again.'}
            </Alert>
          ) : null}

          <div className="mt-3 flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => {
                resetCreateForm();
                setCreating(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="button"
              loading={isSaving}
              onClick={handleCreate}
            >
              Save category
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          type="button"
          leftIcon={<Plus size={15} />}
          className="w-fit"
          onClick={() => setCreating(true)}
        >
          Create custom category
        </Button>
      )}
    </Field>
  );
}
