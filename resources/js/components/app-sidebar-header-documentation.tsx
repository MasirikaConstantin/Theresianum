import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Separator } from '@/components/ui/separator';
import { Badge } from './ui/badge';

export  function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
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
                    <Badge variant="destructive" className="px-3 py-1">Cette documentation est en cours de construction</Badge>
                </div>
            </div>
        </header>
    );
}
