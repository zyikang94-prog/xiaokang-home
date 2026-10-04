import { Landmark, LineChart, TrendingUp, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { FinanceSummary } from '@/lib/finance';
import { formatMoney } from '@/lib/format';
import { CHART } from '@/lib/chart';

const META = [
  { key: 'cashOnHand', label: '移动现金', icon: Wallet, color: CHART.brown },
  { key: 'depositTotal', label: '银行存款', icon: Landmark, color: CHART.green },
  { key: 'stockMarketValue', label: '股票', icon: TrendingUp, color: CHART.accent },
  { key: 'etfMarketValue', label: 'ETF基金', icon: LineChart, color: CHART.red },
] as const;

export default function CashAssetsCard({ s }: { s: FinanceSummary }) {
  const total = s.cashTotal;
  return (
    <Card className="h-full gap-0">
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-medium">现金资产</span>
          <span className="font-serif text-lg font-semibold tabular-nums">
            ¥{formatMoney(total)}
          </span>
        </div>
        <div className="space-y-3">
          {META.map((m) => {
            const value = s[m.key];
            const pct = total > 0 ? value / total : 0;
            return (
              <div key={m.key}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <m.icon className="size-3.5" style={{ color: m.color }} />
                    {m.label}
                  </span>
                  <span className="tabular-nums">¥{formatMoney(value)}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct * 100}%`, backgroundColor: m.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
