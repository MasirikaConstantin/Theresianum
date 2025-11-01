import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { SharedData, type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Badge } from '@/components/ui/badge';
import { usePage } from '@inertiajs/react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipArrow, TooltipContent, TooltipTrigger } from '@radix-ui/react-tooltip';
import { AlertCircleIcon } from 'lucide-react';
import { Currency } from '@/types';
import { FrancCongolais } from '@/hooks/Currencies';

export  function AppSidebarHeader({ auth, breadcrumbs = [] }: { auth: SharedData['auth']; breadcrumbs?: BreadcrumbItemType[] }) {
const currency = usePage().props.currency as Currency | null;
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                    />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
                <div className="ml-auto flex items-center gap-2">
                
                    {currency ?(
                            <div className="flex items-center gap-2 bg-accent p-1 rounded">
                             {currency.name}  <span>taux</span> {FrancCongolais(currency.exchange_rate)}
                             </div>
                        ) : <div className="flex items-center gap-2 bg-accent p-1 rounded">
                            Aucune devise disponible
                        </div>}
                    <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
                        <a
                        href={route('profile.edit')}
                        rel="noopener noreferrer"
                        className="dark:text-foreground"
                        >
                        {auth.user.name}
                        </a>
                    </Button>
                    
                </div>
                
            </div>
        </header>
    );
}
