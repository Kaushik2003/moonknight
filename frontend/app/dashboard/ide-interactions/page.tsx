'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { MetricCard } from '@/components/dashboard/metric-card';
import { BarChartComponent } from '@/components/dashboard/charts/bar-chart-component';
import { PieChartComponent } from '@/components/dashboard/charts/pie-chart-component';
import { DataTable } from '@/components/dashboard/data-table';
import { DashboardFilters } from '@/lib/dashboard/types';
import { generateChartData } from '@/lib/dashboard/mock-data';
import { Mouse, Keyboard, Monitor, Zap } from 'lucide-react';

export default function IDEInteractionsPage() {
    const [filters, setFilters] = useState<DashboardFilters | null>(null);
    const chartData = generateChartData(30);

    const features = [
        { name: 'Code Completion', value: 4200 },
        { name: 'Quick Fix', value: 2800 },
        { name: 'Refactor', value: 2100 },
        { name: 'Find Usage', value: 1800 },
        { name: 'Go to Definition', value: 1300 },
    ];

    const interactions = [
        { name: 'Mouse Clicks', value: 35000 },
        { name: 'Keyboard Input', value: 28000 },
        { name: 'Shortcuts', value: 12000 },
        { name: 'Menu Actions', value: 8000 },
    ];

    const featureEngagement = [
        { feature: 'Code Completion', uses: 4200, avgTime: '0.8s', satisfaction: '4.8' },
        { feature: 'Quick Fix', uses: 2800, avgTime: '1.2s', satisfaction: '4.6' },
        { feature: 'Refactor Tool', uses: 2100, avgTime: '2.1s', satisfaction: '4.7' },
        { feature: 'Find Usage', uses: 1800, avgTime: '0.6s', satisfaction: '4.9' },
        { feature: 'Debugger', uses: 1500, avgTime: '3.2s', satisfaction: '4.5' },
    ];

    return (
        <div className="space-y-8">
            <DashboardHeader title="IDE Feature Interactions" onFiltersChange={setFilters} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Total Interactions" value="83K" changePercent={15.3} trend="up" icon={<Mouse className="h-6 w-6" />} />
                <MetricCard title="Avg Session Length" value="24.5m" changePercent={8.2} trend="up" icon={<Monitor className="h-6 w-6" />} />
                <MetricCard title="Feature Adoption" value="78%" changePercent={12.1} trend="up" icon={<Keyboard className="h-6 w-6" />} />
                <MetricCard title="User Engagement" value="4.7/5" changePercent={3.4} trend="up" icon={<Zap className="h-6 w-6" />} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BarChartComponent title="Feature Usage" data={chartData} bars={[{ dataKey: 'events', fill: 'var(--chart-1)', name: 'Interactions' }]} />
                <PieChartComponent title="Interaction Types" data={interactions} />
            </div>
            <div className="grid grid-cols-1 gap-6">
                <PieChartComponent title="Top Features" data={features} />
            </div>
            <div className="space-y-6">
                <DataTable title="Feature Engagement Details" columns={[
                    { key: 'feature', label: 'Feature', sortable: true },
                    { key: 'uses', label: 'Uses', sortable: true, format: (v) => v.toLocaleString() },
                    { key: 'avgTime', label: 'Avg Time', sortable: false },
                    { key: 'satisfaction', label: 'Satisfaction', sortable: true },
                ]} data={featureEngagement} />
            </div>
        </div>
    );
}
