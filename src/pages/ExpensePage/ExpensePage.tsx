import { useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ExpenseForm from './ExpenseForm';
import { EXPENSE_KINDS, STORAGE_KEYS } from '@/data/constants';
import { usePersistentList } from '@/hooks/usePersistentList';
import type { ExpenseKind, IExpense } from '@/data/types';
import { currentYear, formatMoney, yearOf } from '@/lib/format';
import { expenseByKind, monthlyTotals, sum } from '@/lib/finance';
import { CHART } from '@/lib/chart';
import { genId } from '@/lib/store';

const KIND_COLOR: Record<ExpenseKind, string> = {
  fixed: CHART.primary,
  life: CHART.accent,
  extra: CHART.red,
};

export default function ExpensePage() {
  const { items, add, update, remove } = usePersistentList<IExpense>(STORAGE_KEYS.expenses);
  const [year, setYear] = useState<string>(currentYear());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<IExpense | null>(null);

  const years = useMemo(() => {
    const s = new Set(items.map((i) => yearOf(i.date)));
    s.add(currentYear());
    return [...s].sort().reverse();
  }, [items]);

  const yearItems = useMemo(() => items.filter((i) => i.date.startsWith(year)), [items, year]);
  const kinds = useMemo(() => expenseByKind(items, year), [items, year]);
  const yearTotal = sum(yearItems.map((i) => i.amount));
  const sorted = [...yearItems].sort((a, b) => b.date.localeCompare(a.date));

  const monthKeys = Object.keys(monthlyTotals(items, year));
  const byKindMonthly = (Object.keys(EXPENSE_KINDS) as ExpenseKind[]).map((k) =>
    monthlyTotals(items.filter((i) => i.kind === k), year),
  );

  const stackOption = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: unknown) => {
        const list = params as Array<{
          axisValue: string;
          marker: string;
          seriesName: string;
          value: number;
        }>;
        if (!Array.isArray(list) || list.length === 0) return '';
        const total = list.reduce((a, p) => a + (Number(p.value) || 0), 0);
        const row = (label: string, value: string, bold = false) =>
          `<div style="display:flex;align-items:center;justify-content:space-between;gap:24px;${bold ? 'font-weight:600;' : ''}">
             <span>${label}</span><span style="font-variant-numeric:tabular-nums;">${value}</span>
           </div>`;
        const rows = list
          .map((p) => row(`${p.marker}${p.seriesName}`, `¥${formatMoney(p.value)}`))
          .join('');
        return `<div style="font-weight:600;margin-bottom:4px;">${list[0].axisValue}</div>${rows}
          <div style="border-top:1px solid rgba(0,0,0,.1);margin-top:5px;padding-top:5px;">
            ${row('支出总额', `¥${formatMoney(total)}`, true)}
          </div>`;
      },
    },
    legend: {
      data: (Object.keys(EXPENSE_KINDS) as ExpenseKind[]).map((k) => EXPENSE_KINDS[k].label),
      top: 0,
    },
    grid: { left: 56, right: 16, top: 32, bottom: 28 },
    xAxis: {
      type: 'category',
      data: monthKeys.map((k) => `${Number(k.slice(5))}月`),
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (v: number) =>
          Math.abs(v) >= 10000 ? `${v / 10000}万` : `${v}`,
      },
    },
    series: (Object.keys(EXPENSE_KINDS) as ExpenseKind[]).map((k, idx) => ({
      name: EXPENSE_KINDS[k].label,
      type: 'bar',
      stack: 'total',
      data: Object.values(byKindMonthly[idx]),
      itemStyle: { color: KIND_COLOR[k] },
      barMaxWidth: 30,
    })),
  };

  const pieOption = {
    tooltip: { valueFormatter: (v: number) => `¥${formatMoney(v)}` },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '46%'],
        avoidLabelOverlap: true,
        label: {
          formatter: (p: { percent: number }) => `${p.percent}%`,
        },
        data: (Object.keys(EXPENSE_KINDS) as ExpenseKind[]).map((k) => ({
          name: EXPENSE_KINDS[k].label,
          value: kinds[k],
          itemStyle: { color: KIND_COLOR[k] },
        })),
      },
    ],
  };

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (item: IExpense) => {
    setEditing(item);
    setOpen(true);
  };
  const handleSubmit = (data: Omit<IExpense, 'id'>) => {
    if (editing) {
      update(editing.id, data);
      toast.success('已更新支出');
    } else {
      add({ ...data, id: genId() });
      toast.success('已添加支出');
    }
  };
  const handleDelete = (item: IExpense) => {
    remove(item.id);
    toast.success('已删除该笔支出');
  };

  return (
    <div>
      <PageHeader
        title="家庭支出"
        description="固定、生活、额外三类，按月记录，可按年查看结构。"
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
        <StatCard label={`${year}年总支出`} value={`¥${formatMoney(yearTotal)}`} />
        <StatCard label="固定支出" value={`¥${formatMoney(kinds.fixed)}`} />
        <StatCard label="生活支出" value={`¥${formatMoney(kinds.life)}`} />
        <StatCard label="额外支出" value={`¥${formatMoney(kinds.extra)}`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="gap-0 lg:col-span-2">
          <div className="p-4">
            <div className="mb-2 font-medium">{year}年各月支出（按三类）</div>
            <ReactECharts option={stackOption} style={{ height: 300 }} />
          </div>
        </Card>
        <Card className="gap-0">
          <div className="p-4">
            <div className="mb-2 font-medium">三类支出占比</div>
            <ReactECharts option={pieOption} style={{ height: 300 }} />
          </div>
        </Card>
      </div>

      <Card className="mt-4 gap-0">
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="font-medium">{year}年支出明细</div>
          <span className="text-sm text-muted-foreground">{sorted.length} 笔</span>
        </div>
        <div className="px-4">
          {sorted.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              暂无支出记录，点击右上角「记一笔」开始。
            </div>
          ) : (
            <div className="divide-y">
              {sorted.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.category}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {EXPENSE_KINDS[item.kind].label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{item.date}</span>
                    </div>
                    {item.note && (
                      <div className="truncate text-xs text-muted-foreground">{item.note}</div>
                    )}
                  </div>
                  <div className="font-medium tabular-nums text-down">
                    -{formatMoney(item.amount)}
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

      <ExpenseForm
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
