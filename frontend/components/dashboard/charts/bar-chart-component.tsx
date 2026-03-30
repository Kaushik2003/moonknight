'use client';

import { Card } from '@/components/ui/card';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { ChartDataPoint } from '@/lib/dashboard/types';

interface BarChartComponentProps {
    title: string;
    data: ChartDataPoint[];
    bars: {
        dataKey: string;
        fill: string;
        name: string;
    }[];
    height?: number;
}

export function BarChartComponent({
    title,
    data,
    bars,
    height = 300,
}: BarChartComponentProps) {
    return (
        <Card className="bg-card/50 border-border/50 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={height}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                    <YAxis stroke="var(--muted-foreground)" />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--card)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                        }}
                        labelStyle={{ color: 'var(--foreground)' }}
                    />
                    <Legend />
                    {bars.map((bar) => (
                        <Bar
                            key={bar.dataKey}
                            dataKey={bar.dataKey}
                            fill={bar.fill}
                            name={bar.name}
                            isAnimationActive={false}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
}
