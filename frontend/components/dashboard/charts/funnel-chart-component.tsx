'use client';

import { Card } from '@/components/ui/card';
import { FunnelStep } from '@/lib/dashboard/types';

interface FunnelChartComponentProps {
    title: string;
    data: FunnelStep[];
}

export function FunnelChartComponent({
    title,
    data,
}: FunnelChartComponentProps) {
    const maxCount = Math.max(...data.map((d) => d.count));

    return (
        <Card className="bg-card/50 border-border/50 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">{title}</h3>
            <div className="space-y-4">
                {data.map((step, index) => {
                    const width = (step.count / maxCount) * 100;
                    const dropoffPercent = (step.dropoff / step.count) * 100;

                    return (
                        <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-foreground">{step.step}</span>
                                <div className="flex gap-4 text-xs text-muted-foreground">
                                    <span>{step.count.toLocaleString()} users</span>
                                    <span className="text-green-500">{step.conversionRate.toFixed(1)}%</span>
                                </div>
                            </div>
                            <div className="h-8 bg-secondary/20 rounded-md overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary/70 to-primary rounded-md transition-all"
                                    style={{ width: `${width}%` }}
                                >
                                    <div className="h-full flex items-center justify-end pr-3 text-xs font-medium text-primary-foreground">
                                        {width > 15 && `${step.count.toLocaleString()}`}
                                    </div>
                                </div>
                            </div>
                            {dropoffPercent > 0 && (
                                <p className="text-xs text-red-500">
                                    ↓ {step.dropoff.toLocaleString()} dropped ({dropoffPercent.toFixed(1)}%)
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
