import {
    AnalyticsEvent,
    User,
    Session,
    Project,
    AIInteraction,
    ChartDataPoint,
    FunnelStep,
} from './types';

// Mock data generators
const countries = [
    'United States',
    'United Kingdom',
    'Canada',
    'Germany',
    'France',
    'Japan',
];
const cohorts = ['onboarding', 'beta', 'production', 'enterprise'];
const models = ['GPT-4', 'Claude-3', 'Codex', 'Llama-2'];
const eventNames = [
    'user_signup',
    'code_generated',
    'file_opened',
    'ai_chat_started',
    'debug_session_started',
    'project_created',
    'settings_changed',
    'feedback_submitted',
];

export function generateMockUsers(count: number): User[] {
    return Array.from({ length: count }, (_, i) => ({
        id: `user_${i}`,
        email: `user${i}@example.com`,
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        last_active: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_tier: ['free', 'pro', 'enterprise'][Math.floor(Math.random() * 3)] as any,
    }));
}

export function generateMockSessions(count: number): Session[] {
    return Array.from({ length: count }, (_, i) => ({
        id: `session_${i}`,
        user_id: `user_${Math.floor(Math.random() * 100)}`,
        started_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        ended_at: new Date(Date.now() - Math.random() * 6 * 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: Math.floor(Math.random() * 480) + 5,
        device_type: ['desktop', 'tablet', 'mobile'][Math.floor(Math.random() * 3)],
    }));
}

export function generateMockAnalyticsEvents(count: number): AnalyticsEvent[] {
    return Array.from({ length: count }, (_, i) => ({
        id: `event_${i}`,
        event_name: eventNames[Math.floor(Math.random() * eventNames.length)],
        user_id: `user_${Math.floor(Math.random() * 100)}`,
        session_id: `session_${Math.floor(Math.random() * 50)}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        properties: {
            feature: ['editor', 'chat', 'debug', 'settings'][Math.floor(Math.random() * 4)],
            duration: Math.random() * 60,
        },
        country: countries[Math.floor(Math.random() * countries.length)],
        cohort: cohorts[Math.floor(Math.random() * cohorts.length)],
        model: models[Math.floor(Math.random() * models.length)],
    }));
}

export function generateMockAIInteractions(count: number): AIInteraction[] {
    return Array.from({ length: count }, (_, i) => ({
        id: `interaction_${i}`,
        session_id: `session_${Math.floor(Math.random() * 50)}`,
        user_id: `user_${Math.floor(Math.random() * 100)}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        type: ['code_generation', 'debugging', 'refactoring', 'explanation'][
            Math.floor(Math.random() * 4)
        ] as any,
        model: models[Math.floor(Math.random() * models.length)],
        input_tokens: Math.floor(Math.random() * 2000),
        output_tokens: Math.floor(Math.random() * 1000),
        latency_ms: Math.floor(Math.random() * 5000) + 500,
        success: Math.random() > 0.1,
    }));
}

// Generate time-series data for charts
export function generateChartData(days: number): ChartDataPoint[] {
    const data: ChartDataPoint[] = [];
    const now = new Date();

    for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        data.push({
            date: dateStr,
            users: Math.floor(Math.random() * 500) + 100,
            sessions: Math.floor(Math.random() * 800) + 200,
            events: Math.floor(Math.random() * 2000) + 500,
            aiRequests: Math.floor(Math.random() * 1000) + 200,
        });
    }

    return data;
}

// Funnel data
export function generateFunnelData(): FunnelStep[] {
    const steps = [
        'Sign up',
        'Onboarding complete',
        'First AI request',
        'Code generation',
        'Pro upgrade',
    ];
    let count = 10000;

    return steps.map((step, i) => {
        const stepCount = count;
        count = Math.floor(count * (0.6 + Math.random() * 0.3));
        const dropoff = stepCount - count;

        return {
            step,
            count: stepCount,
            dropoff,
            conversionRate: (count / 10000) * 100,
        };
    });
}

// Mock metrics
export function generateMockMetrics() {
    return {
        totalUsers: 12_450,
        activeUsers: 3_821,
        totalSessions: 45_230,
        totalEvents: 567_890,
        avgSessionDuration: 24.5,
        aiRequestsPerDay: 12_567,
        codeGenerationRate: 67.8,
        userSatisfaction: 4.7,
    };
}
