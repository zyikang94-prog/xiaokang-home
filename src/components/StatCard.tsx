import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  sub?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export default function StatCard({ label, value, sub, icon, className }: StatCardProps) {
  return (
    <Card className={cn('gap-0', className)}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          {icon && <span className="text-muted-foreground">{icon}</span>}
        </div>
        <div className="mt-2 font-serif text-2xl font-semibold tabular-nums">{value}</div>
        {sub && <div className="mt-1 text-xs">{sub}</div>}
      </div>
    </Card>
  );
}
