'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useDashboardAuth } from '@/lib/dashboard/auth-context';
import { Button } from '@/components/ui/button';
import {
    BarChart3,
    TrendingUp,
    Zap,
    Activity,
    Gamepad2,
    Wrench,
    FolderOpen,
    Gauge,
    Users,
    Funnel,
    LogOut,
} from 'lucide-react';

const dashboardPages = [
    {
        title: 'Overview',
        href: '/dashboard',
        icon: BarChart3,
        description: 'Product health & key metrics',
    },
    {
        title: 'Acquisition',
        href: '/dashboard/acquisition',
        icon: TrendingUp,
        description: 'User growth & channels',
    },
    {
        title: 'AI Usage',
        href: '/dashboard/ai-usage',
        icon: Zap,
        description: 'AI requests & model usage',
    },
    {
        title: 'Coding Activity',
        href: '/dashboard/coding-activity',
        icon: Activity,
        description: 'Code generation & patterns',
    },
    {
        title: 'IDE Interactions',
        href: '/dashboard/ide-interactions',
        icon: Gamepad2,
        description: 'Editor & feature usage',
    },
    {
        title: 'Agent Tools',
        href: '/dashboard/agent-tools',
        icon: Wrench,
        description: 'Agent tool usage analytics',
    },
    {
        title: 'Projects',
        href: '/dashboard/projects',
        icon: FolderOpen,
        description: 'Project activity & metrics',
    },
    {
        title: 'Performance',
        href: '/dashboard/performance',
        icon: Gauge,
        description: 'System performance & latency',
    },
    {
        title: 'Session Productivity',
        href: '/dashboard/session-productivity',
        icon: Users,
        description: 'User productivity metrics',
    },
    {
        title: 'Funnels',
        href: '/dashboard/funnels',
        icon: Funnel,
        description: 'Conversion & retention funnels',
    },
];

export function DashboardSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useDashboardAuth();

    const handleLogout = () => {
        logout();
        router.push('/dashboard/login');
    };

    return (
        <aside className="w-64 bg-sidebar border-r border-sidebar-border min-h-screen flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-sidebar-border">
                <h1 className="text-xl font-bold text-sidebar-foreground">Stacy IDE</h1>
                <p className="text-xs text-muted-foreground mt-1">Analytics Dashboard</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {dashboardPages.map((page) => {
                    const Icon = page.icon;
                    const isActive = pathname === page.href;

                    return (
                        <Link
                            key={page.href}
                            href={page.href}
                            className={cn(
                                'flex items-start gap-3 px-3 py-3 rounded-lg transition-colors group',
                                isActive
                                    ? 'bg-sidebar-primary/10 text-sidebar-primary'
                                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                            )}
                            title={page.description}
                        >
                            <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <div className="text-sm font-medium">{page.title}</div>
                                <div className={cn(
                                    'text-xs opacity-0 group-hover:opacity-100 transition-opacity',
                                    isActive ? 'opacity-100 text-sidebar-primary/70' : 'text-muted-foreground'
                                )}>
                                    {page.description}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-sidebar-border space-y-3">
                <div className="px-3 py-2 bg-sidebar-accent/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Logged in as:</p>
                    <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.email}</p>
                </div>
                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-muted-foreground hover:text-sidebar-foreground"
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                </Button>
            </div>
        </aside>
    );
}
