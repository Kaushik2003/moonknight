'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { MetricCard } from '@/components/dashboard/metric-card';
import { LineChartComponent } from '@/components/dashboard/charts/line-chart-component';
import { BarChartComponent } from '@/components/dashboard/charts/bar-chart-component';
import { PieChartComponent } from '@/components/dashboard/charts/pie-chart-component';
import { DataTable } from '@/components/dashboard/data-table';
import { DashboardFilters } from '@/lib/dashboard/types';
import { generateChartData } from '@/lib/dashboard/mock-data';
import { Users, Clock, TrendingUp, Zap } from 'lucide-react';

export default function SessionProductivityPage() {
    const [filters, setFilters] = useState<DashboardFilters | null>(null);
    const chartData = generateChartData(30);

    const productivity = [
        { name: 'Very High (>8h)', value: 1200 },
        { name: 'High (5-8h)', value: 2400 },
        { name: 'Medium (2-5h)', value: 3100 },
        { name: 'Low (<2h)', value: 1800 },
    ];

    const sessionLength = [
        { name: '< 15 min', value: 800 },
        { name: '15-30 min', value: 1200 },
        { name: '30-60 min', value: 2300 },
        { name: '1-2 hours', value: 2100 },
        { name: '> 2 hours', value: 1300 },
    ];

    const userSegments = [
        { segment: 'Power Users', sessions: 2400, avgDuration: '78m', aiUsage: '45%' },
        { segment: 'Regular Users', sessions: 3500, avgDuration: '34m', aiUsage: '28%' },
        { segment: 'Casual Users', sessions: 2100, avgDuration: '12m', aiUsage: '8%' },
        { segment: 'New Users', sessions: 1800, avgDuration: '8m', aiUsage: '3%' },
    ];

    return (
        <div className="space-y-8">
            <DashboardHeader title="Session Productivity Metrics" onFiltersChange={setFilters} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Avg Session Duration" value="34.2m" changePercent={14.5} trend="up" icon={<Clock className="h-6 w-6" />} />
                <MetricCard title="Sessions per User" value="8.3" changePercent={6.2} trend="up" icon={<Users className="h-6 w-6" />} />
                <MetricCard title="Productivity Score" value="7.8/10" changePercent={9.3} trend="up" icon={<TrendingUp className="h-6 w-6" />} />
                <MetricCard title="AI Usage per Session" value="28%" changePercent={18.5} trend="up" icon={<Zap className="h-6 w-6" />} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LineChartComponent title="Avg Session Duration Trend" data={chartData} lines={[{ dataKey: 'sessions', stroke: 'var(--chart-1)', name: 'Duration (minutes)' }]} />
                <BarChartComponent title="Daily Sessions" data={chartData} bars={[{ dataKey: 'sessions', fill: 'var(--chart-1)', name: 'Sessions' }]} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PieChartComponent title="Productivity Levels" data={productivity} />
                <PieChartComponent title="Session Length Distribution" data={sessionLength} />
            </div>
            <div className="space-y-6">
                <DataTable title="User Segment Analysis" columns={[
                    { key: 'segment', label: 'User Segment', sortable: true },
                    { key: 'sessions', label: 'Total Sessions', sortable: true, format: (v) => v.toLocaleString() },
                    { key: 'avgDuration', label: 'Avg Duration', sortable: false },
                    { key: 'aiUsage', label: 'AI Usage Rate', sortable: true },
                ]} data={userSegments} />
            </div>
        </div>
    );
}
