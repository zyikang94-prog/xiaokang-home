import { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import IncomeForm from './IncomeForm';
import { STORAGE_KEYS } from '@/data/constants';
import { usePersistentList } from '@/hooks/usePersistentList';
import type { IIncome } from '@/data/types';
import { currentYear, formatMoney, yearOf } from '@/lib/format';
import { monthlyTotals, sum, yearlyTotals } from '@/lib/finance';
import { CHART, moneyAxisLabel } from '@/lib/chart';
import { genId } from '@/lib/store';

export default function IncomePage() {
  const { items, add, update, remove } = usePersistentList<IIncome>(STORAGE_KEYS.incomes);
  const [year, setYear] = useState<string>(currentYear());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<IIncome | null>(null);

  const years = useMemo(() => {
    const s = new Set(items.map((i) => yearOf(i.date)));
    s.add(currentYear());
    return [...s].sort().reverse();
  }, [items]);

  const yearItems = useMemo(() => items.filter((i) => i.date.startsWith(year)), [items, year]);
  const monthly = useMemo(() => monthlyTotals(items, year), [items, year]);
  const yearly = useMemo(() => yearlyTotals(items), [items]);

  const yearTotal = sum(yearItems.map((i) => i.amount));
  const totalAll = sum(items.map((i) => i.amount));
  const maxMonth = Math.max(0, ...Object.values(monthly));
  const sorted = [...yearItems].sort((a, b) => b.date.localeCompare(a.date));

  const monthOption = {
    tooltip: { trigger: 'axis', valueFormatter: (v: number) => `¥${formatMoney(v)}` },
    grid: { left: 56, right: 16, top: 24, bottom: 28 },
    xAxis: {
      type: 'category',
      data: Object.keys(monthly).map((k) => `${Number(k.slice(5))}月`),
      axisLine: { lineStyle: { color: 'var(--border)' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: moneyAxisLabel },
      splitLine: { lineStyle: { color: 'var(--border)' } },
    },
    series: [
      {
        type: 'bar',
        data: Object.values(monthly),
        barMaxWidth: 26,
        itemStyle: { color: CHART.primary, borderRadius: [4, 4, 0, 0] },
      },
    ],
  };

  const yearOption = {
    tooltip: { trigger: 'axis', valueFormatter: (v: number) => `¥${formatMoney(v)}` },
    grid: { left: 56, right: 16, top: 24, bottom: 28 },
    xAxis: { type: 'category', data: [...years].reverse().map((y) => `${y}年`) },
    yAxis: { type: 'value', axisLabel: { formatter: moneyAxisLabel } },
    series: [
      {
        type: 'bar',
        data: [...years].reverse().map((y) => yearly[y] ?? 0),
        barMaxWidth: 30,
        itemStyle: { color: CHART.accent, borderRadius: [4, 4, 0, 0] },
      },
    ],
  };

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (item: IIncome) => {
    setEditing(item);
    setOpen(true);
  };
  const handleSubmit = (data: Omit<IIncome, 'id'>) => {
    if (editing) {
      update(editing.id, data);
      toast.success('已更新收入');
    } else {
      add({ ...data, id: genId() });
      toast.success('已添加收入');
    }
  };
  const handleDelete = (item: IIncome) => {
    remove(item.id);
    toast.success('已删除该笔收入');
  };

  return (
    <div>
      <PageHeader
        title="家庭收入"
        description="按月记录，支持查看月金额、年收入及跨年累计。"
        actions={
          <>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}年
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={openNew}>
              <Plus className="size-4" />
              记一笔
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={`${year}年总收入`} value={`¥${formatMoney(yearTotal)}`} />
        <StatCard label="月均收入（年化）" value={`¥${formatMoney(yearTotal / 12)}`} />
        <StatCard label="累计收入（全部年份）" value={`¥${formatMoney(totalAll)}`} />
        <StatCard label="最高单月收入" value={`¥${formatMoney(maxMonth)}`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="gap-0 lg:col-span-2">
          <div className="p-4">
            <div className="mb-2 font-medium">{year}年各月收入</div>
            <ReactECharts option={monthOption} style={{ height: 300 }} />
          </div>
        </Card>
        <Card className="gap-0">
          <div className="p-4">
            <div className="mb-2 font-medium">各年收入对比</div>
            <ReactECharts option={yearOption} style={{ height: 300 }} />
          </div>
        </Card>
      </div>

      <Card className="mt-4 gap-0">
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="font-medium">{year}年收入明细</div>
          <span className="text-sm text-muted-foreground">{sorted.length} 笔</span>
        </div>
        <div className="px-4">
          {sorted.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              暂无收入记录，点击右上角「记一笔」开始。
            </div>
          ) : (
            <div className="divide-y">
              {sorted.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.category}</span>
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                    </div>
                    {item.note && (
                      <div className="truncate text-xs text-muted-foreground">{item.note}</div>
                    )}
                  </div>
                  <div className="font-medium tabular-nums text-up">
                    +{formatMoney(item.amount)}
                  </div>
                  <div className="flex gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => openEdit(item)}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <IncomeForm
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
