'use client';

import { Card } from '@/components/ui/card';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { ChartDataPoint } from '@/lib/dashboard/types';

interface LineChartComponentProps {
    title: string;
    data: ChartDataPoint[];
    lines: {
        dataKey: string;
        stroke: string;
        name: string;
    }[];
    height?: number;
}

export function LineChartComponent({
    title,
    data,
    lines,
    height = 300,
}: LineChartComponentProps) {
    return (
        <Card className="bg-card/50 border-border/50 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={height}>
                <LineChart data={data}>
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
                    {lines.map((line) => (
                        <Line
                            key={line.dataKey}
                            type="monotone"
                            dataKey={line.dataKey}
                            stroke={line.stroke}
                            name={line.name}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </Card>
    );
}
