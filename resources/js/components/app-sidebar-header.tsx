import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { SharedData, type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Link, usePage } from '@inertiajs/react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipArrow, TooltipContent, TooltipTrigger } from '@radix-ui/react-tooltip';
import { AlertCircleIcon } from 'lucide-react';
import { Currency } from '@/types';
import { FrancCongolais } from '@/hooks/Currencies';

export function AppSidebarHeader({ auth, breadcrumbs = [] }: { auth: SharedData['auth']; breadcrumbs?: BreadcrumbItemType[] }) {
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
                <div className="ml-auto flex items-center gap-3">
                    {/* Devise affichée */}
                    {currency ? (
                        <>
                        {auth.user.role === 'admin' ? (
                            <Link href={route('currencies.index')} className="flex hover:underline items-center gap-2 rounded-xl bg-accent/60 px-3 py-1.5 text-sm font-medium text-foreground shadow-sm">
                                <span className="font-semibold">{currency.name}</span>
                                <span className="text-muted-foreground">taux</span>
                                <span className="font-semibold text-primary">
                                    {FrancCongolais(currency.exchange_rate)}
                                </span>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-1.5 text-sm text-muted-foreground italic">
                            <span className="font-semibold">{currency.name}</span>
                            <span className="text-muted-foreground">taux</span>
                            <span className="font-semibold text-primary">
                                {FrancCongolais(currency.exchange_rate)}
                            </span>
                        </div>
                        )}
                        </>
                    ) : (
                        <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-1.5 text-sm text-muted-foreground italic">
                            <span>Aucune devise disponible</span>
                        </div>
                    )}

                    {/* Profil utilisateur */}
                    <Button
                        variant="ghost"
                        asChild
                        size="sm"
                        className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent/40 transition-colors"
                    >
                        <Link
                            href={route('profile.edit')}
                            rel="noopener noreferrer"
                            className="flex items-center text-foreground"
                        >
                            <span className="font-medium">{auth.user.name}</span>
                        </Link>
                    </Button>
                </div>


            </div>
        </header>
    );
}
