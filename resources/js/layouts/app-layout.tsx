import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { Auth, type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    auth: Auth;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ auth,children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate auth={auth} breadcrumbs={breadcrumbs} {...props}>
        {children}
    </AppLayoutTemplate>
);
