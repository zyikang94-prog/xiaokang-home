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
import { LIABILITY_TYPES } from '@/data/constants';
import type { ILiability } from '@/data/types';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: ILiability | null;
  onSubmit: (data: Omit<ILiability, 'id'>) => void;
}

const TYPES = Object.keys(LIABILITY_TYPES);

export default function LiabilityForm({ open, onOpenChange, editing, onSubmit }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <LiabBody
          key={editing?.id ?? 'new'}
          editing={editing}
          onSubmit={onSubmit}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function LiabBody({
  editing,
  onSubmit,
  onClose,
}: {
  editing: ILiability | null;
  onSubmit: (data: Omit<ILiability, 'id'>) => void;
  onClose: () => void;
}) {
  const [type, setType] = useState<ILiability['type']>(editing?.type ?? 'mortgage');
  const [name, setName] = useState(editing?.name ?? '');
  const [balance, setBalance] = useState(editing ? String(editing.balance) : '');
  const [monthlyPayment, setMonthlyPayment] = useState(
    editing?.monthlyPayment != null ? String(editing.monthlyPayment) : '',
  );
  const [note, setNote] = useState(editing?.note ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('请输入名称');
      return;
    }
    const bal = Number(balance);
    const pay = Number(monthlyPayment);
    if (!Number.isFinite(bal) || bal < 0) {
      toast.error('请输入有效的剩余欠款');
      return;
    }
    onSubmit({
      type,
      name: name.trim(),
      balance: bal,
      monthlyPayment: Number.isFinite(pay) && pay > 0 ? pay : undefined,
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{editing ? '编辑负债' : '添加负债'}</DialogTitle>
        <DialogDescription>登记房贷、车贷、信用卡等，用于计算净资产。</DialogDescription>
      </DialogHeader>
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <RadioGroup
          value={type}
          onValueChange={(v) => setType(v as ILiability['type'])}
          className="grid grid-cols-3 gap-2"
        >
          {TYPES.map((t) => (
            <Label
              key={t}
              htmlFor={`liab-${t}`}
              className={cn(
                'flex cursor-pointer items-center justify-center rounded-md border p-2 text-xs font-medium',
                type === t && 'border-primary bg-primary/5',
              )}
            >
              <RadioGroupItem id={`liab-${t}`} value={t} className="sr-only" />
              {LIABILITY_TYPES[t].label}
            </Label>
          ))}
        </RadioGroup>

        <div className="grid gap-2">
          <Label htmlFor="liab-name">名称</Label>
          <Input
            id="liab-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="如：XX银行住房贷款"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="liab-balance">剩余欠款（元）</Label>
            <Input
              id="liab-balance"
              type="number"
              min="0"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="liab-pay">每月还款（元）</Label>
            <Input
              id="liab-pay"
              type="number"
              min="0"
              value={monthlyPayment}
              onChange={(e) => setMonthlyPayment(e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="liab-note">备注</Label>
          <Input id="liab-note" value={note} onChange={(e) => setNote(e.target.value)} />
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
