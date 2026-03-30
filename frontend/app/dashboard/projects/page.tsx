'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { MetricCard } from '@/components/dashboard/metric-card';
import { LineChartComponent } from '@/components/dashboard/charts/line-chart-component';
import { PieChartComponent } from '@/components/dashboard/charts/pie-chart-component';
import { DataTable } from '@/components/dashboard/data-table';
import { DashboardFilters } from '@/lib/dashboard/types';
import { generateChartData } from '@/lib/dashboard/mock-data';
import { FolderOpen, Users, Code2, TrendingUp } from 'lucide-react';

export default function ProjectsPage() {
    const [filters, setFilters] = useState<DashboardFilters | null>(null);
    const chartData = generateChartData(30);

    const languages = [
        { name: 'Rust/Soroban', value: 2500 },
        { name: 'JavaScript', value: 2200 },
        { name: 'TypeScript', value: 1800 },
        { name: 'HTML/CSS', value: 1200 },
        { name: 'TOML', value: 900 },
    ];

    const projectTypes = [
        { name: 'Smart Contract', value: 3500 },
        { name: 'dApp Frontend', value: 2400 },
        { name: 'Full Stack', value: 1800 },
        { name: 'Library/SDK', value: 1300 },
    ];

    const topProjects = [
        { name: 'Token Swap DEX', language: 'Rust', members: 12, activity: 'High', codeGenerated: '2.3K' },
        { name: 'NFT Marketplace', language: 'TypeScript', members: 8, activity: 'High', codeGenerated: '1.8K' },
        { name: 'Lending Protocol', language: 'Rust', members: 5, activity: 'Medium', codeGenerated: '950' },
        { name: 'DAO Governance', language: 'JavaScript', members: 10, activity: 'High', codeGenerated: '2.1K' },
        { name: 'Oracle Service', language: 'Rust', members: 6, activity: 'Medium', codeGenerated: '1.4K' },
    ];

    return (
        <div className="space-y-8">
            <DashboardHeader title="Project Activity & Metrics" onFiltersChange={setFilters} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Active Projects" value="127" changePercent={8.5} trend="up" icon={<FolderOpen className="h-6 w-6" />} />
                <MetricCard title="Total Collaborators" value="542" changePercent={12.3} trend="up" icon={<Users className="h-6 w-6" />} />
                <MetricCard title="Code Commits" value="3.2K" changePercent={18.7} trend="up" icon={<Code2 className="h-6 w-6" />} />
                <MetricCard title="Project Growth" value="15%" changePercent={4.2} trend="up" icon={<TrendingUp className="h-6 w-6" />} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LineChartComponent title="Project Activity Trend" data={chartData} lines={[{ dataKey: 'events', stroke: 'var(--chart-1)', name: 'Activity Events' }]} />
                <PieChartComponent title="Projects by Language" data={languages} />
            </div>
            <div className="grid grid-cols-1 gap-6">
                <PieChartComponent title="Project Types Distribution" data={projectTypes} />
            </div>
            <div className="space-y-6">
                <DataTable title="Top Projects by Activity" columns={[
                    { key: 'name', label: 'Project Name', sortable: true },
                    { key: 'language', label: 'Language', sortable: true },
                    { key: 'members', label: 'Team Size', sortable: true, format: (v) => `${v} members` },
                    { key: 'activity', label: 'Activity Level', sortable: true },
                    { key: 'codeGenerated', label: 'Code Generated', sortable: false },
                ]} data={topProjects} />
            </div>
        </div>
    );
}
