import CurrencyExchange from '@/components/CurrencyExchange';
import { Auth, Currency } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

export default function CurrencyExchangePage({auth, currencies}: {auth: Auth, currencies: Currency[]}) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Gestion des devises',
            href: '/settings/currencies',
        },
    ];
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Gestion des devises" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
                <CurrencyExchange currencies={currencies} />
            </div>
        </AppLayout>
    );
}
