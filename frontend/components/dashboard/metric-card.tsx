import { Card } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: number;
    changePercent?: number;
    trend?: 'up' | 'down' | 'stable';
    unit?: string;
    description?: string;
    icon?: React.ReactNode;
    className?: string;
}

export function MetricCard({
    title,
    value,
    change,
    changePercent,
    trend,
    unit,
    description,
    icon,
    className,
}: MetricCardProps) {
    const isPositive = trend === 'up' || (changePercent && changePercent > 0);
    const isNegative = trend === 'down' || (changePercent && changePercent < 0);

    return (
        <Card className={cn('bg-card/50 border-border/50 p-6', className)}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-2">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-foreground">{value}</span>
                        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
                    </div>

                    {description && (
                        <p className="text-xs text-muted-foreground mt-2">{description}</p>
                    )}

                    {changePercent !== undefined && (
                        <div className={cn('flex items-center gap-1 mt-3 text-sm font-medium', isPositive && 'text-green-500', isNegative && 'text-red-500')}>
                            {isPositive && <ArrowUp className="h-4 w-4" />}
                            {isNegative && <ArrowDown className="h-4 w-4" />}
                            <span>{Math.abs(changePercent)}% vs last period</span>
                        </div>
                    )}
                </div>

                {icon && (
                    <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg text-primary">
                        {icon}
                    </div>
                )}
            </div>
        </Card>
    );
}
