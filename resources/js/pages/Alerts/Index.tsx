import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calendar, Package } from 'lucide-react';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Auth } from '@/types';

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Alertes', href: '#' },
];

export default function AlertIndex({ alerts, auth }: { alerts: any, auth: Auth }) {
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Gestion des alertes" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Gestion des alertes</h1>
                    <Link href={route('alerts.create')}>
                        <Button>
                            <AlertCircle className="mr-2 h-4 w-4" />
                            Nouvelle alerte
                        </Button>
                    </Link>
                </div>

                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Notes</TableHead>
                                <TableHead>Créée par</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {alerts.data.map((alert: any) => (
                                <TableRow key={alert.id}>
                                    <TableCell>
                                        {alert.produit_id && (
                                            <Badge variant="secondary">
                                                <Package className="mr-2 h-4 w-4" />
                                                Produit
                                            </Badge>
                                        )}
                                        {alert.rendezvou_id && (
                                            <Badge variant="secondary">
                                                <Calendar className="mr-2 h-4 w-4" />
                                                Rendez-vous
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">{alert.notes}</TableCell>
                                    <TableCell>{alert.user.name}</TableCell>
                                    <TableCell>{new Date(alert.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell className="flex gap-2">
                                        <Link href={route('alerts.show', alert.ref)}>
                                            <Button variant="outline" size="sm">
                                                Voir
                                            </Button>
                                        </Link>
                                        {auth.user.id === alert.user_id && (
                                            <Link href={route('alerts.edit', alert.ref)}>
                                                <Button variant="outline" size="sm">
                                                    Modifier
                                                </Button>
                                            </Link>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {alerts.last_page > 1 && (
                    <div className="flex items-center justify-end">
                        <Pagination>
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationPrevious 
                                        href={alerts.prev_page_url || '#'}
                                        onClick={(e) => {
                                            if (!alerts.prev_page_url) {
                                                e.preventDefault();
                                                return;
                                            }
                                            e.preventDefault();
                                            router.get(alerts.prev_page_url, {}, {
                                                preserveState: true,
                                                replace: true,
                                                preserveScroll: true
                                            });
                                        }}
                                        className={!alerts.prev_page_url ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                                
                                {alerts.links.slice(1, -1).map((link: any, index: any) => {
                                    if (link.label === '...') {
                                        return (
                                            <PaginationItem key={index}>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        );
                                    }
                                    return (
                                        <PaginationItem key={index}>
                                            <PaginationLink
                                                href={link.url || '#'}
                                                onClick={(e) => {
                                                    if (!link.url) {
                                                        e.preventDefault();
                                                        return;
                                                    }
                                                    e.preventDefault();
                                                    router.get(link.url, {}, {
                                                        preserveState: true,
                                                        replace: true,
                                                        preserveScroll: true
                                                    });
                                                }}
                                                isActive={link.active}
                                            >
                                                {link.label}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                })}
                                
                                <PaginationItem>
                                    <PaginationNext 
                                        href={alerts.next_page_url || '#'}
                                        onClick={(e) => {
                                            if (!alerts.next_page_url) {
                                                e.preventDefault();
                                                return;
                                            }
                                            e.preventDefault();
                                            router.get(alerts.next_page_url, {}, {
                                                preserveState: true,
                                                replace: true,
                                                preserveScroll: true
                                            });
                                        }}
                                        className={!alerts.next_page_url ? 'pointer-events-none opacity-50' : ''}
                                    />
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
