'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthProvider, useDashboardAuth } from '@/lib/dashboard/auth-context';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';

function DashboardLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading } = useDashboardAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !user && pathname !== '/dashboard/login') {
            router.push('/dashboard/login');
        }
    }, [user, isLoading, router, pathname]);

    // Don't render sidebar for login page
    if (pathname === '/dashboard/login') {
        return <>{children}</>;
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="text-center">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-background">
            <DashboardSidebar />
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </AuthProvider>
    );
}
