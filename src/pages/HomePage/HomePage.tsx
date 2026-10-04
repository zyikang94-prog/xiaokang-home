import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import {
  CreditCard,
  House,
  Landmark,
  Minus,
  Plus,
  TrendingUp,
} from 'lucide-react';
import ReturnText from '@/components/ReturnText';
import StatCard from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EXPENSE_KINDS, STORAGE_KEYS } from '@/data/constants';
import { usePersistentList } from '@/hooks/usePersistentList';
import type {
  IExpense,
  IIncome,
  ICashAsset,
  IFixedAsset,
  IInvestment,
  IMetal,
  ILiability,
  INetWorthSnapshot,
} from '@/data/types';
import { currentYear, formatMoney, monthKey, todayStr } from '@/lib/format';
import { summarize, sum } from '@/lib/finance';
import { CHART, moneyAxisLabel } from '@/lib/chart';
import { recordSnapshot } from '@/lib/snapshots';
import CashAssetsCard from './CashAssetsCard';
import AssetTrendChart from './AssetTrendChart';

function buildRecentMonths(): string[] {
  const now = new Date();
  const keys: string[] = [];
  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return keys;
}

export default function HomePage() {
  const fixed = usePersistentList<IFixedAsset>(STORAGE_KEYS.fixedAssets);
  const cash = usePersistentList<ICashAsset>(STORAGE_KEYS.cashAssets);
  const inv = usePersistentList<IInvestment>(STORAGE_KEYS.investments);
  const metals = usePersistentList<IMetal>(STORAGE_KEYS.metals);
  const liab = usePersistentList<ILiability>(STORAGE_KEYS.liabilities);
  const incomes = usePersistentList<IIncome>(STORAGE_KEYS.incomes);
  const expenses = usePersistentList<IExpense>(STORAGE_KEYS.expenses);

  const [today] = useState(todayStr);
  const [recentMonths] = useState(buildRecentMonths);
  const [snapItems] = useState<INetWorthSnapshot[]>(() => recordSnapshot());

  const s = useMemo(
    () => summarize(fixed.items, cash.items, inv.items, metals.items, liab.items),
    [fixed.items, cash.items, inv.items, metals.items, liab.items],
  );

  const year = currentYear();
  const yearIncome = sum(
    incomes.items.filter((i) => i.date.startsWith(year)).map((i) => i.amount),
  );
  const yearExpense = sum(
    expenses.items.filter((i) => i.date.startsWith(year)).map((i) => i.amount),
  );
  const yearBalance = yearIncome - yearExpense;

  const groupByMonth = (items: Array<{ date: string; amount: number }>) => {
    const m: Record<string, number> = {};
    for (const it of items) {
      const k = monthKey(it.date);
      m[k] = (m[k] ?? 0) + it.amount;
    }
    return m;
  };
  const incomeByMonth = groupByMonth(incomes.items);
  const expenseByMonth = groupByMonth(expenses.items);

  const pieData = [
    { name: '固定资产', value: s.fixedTotal, color: CHART.primary },
    { name: '银行存款', value: s.depositTotal, color: CHART.green },
    { name: '移动现金', value: s.cashOnHand, color: CHART.brown },
    { name: '股票', value: s.stockMarketValue, color: CHART.accent },
    { name: 'ETF', value: s.etfMarketValue, color: CHART.red },
    { name: '贵金属', value: s.metalTotal, color: CHART.gold },
  ].filter((d) => d.value > 0);

  const pieOption = {
    tooltip: { valueFormatter: (v: number) => `¥${formatMoney(v)}` },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['42%', '68%'],
        center: ['50%', '45%'],
        label: { formatter: '{b}\n{d}%' },
        data: pieData.map((d) => ({
          name: d.name,
          value: d.value,
          itemStyle: { color: d.color },
        })),
      },
    ],
  };

  const trendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['收入', '支出'], top: 0 },
    grid: { left: 52, right: 16, top: 32, bottom: 28 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: recentMonths.map((k) => `${Number(k.slice(5))}月`),
    },
    yAxis: { type: 'value', axisLabel: { formatter: moneyAxisLabel } },
    series: [
      {
        name: '收入',
        type: 'line',
        smooth: true,
        data: recentMonths.map((k) => incomeByMonth[k] ?? 0),
        itemStyle: { color: CHART.primary },
        areaStyle: { color: CHART.primary, opacity: 0.08 },
      },
      {
        name: '支出',
        type: 'line',
        smooth: true,
        data: recentMonths.map((k) => expenseByMonth[k] ?? 0),
        itemStyle: { color: CHART.accent },
      },
    ],
  };

  const recent = [
    ...incomes.items.map((i) => ({ ...i, recordType: 'in' as const })),
    ...expenses.items.map((e) => ({ ...e, recordType: 'out' as const })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  const isEmpty =
    fixed.items.length === 0 &&
    cash.items.length === 0 &&
    inv.items.length === 0 &&
    metals.items.length === 0 &&
    incomes.items.length === 0 &&
    expenses.items.length === 0;

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-serif text-2xl font-semibold">家庭总览</h1>
        <p className="mt-1 text-sm text-muted-foreground">今天是 {today}，愿家业安稳、收支有余。</p>
      </div>

      {isEmpty && (
        <Card className="mb-4 gap-0 border-accent">
          <div className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <div className="font-serif text-lg font-semibold">欢迎使用「小康之家」</div>
              <p className="mt-1 text-sm text-muted-foreground">
                还没有任何记录。先去录入一笔收入，或登记家庭资产吧。
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to="/income">记录收入</Link>
              </Button>
              <Button asChild>
                <Link to="/assets">登记资产</Link>
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="净资产"
          value={`¥${formatMoney(s.netWorth)}`}
          icon={<House className="size-4" />}
        />
        <StatCard
          label="总资产"
          value={`¥${formatMoney(s.totalAssets)}`}
          icon={<Landmark className="size-4" />}
        />
        <StatCard
          label="总负债"
          value={`¥${formatMoney(s.totalLiabilities)}`}
          icon={<CreditCard className="size-4" />}
        />
        <Card className="gap-0">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">整体收益率</span>
              <TrendingUp className="size-4 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <ReturnText value={s.totalReturnRate} className="text-2xl" />
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              收益 ¥{formatMoney(s.totalGain)}
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="gap-0">
          <div className="p-4">
            <div className="mb-3 font-medium">{year}年收支</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Plus className="size-3.5 text-up" />
                  收入
                </span>
                <span className="tabular-nums">¥{formatMoney(yearIncome)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Minus className="size-3.5 text-down" />
                  支出
                </span>
                <span className="tabular-nums">¥{formatMoney(yearExpense)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">本年结余</span>
                  <span
                    className={`font-medium tabular-nums ${yearBalance >= 0 ? 'text-up' : 'text-down'}`}
                  >
                    ¥{formatMoney(yearBalance)}
                  </span>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/expense">查看支出明细</Link>
              </Button>
            </div>
          </div>
        </Card>

        <Card className="gap-0 lg:col-span-2">
          <div className="p-4">
            <div className="mb-1 font-medium">资产构成</div>
            {pieData.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                暂无资产数据
              </div>
            ) : (
              <ReactECharts option={pieOption} style={{ height: 300 }} />
            )}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <CashAssetsCard s={s} />
        <div className="lg:col-span-2">
          <AssetTrendChart snapshots={snapItems} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="gap-0 lg:col-span-2">
          <div className="p-4">
            <div className="mb-1 font-medium">近 12 个月收支趋势</div>
            <ReactECharts option={trendOption} style={{ height: 280 }} />
          </div>
        </Card>

        <Card className="gap-0">
          <div className="p-4">
            <div className="mb-2 font-medium">最近记录</div>
            {recent.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">暂无记录</div>
            ) : (
              <div className="divide-y">
                {recent.map((item) => {
                  const isIncome = item.recordType === 'in';
                  const label = isIncome
                    ? (item as IIncome).category
                    : EXPENSE_KINDS[(item as IExpense).kind].label;
                  return (
                    <div key={item.id} className="flex items-center gap-2 py-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{label}</div>
                        <div className="text-[11px] text-muted-foreground">{item.date}</div>
                      </div>
                      <div
                        className={`text-sm tabular-nums ${isIncome ? 'text-up' : 'text-down'}`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatMoney(item.amount)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
