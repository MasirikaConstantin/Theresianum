import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ProformaInvoice, BreadcrumbItem, Auth } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, Edit, Printer, Mail } from 'lucide-react';
import { DateHeure, DateSimple, Dollar } from '@/hooks/Currencies';

interface Props {
    invoice: ProformaInvoice;
    auth: Auth;
}

const Show: React.FC<Props> = ({ invoice, auth }) => {
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

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: "Dashboard",
            href: "/dashboard",
        },
        {
            title: "Factures Proforma",
            href: "/proforma-invoices",
        },
        {
            title: `Facture ${invoice.numero_facture}`,
            href: `/proforma-invoices/${invoice.id}`,
        },
    ];
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title={`Facture ${invoice.numero_facture}`} />
            
            <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* En-tête avec actions */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('proforma-invoices.index')}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Retour
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Facture {invoice.numero_facture}
                            </h1>
                            <div className="flex items-center space-x-2 mt-1">
                                {getStatusBadge(invoice.statut)}
                                <span className="text-sm">
                                    Créée le {DateSimple(invoice.created_at)}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('proforma-invoices.print', invoice.id)}>
                                <Download className="w-4 h-4 mr-2" />
                                PDF
                            </Link>
                        </Button>
                        <Button size="sm" asChild>
                            <Link href={route('proforma-invoices.edit', invoice.id)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Modifier
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Informations principales */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Carte de la facture */}
                        <Card className="print:shadow-none">
                            <CardContent className="p-6">
                                {/* En-tête facture */}
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h2 className="text-2xl font-bold ">FACTURE PROFORMA</h2>
                                        <p className="">N°: {invoice.numero_facture}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-semibold">
                                            Date: {DateSimple(invoice.date_facture)}
                                        </div>
                                        {invoice.date_echeance && (
                                            <div className="">
                                                Échéance: {DateSimple(invoice.date_echeance)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Informations client */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    
                                    <div className=" bg-background p-4 rounded-lg">
                                        <h3 className="font-semibold  mb-2">Client</h3>
                                        <div className="text-sm ">
                                            <p className="font-medium">
                                            {invoice.client?.telephone}
                                            </p>
                                            
                                        </div>
                                    </div>
                                </div>

                                {/* Tableau des articles */}
                                <div className="mb-8">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-20">Date</TableHead>
                                                <TableHead>Désignation</TableHead>
                                                <TableHead className="text-center">Quantité</TableHead>
                                                <TableHead className="text-right">Prix Unitaire</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {invoice.items.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">
                                                        {DateSimple(item.date_item)}
                                                    </TableCell>
                                                    <TableCell>{item.designation}</TableCell>
                                                    <TableCell className="text-center">
                                                        {item.quantite}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {Dollar(item.prix_unitaire)}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {Dollar(item.montant_total)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                        <TableFooter>
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-right font-medium">
                                                    Total:
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-lg">
                                                    {Dollar(invoice.montant_total)}
                                                </TableCell>
                                            </TableRow>
                                        </TableFooter>
                                    </Table>
                                </div>

                                {/* Notes */}
                                {invoice.notes && (
                                    <div className="border-t pt-4">
                                        <h4 className="font-semibold mb-2">Notes</h4>
                                        <p className="text-sm whitespace-pre-line">
                                            {invoice.notes}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - Informations supplémentaires */}
                    <div className="space-y-6">
                        {/* Statut et actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Statut</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Statut:</span>
                                    {getStatusBadge(invoice.statut)}
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Montant total:</span>
                                    <span className="text-lg font-bold">{Dollar(invoice.montant_total)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Nombre d'articles:</span>
                                    <span className="font-medium">{invoice.items.length}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Informations techniques */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Informations</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="">Créée par:</span>
                                    <span>{invoice.created_by?.name || 'Système'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="">Créée le:</span>
                                    <span>{DateHeure(invoice.created_at)}</span>
                                </div>
                                {invoice.updated_at !== invoice.created_at && (
                                    <>
                                    <div className="flex justify-between">
                                        <span className="">Modifiée le:</span>
                                        <span>{DateHeure(invoice.updated_at)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="">Modifiée par:</span>
                                        <span>{invoice.updated_by?.name || 'Système'}</span>
                                    </div>
                                    </>
                                )}
                                
                            </CardContent>
                        </Card>

                        {/* Actions rapides */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link href={route('proforma-invoices.edit', invoice.id)}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Modifier la facture
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start" asChild>
                                    <Link target="_blank" href={route('proforma-invoices.print', invoice.id)}>
                                        <Download className="w-4 h-4 mr-2" />
                                        Télécharger PDF
                                    </Link>
                                </Button>
                                {invoice.client?.email && (
                                    <Button variant="outline" className="w-full justify-start">
                                        <Mail className="w-4 h-4 mr-2" />
                                        Envoyer par email
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            
        </AppLayout>
    );
};

export default Show;