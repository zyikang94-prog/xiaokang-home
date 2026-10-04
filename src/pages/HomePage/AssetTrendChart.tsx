import ReactECharts from 'echarts-for-react';
import { Card } from '@/components/ui/card';
import type { INetWorthSnapshot } from '@/data/types';
import { formatMoney } from '@/lib/format';
import { CHART, moneyAxisLabel } from '@/lib/chart';

const xLabel = (month: string): string => month.slice(2).replace('-', '/');

export default function AssetTrendChart({ snapshots }: { snapshots: INetWorthSnapshot[] }) {
  const option = {
    tooltip: {
      trigger: 'axis',
      valueFormatter: (v: number) => `¥${formatMoney(v)}`,
    },
    legend: { data: ['总资产', '净资产', '现金资产'], top: 0 },
    grid: { left: 56, right: 16, top: 32, bottom: 28 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: snapshots.map((x) => xLabel(x.month)),
    },
    yAxis: { type: 'value', axisLabel: { formatter: moneyAxisLabel } },
    series: [
      {
        name: '总资产',
        type: 'line',
        smooth: true,
        data: snapshots.map((x) => x.totalAssets),
        itemStyle: { color: CHART.primary },
      },
      {
        name: '净资产',
        type: 'line',
        smooth: true,
        data: snapshots.map((x) => x.netWorth),
        itemStyle: { color: CHART.accent },
        areaStyle: { color: CHART.accent, opacity: 0.06 },
      },
      {
        name: '现金资产',
        type: 'line',
        smooth: true,
        data: snapshots.map((x) => x.cashTotal),
        itemStyle: { color: CHART.red },
      },
    ],
  };

  return (
    <Card className="h-full gap-0">
      <div className="p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="font-medium">历年资产趋势</span>
          <span className="text-xs text-muted-foreground">每月自动记录</span>
        </div>
        {snapshots.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            暂无快照
          </div>
        ) : (
          <ReactECharts option={option} style={{ height: 300 }} />
        )
      </div>
    </Card>
  );
}
