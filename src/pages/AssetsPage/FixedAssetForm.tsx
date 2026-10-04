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
import { FIXED_TYPES } from '@/data/constants';
import type { IFixedAsset } from '@/data/types';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: IFixedAsset | null;
  onSubmit: (data: Omit<IFixedAsset, 'id'>) => void;
}

const TYPES = Object.keys(FIXED_TYPES);

export default function FixedAssetForm({ open, onOpenChange, editing, onSubmit }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <FixedBody
          key={editing?.id ?? 'new'}
          editing={editing}
          onSubmit={onSubmit}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function FixedBody({
  editing,
  onSubmit,
  onClose,
}: {
  editing: IFixedAsset | null;
  onSubmit: (data: Omit<IFixedAsset, 'id'>) => void;
  onClose: () => void;
}) {
  const [type, setType] = useState<'property' | 'car'>(editing?.type ?? 'property');
  const [name, setName] = useState(editing?.name ?? '');
  const [cost, setCost] = useState(editing ? String(editing.cost) : '');
  const [value, setValue] = useState(editing ? String(editing.value) : '');
  const [purchaseDate, setPurchaseDate] = useState(editing?.purchaseDate ?? '');
  const [note, setNote] = useState(editing?.note ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('请输入资产名称');
      return;
    }
    const c = Number(cost);
    const v = Number(value);
    if (!Number.isFinite(c) || c < 0 || !Number.isFinite(v) || v < 0) {
      toast.error('请输入有效的成本与估值');
      return;
    }
    onSubmit({
      type,
      name: name.trim(),
      cost: c,
      value: v,
      purchaseDate: purchaseDate || undefined,
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{editing ? '编辑固定资产' : '添加固定资产'}</DialogTitle>
        <DialogDescription>登记房产、汽车，按成本与当前估值计算收益。</DialogDescription>
      </DialogHeader>
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <RadioGroup
          value={type}
          onValueChange={(v) => setType(v as 'property' | 'car')}
          className="grid grid-cols-2 gap-2"
        >
          {TYPES.map((t) => (
            <Label
              key={t}
              htmlFor={`fixed-${t}`}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-md border p-2.5 text-sm font-medium',
                type === t && 'border-primary bg-primary/5',
              )}
            >
              <RadioGroupItem id={`fixed-${t}`} value={t} className="sr-only" />
              {FIXED_TYPES[t].label}
            </Label>
          ))}
        </RadioGroup>

        <div className="grid gap-2">
          <Label htmlFor="fixed-name">名称</Label>
          <Input
            id="fixed-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="如：XX小区住宅 / 家用轿车"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="fixed-cost">购置成本（元）</Label>
            <Input
              id="fixed-cost"
              type="number"
              min="0"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fixed-value">当前估值（元）</Label>
            <Input
              id="fixed-value"
              type="number"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="fixed-date">购置日期</Label>
          <Input
            id="fixed-date"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="fixed-note">备注</Label>
          <Input id="fixed-note" value={note} onChange={(e) => setNote(e.target.value)} />
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
