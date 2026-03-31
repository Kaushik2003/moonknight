// Database types for MoonKnight analytics
export type AnalyticsEvent = {
    id: string;
    event_name: string;
    user_id: string;
    session_id: string;
    timestamp: string;
    properties: Record<string, any>;
    country: string | null;
    cohort: string | null;
    model: string | null;
};

export type User = {
    id: string;
    email: string;
    created_at: string;
    last_active: string | null;
    subscription_tier: 'free' | 'pro' | 'enterprise';
};

export type Session = {
    id: string;
    user_id: string;
    started_at: string;
    ended_at: string | null;
    duration_minutes: number;
    device_type: string;
};

export type Project = {
    id: string;
    user_id: string;
    name: string;
    created_at: string;
    language: string;
};

export type AIInteraction = {
    id: string;
    session_id: string;
    user_id: string;
    timestamp: string;
    type: 'code_generation' | 'debugging' | 'refactoring' | 'explanation';
    model: string;
    input_tokens: number;
    output_tokens: number;
    latency_ms: number;
    success: boolean;
};

// Dashboard filter types
export type DateRange = {
    from: Date;
    to: Date;
};

export type DashboardFilters = {
    dateRange: DateRange;
    cohorts: string[];
    countries: string[];
    models: string[];
};

// Metric types
export type MetricValue = {
    value: number;
    change: number;
    changePercent: number;
    trend: 'up' | 'down' | 'stable';
};

export type ChartDataPoint = {
    date: string;
    [key: string]: string | number;
};

export type FunnelStep = {
    step: string;
    count: number;
    dropoff: number;
    conversionRate: number;
};
