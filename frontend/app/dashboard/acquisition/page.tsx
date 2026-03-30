'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { MetricCard } from '@/components/dashboard/metric-card';
import { LineChartComponent } from '@/components/dashboard/charts/line-chart-component';
import { PieChartComponent } from '@/components/dashboard/charts/pie-chart-component';
import { DataTable } from '@/components/dashboard/data-table';
import { DashboardFilters } from '@/lib/dashboard/types';
import { generateChartData, generateMockUsers } from '@/lib/dashboard/mock-data';
import { TrendingUp, Users, UserPlus, Target } from 'lucide-react';

export default function AcquisitionPage() {
    const [filters, setFilters] = useState<DashboardFilters | null>(null);
    const chartData = generateChartData(30);

    const channels = [
        { name: 'Organic Search', value: 3450 },
        { name: 'Paid Ads', value: 2890 },
        { name: 'Direct', value: 2100 },
        { name: 'Referral', value: 1560 },
        { name: 'Social Media', value: 1320 },
    ];

    const cohorts = [
        { cohort: 'Week 1-4', signup: 2450, active: 1800, retention: '73.5%' },
        { cohort: 'Week 5-8', signup: 3100, active: 2340, retention: '75.4%' },
        { cohort: 'Week 9-12', signup: 2800, active: 2150, retention: '76.8%' },
        { cohort: 'Week 13-16', signup: 3250, active: 2580, retention: '79.4%' },
    ];

    const countryData = [
        { country: 'United States', signups: 4500, revenue: '$125,000' },
        { country: 'United Kingdom', signups: 1200, revenue: '$32,000' },
        { country: 'Canada', signups: 950, revenue: '$28,500' },
        { country: 'Germany', signups: 850, revenue: '$24,000' },
        { country: 'France', signups: 720, revenue: '$19,200' },
    ];

    return (
        <div className="space-y-8">
            <DashboardHeader title="User Acquisition & Growth" onFiltersChange={setFilters} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="New Signups (30d)" value="2,450" changePercent={18.5} trend="up" icon={<UserPlus className="h-6 w-6" />} />
                <MetricCard title="Signup Rate" value="4.2%" changePercent={2.3} trend="up" unit="of visitors" icon={<Target className="h-6 w-6" />} />
                <MetricCard title="Customer Acquisition Cost" value="$28.50" changePercent={-5.2} trend="down" icon={<TrendingUp className="h-6 w-6" />} />
                <MetricCard title="Conversion to Paid" value="24.3%" changePercent={3.8} trend="up" icon={<Users className="h-6 w-6" />} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LineChartComponent title="Daily New Signups" data={chartData} lines={[{ dataKey: 'users', stroke: 'var(--chart-1)', name: 'New Signups' }]} />
                <PieChartComponent title="Signup by Channel" data={channels} />
            </div>
            <div className="space-y-6">
                <DataTable title="Acquisition by Country" columns={[
                    { key: 'country', label: 'Country', sortable: true },
                    { key: 'signups', label: 'Signups', sortable: true, format: (v) => v.toLocaleString() },
                    { key: 'revenue', label: 'Revenue', sortable: false },
                ]} data={countryData} />
                <DataTable title="Cohort Analysis" columns={[
                    { key: 'cohort', label: 'Cohort', sortable: true },
                    { key: 'signup', label: 'Signups', sortable: true, format: (v) => v.toLocaleString() },
                    { key: 'active', label: 'Active (7d)', sortable: true, format: (v) => v.toLocaleString() },
                    { key: 'retention', label: 'Retention', sortable: true },
                ]} data={cohorts} />
            </div>
        </div>
    );
}
