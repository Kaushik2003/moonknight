'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { MetricCard } from '@/components/dashboard/metric-card';
import { LineChartComponent } from '@/components/dashboard/charts/line-chart-component';
import { BarChartComponent } from '@/components/dashboard/charts/bar-chart-component';
import { PieChartComponent } from '@/components/dashboard/charts/pie-chart-component';
import { DataTable } from '@/components/dashboard/data-table';
import { DashboardFilters } from '@/lib/dashboard/types';
import { generateChartData, generateMockAIInteractions } from '@/lib/dashboard/mock-data';
import { Zap, Cpu, Clock, TrendingUp } from 'lucide-react';

export default function AIUsagePage() {
    const [filters, setFilters] = useState<DashboardFilters | null>(null);
    const chartData = generateChartData(30);

    const modelUsage = [
        { name: 'GPT-4', value: 4500 },
        { name: 'Claude-3', value: 3200 },
        { name: 'Codex', value: 2100 },
        { name: 'Llama-2', value: 1200 },
    ];

    const interactionTypes = [
        { name: 'Code Generation', value: 5200 },
        { name: 'Debugging', value: 3400 },
        { name: 'Refactoring', value: 2800 },
        { name: 'Explanation', value: 1900 },
    ];

    const modelPerformance = [
        { model: 'GPT-4', requests: 4500, avgLatency: '2.3s', success: '98.5%', totalTokens: '2.4M' },
        { model: 'Claude-3', requests: 3200, avgLatency: '1.8s', success: '99.2%', totalTokens: '1.8M' },
        { model: 'Codex', requests: 2100, avgLatency: '1.5s', success: '97.8%', totalTokens: '1.2M' },
        { model: 'Llama-2', requests: 1200, avgLatency: '1.2s', success: '96.5%', totalTokens: '650K' },
    ];

    return (
        <div className="space-y-8">
            <DashboardHeader title="AI Usage & Model Analytics" onFiltersChange={setFilters} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Total AI Requests" value="11,000" changePercent={34.2} trend="up" icon={<Zap className="h-6 w-6" />} />
                <MetricCard title="Avg Response Time" value="1.87s" changePercent={-8.5} trend="down" icon={<Clock className="h-6 w-6" />} />
                <MetricCard title="Success Rate" value="98.2%" changePercent={1.2} trend="up" icon={<TrendingUp className="h-6 w-6" />} />
                <MetricCard title="Tokens Used" value="6.8M" changePercent={28.5} trend="up" unit="this month" icon={<Cpu className="h-6 w-6" />} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LineChartComponent title="AI Requests Over Time" data={chartData} lines={[{ dataKey: 'aiRequests', stroke: 'var(--chart-1)', name: 'AI Requests' }]} height={350} />
                <PieChartComponent title="Requests by Model" data={modelUsage} />
            </div>
            <div className="grid grid-cols-1 gap-6">
                <PieChartComponent title="Requests by Interaction Type" data={interactionTypes} />
            </div>
            <div className="space-y-6">
                <DataTable title="Model Performance Comparison" columns={[
                    { key: 'model', label: 'Model', sortable: true },
                    { key: 'requests', label: 'Requests', sortable: true, format: (v) => v.toLocaleString() },
                    { key: 'avgLatency', label: 'Avg Latency', sortable: false },
                    { key: 'success', label: 'Success Rate', sortable: true },
                    { key: 'totalTokens', label: 'Total Tokens', sortable: false },
                ]} data={modelPerformance} />
            </div>
        </div>
    );
}
