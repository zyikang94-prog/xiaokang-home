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
import { METAL_TYPES } from '@/data/constants';
import type { IMetal } from '@/data/types';
import { cn } from '@/lib/utils';
import { fetchGoldPrice } from '@/lib/quotes';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: IMetal | null;
  onSubmit: (data: Omit<IMetal, 'id'>) => void;
}

const TYPES = Object.keys(METAL_TYPES);

export default function MetalForm({ open, onOpenChange, editing, onSubmit }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <MetalBody
          key={editing?.id ?? 'new'}
          editing={editing}
          onSubmit={onSubmit}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function MetalBody({
  editing,
  onSubmit,
  onClose,
}: {
  editing: IMetal | null;
  onSubmit: (data: Omit<IMetal, 'id'>) => void;
  onClose: () => void;
}) {
  const [type, setType] = useState<IMetal['type']>(editing?.type ?? 'gold');
  const [name, setName] = useState(editing?.name ?? '');
  const [weight, setWeight] = useState(editing ? String(editing.weight) : '');
  const [cost, setCost] = useState(editing ? String(editing.cost) : '');
  const [currentPrice, setCurrentPrice] = useState(
    editing ? String(editing.currentPrice) : '',
  );
  const [note, setNote] = useState(editing?.note ?? '');
  const [loadingGold, setLoadingGold] = useState(false);

  const fillGold = async () => {
    setLoadingGold(true);
    try {
      const p = await fetchGoldPrice();
      setCurrentPrice(String(p));
      toast.success(`已获取金价 ¥${p}/克`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : '获取金价失败');
    } finally {
      setLoadingGold(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('请输入名称');
      return;
    }
    const w = Number(weight);
    const c = Number(cost);
    const p = Number(currentPrice);
    if (!Number.isFinite(w) || w <= 0 || !Number.isFinite(c) || c < 0) {
      toast.error('请输入有效的克数与每克成本');
      return;
    }
    onSubmit({
      type,
      name: name.trim(),
      weight: w,
      cost: c,
      currentPrice: Number.isFinite(p) && p > 0 ? p : 0,
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{editing ? '编辑贵金属' : '添加贵金属'}</DialogTitle>
        <DialogDescription>按克数登记，黄金可一键获取当前每克价。</DialogDescription>
      </DialogHeader>
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <RadioGroup
          value={type}
          onValueChange={(v) => setType(v as IMetal['type'])}
          className="grid grid-cols-4 gap-2"
        >
          {TYPES.map((t) => (
            <Label
              key={t}
              className={cn(
                'flex cursor-pointer items-center justify-center rounded-md border p-2 text-xs font-medium',
                type === t && 'border-primary bg-primary/5',
              )}
            >
              <RadioGroupItem value={t} className="sr-only" />
              {METAL_TYPES[t].label}
            </Label>
          ))}
        </RadioGroup>

        <div className="grid gap-2">
          <Label htmlFor="metal-name">名称</Label>
          <Input
            id="metal-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="如：投资金条 / 积存金"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="metal-weight">克数（克）</Label>
            <Input
              id="metal-weight"
              type="number"
              step="0.001"
              min="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="metal-cost">每克成本（元）</Label>
            <Input
              id="metal-cost"
              type="number"
              step="0.01"
              min="0"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="metal-price">当前每克价（元）</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fillGold}
              disabled={loadingGold}
            >
              {loadingGold ? '获取中…' : '获取当前金价'}
            </Button>
          </div>
          <Input
            id="metal-price"
            type="number"
            step="0.01"
            min="0"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(e.target.value)}
            placeholder="可留空，黄金可一键获取"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="metal-note">备注</Label>
          <Input id="metal-note" value={note} onChange={(e) => setNote(e.target.value)} />
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
