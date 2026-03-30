'use client';

import { Card } from '@/components/ui/card';
import {
    PieChart,
    Pie,
    Cell,
    Legend,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface PieChartComponentProps {
    title: string;
    data: {
        name: string;
        value: number;
    }[];
    colors?: string[];
    height?: number;
}

const defaultColors = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
];

export function PieChartComponent({
    title,
    data,
    colors = defaultColors,
    height = 300,
}: PieChartComponentProps) {
    return (
        <Card className="bg-card/50 border-border/50 p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
            <ResponsiveContainer width="100%" height={height}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        isAnimationActive={false}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--card)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                        }}
                        labelStyle={{ color: 'var(--foreground)' }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </Card>
    );
}
