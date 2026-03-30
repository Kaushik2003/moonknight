'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { MetricCard } from '@/components/dashboard/metric-card';
import { LineChartComponent } from '@/components/dashboard/charts/line-chart-component';
import { PieChartComponent } from '@/components/dashboard/charts/pie-chart-component';
import { DataTable } from '@/components/dashboard/data-table';
import { DashboardFilters } from '@/lib/dashboard/types';
import { generateChartData } from '@/lib/dashboard/mock-data';
import { Code2, FileText, GitBranch, BarChart3 } from 'lucide-react';

export default function CodingActivityPage() {
    const [filters, setFilters] = useState<DashboardFilters | null>(null);
    const chartData = generateChartData(30);

    const languageUsage = [
        { name: 'Rust/Soroban', value: 3200 },
        { name: 'JavaScript', value: 2800 },
        { name: 'TypeScript', value: 2100 },
        { name: 'HTML/CSS', value: 1500 },
        { name: 'TOML', value: 1300 },
    ];

    const generationTypes = [
        { name: 'Smart Contracts', value: 4200 },
        { name: 'Frontend Components', value: 2800 },
        { name: 'Tests', value: 1900 },
        { name: 'Configuration', value: 1100 },
    ];

    const fileMetrics = [
        { type: '.rs', generated: 1250, modified: 3450, avgSize: '142 lines' },
        { type: '.tsx', generated: 980, modified: 2340, avgSize: '215 lines' },
        { type: '.ts', generated: 750, modified: 2100, avgSize: '198 lines' },
        { type: '.toml', generated: 520, modified: 1800, avgSize: '47 lines' },
        { type: '.css', generated: 480, modified: 1450, avgSize: '264 lines' },
    ];

    return (
        <div className="space-y-8">
            <DashboardHeader title="Coding Activity & Generation" onFiltersChange={setFilters} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Code Generated" value="12.5K" changePercent={42.3} trend="up" unit="lines" icon={<Code2 className="h-6 w-6" />} />
                <MetricCard title="Files Modified" value="3,240" changePercent={28.5} trend="up" icon={<FileText className="h-6 w-6" />} />
                <MetricCard title="Avg Generation Time" value="2.3s" changePercent={-12.4} trend="down" icon={<BarChart3 className="h-6 w-6" />} />
                <MetricCard title="Code Quality Score" value="8.7/10" changePercent={5.2} trend="up" icon={<GitBranch className="h-6 w-6" />} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LineChartComponent title="Code Generated Daily" data={chartData} lines={[{ dataKey: 'events', stroke: 'var(--chart-1)', name: 'Lines Generated' }]} />
                <PieChartComponent title="Language Distribution" data={languageUsage} />
            </div>
            <div className="grid grid-cols-1 gap-6">
                <PieChartComponent title="Generation by Type" data={generationTypes} />
            </div>
            <div className="space-y-6">
                <DataTable title="File Type Activity" columns={[
                    { key: 'type', label: 'File Type', sortable: true },
                    { key: 'generated', label: 'Generated', sortable: true, format: (v) => v.toLocaleString() },
                    { key: 'modified', label: 'Modified', sortable: true, format: (v) => v.toLocaleString() },
                    { key: 'avgSize', label: 'Avg Size', sortable: false },
                ]} data={fileMetrics} />
            </div>
        </div>
    );
}
