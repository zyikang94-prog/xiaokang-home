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
import { INCOME_CATEGORIES } from '@/data/constants';
import type { IIncome } from '@/data/types';
import { todayStr } from '@/lib/format';

interface IncomeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: IIncome | null;
  onSubmit: (data: Omit<IIncome, 'id'>) => void;
}

export default function IncomeForm({ open, onOpenChange, editing, onSubmit }: IncomeFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <IncomeBody
          key={editing?.id ?? 'new'}
          editing={editing}
          onSubmit={onSubmit}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function IncomeBody({
  editing,
  onSubmit,
  onClose,
}: {
  editing: IIncome | null;
  onSubmit: (data: Omit<IIncome, 'id'>) => void;
  onClose: () => void;
}) {
  const [date, setDate] = useState(editing?.date ?? todayStr());
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '');
  const [category, setCategory] = useState(editing?.category ?? '');
  const [note, setNote] = useState(editing?.note ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error('请输入有效的收入金额');
      return;
    }
    if (!category.trim()) {
      toast.error('请选择或输入收入来源');
      return;
    }
    onSubmit({
      date,
      amount: amt,
      category: category.trim(),
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{editing ? '编辑收入' : '记录收入'}</DialogTitle>
        <DialogDescription>按月记录一笔家庭收入。</DialogDescription>
      </DialogHeader>
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="income-date">日期</Label>
          <Input
            id="income-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="income-amount">金额（元）</Label>
          <Input
            id="income-amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="income-category">收入来源</Label>
          <Input
            id="income-category"
            list="income-categories"
            placeholder="选择或输入"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <datalist id="income-categories">
            {INCOME_CATEGORIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="income-note">备注</Label>
          <Input
            id="income-note"
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
