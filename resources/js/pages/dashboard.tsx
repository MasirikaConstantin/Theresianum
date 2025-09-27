import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { Auth, flash, SharedData, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Currency } from '@/types';
import { QuickActions } from '@/components/quickActions';
import RendezVousCount from '@/components/RendezVousCount';
import LesTaux from '@/components/LesTaux';
import { SalesChart } from '@/components/saleschart';
import { ProductServiceChart } from '@/components/product-service-chart';
import { FluxVentes } from '@/components/flux-ventes';
import SalesStats from '@/components/SalesStats';
import DailySalesStats from '@/components/DailySalesStats';
import StockSuccursales from '@/components/StockSuccursales';
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ auth }: { auth: Auth }) {

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-card">
                        <div className='w-full h-full p-2' >
                        <RendezVousCount />
                        </div>

                    </div>
                    <div className="relative bg-card  aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">

                    {/*<SalesStats />*/}
                    <DailySalesStats />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <FluxVentes auth={auth} />
                    </div>
                </div>

                <div className="relative min-h-[100vh] overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                        <div className="flex flex-col gap-4 md:flex-row">
                            <div className="flex-1">
                                <ProductServiceChart auth={auth} />
                            </div>
                            <div className="flex-1">
                                <QuickActions />
                            </div>
                        </div>

                    
                    </div>

                </div>

                <div className="relative min-h-[100vh] overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                        

                        <div className="flex flex-col gap-4 md:flex-row">
                            <div className="flex-1">
                            <SalesStats />
                            </div>
                            <div className="flex-1">
                                {auth.user?.role === 'admin' || auth.user?.role === 'gerant' ? (
                                    <StockSuccursales />
                                ) : null}
                            </div>
                        </div>
                    </div>

                </div>
                
            </div>
        </AppLayout>
    );
}
