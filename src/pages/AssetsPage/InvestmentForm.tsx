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
import { INVEST_TYPES } from '@/data/constants';
import type { IInvestment } from '@/data/types';
import { cn } from '@/lib/utils';
import { normalizeCode } from '@/lib/quotes';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: IInvestment | null;
  onSubmit: (data: Omit<IMetal, 'id'>) => void;
}

const TYPES = Object.keys(INVEST_TYPES);

export default function InvestmentForm({ open, onOpenChange, editing, onSubmit }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <InvestBody
          key={editing?.id ?? 'new'}
          editing={editing}
          onSubmit={onSubmit}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function InvestBody({
  editing,
  onSubmit,
  onClose,
}: {
  editing: IInvestment | null;
  onSubmit: (data: Omit<IMetal, 'id'>) => void;
  onClose: () => void;
}) {
  const [type, setType] = useState<'stock' | 'etf'>(editing?.type ?? 'stock');
  const [name, setName] = useState(editing?.name ?? '');
  const [code, setCode] = useState(editing?.code ?? '');
  const [shares, setShares] = useState(editing ? String(editing.shares) : '');
  const [cost, setCost] = useState(editing ? String(editing.cost) : '');
  const [currentPrice, setCurrentPrice] = useState(editing ? String(editing.currentPrice) : '');
  const [note, setNote] = useState(editing?.note ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('请输入名称');
      return;
    }
    const fullCode = normalizeCode(code);
    if (!/\w{6}$/.test(fullCode)) {
      toast.error('请输入 6 位代码');
      return;
    }
    const sh = Number(shares);
    const c = Number(cost);
    const price = Number(currentPrice);
    if (!Number.isFinite(sh) || sh <= 0 || !Number.isFinite(c) || c < 0) {
      toast.error('请输入有效的份额与成本');
      return;
    }
    onSubmit({
      type,
      name: name.trim(),
      code: fullCode,
      shares: sh,
      cost: c,
      currentPrice: Number.isFinite(price) && price > 0 ? price : 0,
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{editing ? '编辑投资' : '添加股票 / ETF'}</DialogTitle>
        <DialogDescription>登记持仓与成本；可一键刷新最新价。</DialogDescription>
      </DialogHeader>
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <RadioGroup
          value={type}
          onValueChange={(v) => setType(v as 'stock' | 'etf')}
          className="grid grid-cols-2 gap-2"
        >
          {TYPES.map((t) => (
            <Label
              key={t}
              htmlFor={`inv-${t}`}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-md border p-2.5 text-sm font-medium',
                type === t && 'border-primary bg-primary/5',
              )}
            >
              <RadioGroupItem id={`inv-${t}`} value={t} className="sr-only" />
              {INVEST_TYPES[t].label}
            </Label>
          ))}
        </RadioGroup>

        <div className="grid gap-2">
          <Label htmlFor="inv-name">名称</Label>
          <Input
            id="inv-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="如：长江电力 / 沪深300ETF"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="inv-code">代码（6 位）</Label>
            <Input
              id="inv-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="如 600900 / 510300"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="inv-shares">持有份额</Label>
            <Input
              id="inv-shares"
              type="number"
              step="0.01"
              min="0"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="inv-cost">每股成本（元）</Label>
            <Input
              id="inv-cost"
              type="number"
              step="0.001"
              min="0"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="inv-price">当前价（可留空）</Label>
            <Input
              id="inv-price"
              type="number"
              step="0.001"
              min="0"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="inv-note">备注</Label>
          <Input id="inv-note" value={note} onChange={(e) => setNote(e.target.value)} />
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
