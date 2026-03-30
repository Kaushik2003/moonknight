'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { MetricCard } from '@/components/dashboard/metric-card';
import { FunnelChartComponent } from '@/components/dashboard/charts/funnel-chart-component';
import { DataTable } from '@/components/dashboard/data-table';
import { DashboardFilters } from '@/lib/dashboard/types';
import { generateFunnelData } from '@/lib/dashboard/mock-data';
import { Funnel, TrendingDown, Users, Target } from 'lucide-react';

export default function FunnelsPage() {
    const [filters, setFilters] = useState<DashboardFilters | null>(null);

    const signupFunnel = generateFunnelData();
    const pricingFunnel = [
        { step: 'Pricing Page View', count: 15000, dropoff: 3000, conversionRate: 100 },
        { step: 'Plan Comparison', count: 12000, dropoff: 2500, conversionRate: 80 },
        { step: 'Checkout Start', count: 9500, dropoff: 2000, conversionRate: 63.3 },
        { step: 'Payment Method', count: 7500, dropoff: 1500, conversionRate: 50 },
        { step: 'Purchase Complete', count: 6000, dropoff: 0, conversionRate: 40 },
    ];

    const featureFunnel = [
        { step: 'Feature Discovered', count: 8000, dropoff: 1600, conversionRate: 100 },
        { step: 'Feature Used', count: 6400, dropoff: 1280, conversionRate: 80 },
        { step: 'Feature Repeated', count: 5120, dropoff: 1024, conversionRate: 64 },
        { step: 'Feature Adopted', count: 4096, dropoff: 0, conversionRate: 51.2 },
    ];

    const funnelComparison = [
        { funnel: 'Signup Flow', steps: 5, topConversion: 75.2, bottomConversion: 45.8 },
        { funnel: 'Pricing Page', steps: 5, topConversion: 80, bottomConversion: 40 },
        { funnel: 'Feature Adoption', steps: 4, topConversion: 100, bottomConversion: 51.2 },
        { funnel: 'Pro Upgrade', steps: 4, topConversion: 65.5, bottomConversion: 32 },
    ];

    return (
        <div className="space-y-8">
            <DashboardHeader title="Conversion Funnels & Retention" onFiltersChange={setFilters} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title="Overall Conversion" value="34.8%" changePercent={5.2} trend="up" icon={<Target className="h-6 w-6" />} />
                <MetricCard title="Signup Completion" value="45.8%" changePercent={8.5} trend="up" icon={<Users className="h-6 w-6" />} />
                <MetricCard title="Avg Funnel Dropoff" value="23.4%" changePercent={-3.2} trend="down" icon={<TrendingDown className="h-6 w-6" />} />
                <MetricCard title="Pro Conversion" value="32%" changePercent={12.1} trend="up" icon={<Funnel className="h-6 w-6" />} />
            </div>
            <div className="space-y-6">
                <FunnelChartComponent title="Signup Funnel" data={signupFunnel} />
                <FunnelChartComponent title="Pricing to Purchase Funnel" data={pricingFunnel} />
                <FunnelChartComponent title="Feature Adoption Funnel" data={featureFunnel} />
            </div>
            <div className="space-y-6">
                <DataTable title="Funnel Comparison" columns={[
                    { key: 'funnel', label: 'Funnel Name', sortable: true },
                    { key: 'steps', label: 'Steps', sortable: true, format: (v) => `${v} steps` },
                    { key: 'topConversion', label: 'Top Conversion', sortable: true, format: (v) => `${v.toFixed(1)}%` },
                    { key: 'bottomConversion', label: 'Bottom Conversion', sortable: true, format: (v) => `${v.toFixed(1)}%` },
                ]} data={funnelComparison} />
            </div>
        </div>
    );
}
