import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ProformaInvoice, BreadcrumbItem, Auth } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Trash2, FileText, Plus } from 'lucide-react';
import { DateHeure, DateSimple, Dollar } from '@/hooks/Currencies';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { PaginationComponent } from '@/components/Pagination';

interface Props {
    invoices: ProformaInvoice;
    auth: Auth;
}

const Index: React.FC<Props> = ({ invoices, auth }) => {
    const getStatusBadge = (statut: string) => {
        const statusConfig = {
            brouillon: { variant: 'secondary', label: 'Brouillon' },
            envoyee: { variant: 'default', label: 'Envoyée' },
            payee: { variant: 'success', label: 'Payée' }
        };

        const config = statusConfig[statut as keyof typeof statusConfig] || statusConfig.brouillon;
        
        return (
            <Badge variant={config.variant as any}>
                {config.label}
            </Badge>
        );
    };

    const handleDelete = (id: number) => {
        router.delete(route('proforma-invoices.destroy', id));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: "Dashboard",
            href: "/dashboard",
        },
        {
            title: "Factures Proforma",
            href: "/proforma-invoices",
        },
    ];
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Factures Proforma" />
            
            <div className=" py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Factures Proforma
                    </h1>
                    <Button asChild>
                        <Link href={route('proforma-invoices.create')}>
                            <Plus className="w-4 h-4 mr-2" />
                            Nouvelle Facture
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Liste des factures proforma</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {invoices.data.length > 0 ? (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>N° Facture</TableHead>
                                            <TableHead>Client</TableHead>
                                            <TableHead>Montant</TableHead>
                                            <TableHead>Créée le</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invoices.data.map((invoice : ProformaInvoice) => (
                                            <TableRow key={invoice.id}>
                                                <TableCell className="font-medium">
                                                    {invoice.numero_facture}
                                                </TableCell>
                                                <TableCell>
                                                    {invoice.client?.name || 'Non spécifié'}
                                                </TableCell>
                                                
                                                
                                                <TableCell className="font-semibold">
                                                    {Dollar(invoice.montant_total)}
                                                </TableCell>
                                                <TableCell>
                                                    {DateHeure(invoice.created_at)}
                                                </TableCell>
                                                <TableCell className="flex gap-2">
                                                    <Link href={route('proforma-invoices.show', invoice.id)}>
                                                    <Button variant="outline" size="sm"><Eye className="w-4 h-4" /></Button>
                                                    </Link>
                                                    <Link href={route('proforma-invoices.edit', invoice.id)}>
                                                    <Button variant="outline" size="sm"><Edit className="w-4 h-4" /></Button>
                                                    </Link>
                                                    <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="sm">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Cette action supprimera définitivement le produit et ne pourra pas être annulée.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(invoice.id)}>
                                                                Supprimer
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                <PaginationComponent data={invoices} />
                             </>
                        ) : (
                            <div className="text-center py-8">
                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Aucune facture proforma
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    Commencez par créer votre première facture proforma.
                                </p>
                                <Button asChild>
                                    <Link href={route('proforma-invoices.create')}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Créer une facture
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default Index;