'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { MetricCard } from '@/components/dashboard/metric-card';
import { LineChartComponent } from '@/components/dashboard/charts/line-chart-component';
import { BarChartComponent } from '@/components/dashboard/charts/bar-chart-component';
import { DataTable } from '@/components/dashboard/data-table';
import { DashboardFilters } from '@/lib/dashboard/types';
import { generateMockMetrics, generateChartData, generateMockAnalyticsEvents } from '@/lib/dashboard/mock-data';
import { Users, Activity, Zap, TrendingUp } from 'lucide-react';

export default function OverviewPage() {
    const [filters, setFilters] = useState<DashboardFilters | null>(null);

    const metrics = generateMockMetrics();
    const chartData = generateChartData(30);
    const events = generateMockAnalyticsEvents(50);

    const eventCounts = events.reduce(
        (acc, event) => ({
            ...acc,
            [event.event_name]: (acc[event.event_name] || 0) + 1,
        }),
        {} as Record<string, number>
    );

    const topEventsData = Object.entries(eventCounts)
        .map(([name, count]) => ({
            event: name,
            count,
            percentage: ((count / events.length) * 100).toFixed(1),
        }))
        .sort((a, b) => b.count - a.count);

    return (
        <div className="space-y-8">
            <DashboardHeader
                title="Product Overview"
                onFiltersChange={setFilters}
                defaultDateRange={{
                    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    to: new Date(),
                }}
            />

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Users"
                    value={metrics.totalUsers.toLocaleString()}
                    changePercent={12.5}
                    trend="up"
                    icon={<Users className="h-6 w-6" />}
                />
                <MetricCard
                    title="Active Users (7d)"
                    value={metrics.activeUsers.toLocaleString()}
                    changePercent={8.2}
                    trend="up"
                    icon={<Activity className="h-6 w-6" />}
                />
                <MetricCard
                    title="AI Requests/Day"
                    value={metrics.aiRequestsPerDay.toLocaleString()}
                    changePercent={23.4}
                    trend="up"
                    icon={<Zap className="h-6 w-6" />}
                />
                <MetricCard
                    title="User Satisfaction"
                    value={metrics.userSatisfaction}
                    changePercent={5.1}
                    trend="up"
                    unit="/ 5.0"
                    icon={<TrendingUp className="h-6 w-6" />}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LineChartComponent
                    title="Daily Active Users"
                    data={chartData}
                    lines={[
                        {
                            dataKey: 'users',
                            stroke: 'var(--chart-1)',
                            name: 'Active Users',
                        },
                        {
                            dataKey: 'sessions',
                            stroke: 'var(--chart-2)',
                            name: 'Sessions',
                        },
                    ]}
                />

                <BarChartComponent
                    title="Events Volume"
                    data={chartData}
                    bars={[
                        {
                            dataKey: 'events',
                            fill: 'var(--chart-3)',
                            name: 'Events',
                        },
                        {
                            dataKey: 'aiRequests',
                            fill: 'var(--chart-4)',
                            name: 'AI Requests',
                        },
                    ]}
                />
            </div>

            {/* Tables Section */}
            <div className="space-y-6">
                <DataTable
                    title="Top Events"
                    columns={[
                        { key: 'event', label: 'Event Name', sortable: true },
                        {
                            key: 'count',
                            label: 'Count',
                            sortable: true,
                            format: (v) => v.toLocaleString(),
                        },
                        {
                            key: 'percentage',
                            label: 'Percentage',
                            sortable: true,
                            format: (v) => `${v}%`,
                        },
                    ]}
                    data={topEventsData}
                />
            </div>
        </div>
    );
}
