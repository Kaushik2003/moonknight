'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { MetricCard } from '@/components/dashboard/metric-card';
import { BarChartComponent } from '@/components/dashboard/charts/bar-chart-component';
import { PieChartComponent } from '@/components/dashboard/charts/pie-chart-component';
import { DataTable } from '@/components/dashboard/data-table';
import { DashboardFilters } from '@/lib/dashboard/types';
import { generateChartData } from '@/lib/dashboard/mock-data';
import { Wrench, Target, TrendingUp, AlertCircle } from 'lucide-react';

export default function AgentToolsPage() {
    const [filters, setFilters] = useState<DashboardFilters | null>(null);
    const chartData = generateChartData(30);

    const tools = [
        { name: 'Code Analyzer', value: 3200 },
        { name: 'Test Generator', value: 2800 },
        { name: 'Documentation Bot', value: 2100 },
        { name: 'Performance Profiler', value: 1800 },
        { name: 'Security Scanner', value: 1500 },
    ];

    const toolUsagePatterns = [
        { name: 'Automated Analysis', value: 4500 },
        { name: 'Manual Trigger', value: 3200 },
        { name: 'Scheduled Run', value: 2100 },
        { name: 'On-Demand', value: 1800 },
    ];

    const toolMetrics = [
        { tool: 'Code Analyzer', usage: 3200, avgDuration: '2.3s', successRate: '98.5%', userSatisfaction: '4.8' },
        { tool: 'Test Generator', usage: 2800, avgDuration: '3.1s', successRate: '97.2%', userSatisfaction: '4.6' },
        { tool: 'Documentation Bot', usage: 2100, avgDuration: '1.8s', successRate: '99.1%', userSatisfaction: '4.7' },
        { tool: 'Performance Profiler', usage: 1800, avgDuration: '5.2s', successRate: '96.8%', userSatisfaction: '4.5' },
        { tool: 'Security Scanner', usage: 1500, avgDuration: '4.1s', successRate: '98.9%', userSatisfaction: '4.9' },
    ];

    return (
        <div className="space-y-8">
            <DashboardHeader title="Agent Tools Analytics" onFiltersChange={setFilters} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Tool Invocations" value="11.4K" changePercent={25.3} trend="up" icon={<Wrench className="h-6 w-6" />} />
                <MetricCard title="Avg Duration" value="3.1s" changePercent={-6.2} trend="down" icon={<Target className="h-6 w-6" />} />
                <MetricCard title="Success Rate" value="98.1%" changePercent={2.1} trend="up" icon={<TrendingUp className="h-6 w-6" />} />
                <MetricCard title="Error Rate" value="1.9%" changePercent={-0.8} trend="down" icon={<AlertCircle className="h-6 w-6" />} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BarChartComponent title="Tool Usage Over Time" data={chartData} bars={[{ dataKey: 'events', fill: 'var(--chart-1)', name: 'Invocations' }]} />
                <PieChartComponent title="Tool Distribution" data={tools} />
            </div>
            <div className="grid grid-cols-1 gap-6">
                <PieChartComponent title="Usage Patterns" data={toolUsagePatterns} />
            </div>
            <div className="space-y-6">
                <DataTable title="Tool Performance Metrics" columns={[
                    { key: 'tool', label: 'Tool Name', sortable: true },
                    { key: 'usage', label: 'Usage Count', sortable: true, format: (v) => v.toLocaleString() },
                    { key: 'avgDuration', label: 'Avg Duration', sortable: false },
                    { key: 'successRate', label: 'Success Rate', sortable: true },
                    { key: 'userSatisfaction', label: 'User Satisfaction', sortable: true },
                ]} data={toolMetrics} />
            </div>
        </div>
    );
}
