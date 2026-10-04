import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { EXPENSE_CATEGORIES, EXPENSE_KINDS } from '@/data/constants';
import type { ExpenseKind, IExpense } from '@/data/types';
import { cn } from '@/lib/utils';
import { todayStr } from '@/lib/format';

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: IExpense | null;
  onSubmit: (data: Omit<IExpense, 'id'>) => void;
}

const KINDS = Object.keys(EXPENSE_KINDS) as ExpenseKind[];

export default function ExpenseForm({ open, onOpenChange, editing, onSubmit }: ExpenseFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <ExpenseBody
          key={editing?.id ?? 'new'}
          editing={editing}
          onSubmit={onSubmit}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function ExpenseBody({
  editing,
  onSubmit,
  onClose,
}: {
  editing: IExpense | null;
  onSubmit: (data: Omit<IExpense, 'id'>) => void;
  onClose: () => void;
}) {
  const [date, setDate] = useState(editing?.date ?? todayStr());
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '');
  const [kind, setKind] = useState<ExpenseKind>(editing?.kind ?? 'life');
  const [category, setCategory] = useState(editing?.category ?? '');
  const [note, setNote] = useState(editing?.note ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error('请输入有效的支出金额');
      return;
    }
    if (!category.trim()) {
      toast.error('请选择或输入支出子分类');
      return;
    }
    onSubmit({
      date,
      amount: amt,
      kind,
      category: category.trim(),
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{editing ? '编辑支出' : '记录支出'}</DialogTitle>
        <DialogDescription>按月记录，分为固定、生活、额外三类。</DialogDescription>
      </DialogHeader>
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <RadioGroup
          value={kind}
          onValueChange={(v) => {
            setKind(v as ExpenseKind);
            setCategory('');
          }}
          className="grid grid-cols-3 gap-2"
        >
          {KINDS.map((k) => (
            <Label
              key={k}
              htmlFor={`kind-${k}`}
              className={cn(
                'flex cursor-pointer flex-col gap-1 rounded-md border p-2.5',
                kind === k && 'border-primary bg-primary/5',
              )}
            >
              <RadioGroupItem id={`kind-${k}`} value={k} className="sr-only" />
              <span className="text-sm font-medium">{EXPENSE_KINDS[k].label}</span>
              <span className="text-[11px] text-muted-foreground">{EXPENSE_KINDS[k].hint}</span>
            </Label>
          ))}
        </RadioGroup>

        <div className="grid gap-2">
          <Label htmlFor="expense-date">日期</Label>
          <Input
            id="expense-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="expense-amount">金额（元）</Label>
          <Input
            id="expense-amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="expense-category">子分类</Label>
          <Input
            id="expense-category"
            list="expense-categories"
            placeholder="选择或输入"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <datalist id="expense-categories">
            {EXPENSE_CATEGORIES[kind].map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="expense-note">备注</Label>
          <Input
            id="expense-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="可选"
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button type="submit">{editing ? '保存' : '添加'}</Button>
        </DialogFooter>
      </form>
    </>
  );
}
