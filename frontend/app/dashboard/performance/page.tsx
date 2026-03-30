'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { MetricCard } from '@/components/dashboard/metric-card';
import { LineChartComponent } from '@/components/dashboard/charts/line-chart-component';
import { BarChartComponent } from '@/components/dashboard/charts/bar-chart-component';
import { DataTable } from '@/components/dashboard/data-table';
import { DashboardFilters } from '@/lib/dashboard/types';
import { generateChartData } from '@/lib/dashboard/mock-data';
import { Gauge, Zap, Clock, AlertTriangle } from 'lucide-react';

export default function PerformancePage() {
    const [filters, setFilters] = useState<DashboardFilters | null>(null);
    const chartData = generateChartData(30);

    const latencyData = chartData.map((d) => ({
        ...d,
        p50: Math.floor(Math.random() * 500) + 200,
        p95: Math.floor(Math.random() * 1500) + 1000,
        p99: Math.floor(Math.random() * 3000) + 2000,
    }));

    const endpoints = [
        { endpoint: '/api/completions', avgLatency: '245ms', p95: '1.2s', errorRate: '0.2%' },
        { endpoint: '/api/analyze', avgLatency: '312ms', p95: '1.8s', errorRate: '0.1%' },
        { endpoint: '/api/refactor', avgLatency: '456ms', p95: '2.1s', errorRate: '0.3%' },
        { endpoint: '/api/test-gen', avgLatency: '523ms', p95: '2.4s', errorRate: '0.2%' },
        { endpoint: '/api/debug', avgLatency: '178ms', p95: '0.9s', errorRate: '0.1%' },
    ];

    return (
        <div className="space-y-8">
            <DashboardHeader title="System Performance & Latency" onFiltersChange={setFilters} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Avg Response Time" value="342ms" changePercent={-8.5} trend="down" icon={<Clock className="h-6 w-6" />} />
                <MetricCard title="P95 Latency" value="1.5s" changePercent={-12.3} trend="down" icon={<Gauge className="h-6 w-6" />} />
                <MetricCard title="Server Health" value="99.8%" changePercent={0.1} trend="stable" icon={<Zap className="h-6 w-6" />} />
                <MetricCard title="Error Rate" value="0.2%" changePercent={-0.05} trend="down" icon={<AlertTriangle className="h-6 w-6" />} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LineChartComponent title="Latency Percentiles (P50/P95/P99)" data={latencyData} lines={[
                    { dataKey: 'p50', stroke: 'var(--chart-1)', name: 'P50' },
                    { dataKey: 'p95', stroke: 'var(--chart-2)', name: 'P95' },
                    { dataKey: 'p99', stroke: 'var(--chart-3)', name: 'P99' },
                ]} />
                <BarChartComponent title="Request Volume" data={chartData} bars={[{ dataKey: 'events', fill: 'var(--chart-1)', name: 'Requests' }]} />
            </div>
            <div className="space-y-6">
                <DataTable title="Endpoint Performance" columns={[
                    { key: 'endpoint', label: 'Endpoint', sortable: true },
                    { key: 'avgLatency', label: 'Avg Latency', sortable: true },
                    { key: 'p95', label: 'P95 Latency', sortable: true },
                    { key: 'errorRate', label: 'Error Rate', sortable: true },
                ]} data={endpoints} />
            </div>
        </div>
    );
}
