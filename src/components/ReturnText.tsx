import { cn } from '@/lib/utils';
import { formatPercent } from '@/lib/format';

interface ReturnTextProps {
  value: number;
  className?: string;
}

/** 收益率：红涨绿跌（中国习惯） */
export default function ReturnText({ value, className }: ReturnTextProps) {
  const positive = value >= 0;
  return (
    <span className={cn(positive ? 'text-up' : 'text-down', 'tabular-nums', className)}>
      {positive ? '+' : ''}
      {formatPercent(value)}
    </span>
  );
}
