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
import { CASH_TYPES } from '@/data/constants';
import type { ICashAsset } from '@/data/types';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: ICashAsset | null;
  onSubmit: (data: Omit<ICashAsset, 'id'>) => void;
}

const TYPES = Object.keys(CASH_TYPES);

export default function CashAssetForm({ open, onOpenChange, editing, onSubmit }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <CashBody
          key={editing?.id ?? 'new'}
          editing={editing}
          onSubmit={onSubmit}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function CashBody({
  editing,
  onSubmit,
  onClose,
}: {
  editing: ICashAsset | null;
  onSubmit: (data: Omit<ICashAsset, 'id'>) => void;
  onClose: () => void;
}) {
  const [type, setType] = useState<'cash' | 'deposit'>(editing?.type ?? 'cash');
  const [name, setName] = useState(editing?.name ?? '');
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '');
  const [principal, setPrincipal] = useState(editing ? String(editing.principal) : '');
  const [interestRate, setInterestRate] = useState(
    editing?.interestRate != null ? String(editing.interestRate) : '',
  );
  const [note, setNote] = useState(editing?.note ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('请输入名称');
      return;
    }
    const amt = Number(amount);
    const prin = Number(principal);
    if (!Number.isFinite(amt) || amt < 0 || !Number.isFinite(prin) || prin < 0) {
      toast.error('请输入有效的余额与本金');
      return;
    }
    onSubmit({
      type,
      name: name.trim(),
      amount: amt,
      principal: prin,
      interestRate: type === 'deposit' && interestRate ? Number(interestRate) : undefined,
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{editing ? '编辑现金/存款' : '添加现金/存款'}</DialogTitle>
        <DialogDescription>登记移动现金与银行存款，按本金与余额算收益。</DialogDescription>
      </DialogHeader>
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <RadioGroup
          value={type}
          onValueChange={(v) => setType(v as 'cash' | 'deposit')}
          className="grid grid-cols-2 gap-2"
        >
          {TYPES.map((t) => (
            <Label
              key={t}
              htmlFor={`cash-${t}`}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-md border p-2.5 text-sm font-medium',
                type === t && 'border-primary bg-primary/5',
              )}
            >
              <RadioGroupItem id={`cash-${t}`} value={t} className="sr-only" />
              {CASH_TYPES[t].label}
            </Label>
          ))}
        </RadioGroup>

        <div className="grid gap-2">
          <Label htmlFor="cash-name">名称</Label>
          <Input
            id="cash-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="如：钱包现金 / 工商银行定期"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="cash-amount">当前余额（元）</Label>
            <Input
              id="cash-amount"
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cash-principal">投入本金（元）</Label>
            <Input
              id="cash-principal"
              type="number"
              min="0"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
            />
          </div>
        </div>
        {type === 'deposit' && (
          <div className="grid gap-2">
            <Label htmlFor="cash-rate">年利率（%，可选）</Label>
            <Input
              id="cash-rate"
              type="number"
              step="0.01"
              min="0"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="如 2.5"
            />
          </div>
        )}
        <div className="grid gap-2">
          <Label htmlFor="cash-note">备注</Label>
          <Input id="cash-note" value={note} onChange={(e) => setName(e.target.value)} />
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
