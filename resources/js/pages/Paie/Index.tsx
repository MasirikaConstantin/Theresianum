import { Head, Link, router } from '@inertiajs/react';
import { Auth, BreadcrumbItem, PageProps } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatMoney } from '@/lib/formatMoney';
import AppLayout from '@/layouts/app-layout';
import { PaginationComponent } from '@/components/Pagination';
import { Eye, Plus, PlusCircle, Printer, Search } from 'lucide-react';

interface PaieIndexProps extends PageProps {
    paies: {
        data: Array<{
            id: number;
            ref: string;
            nom_complet: string;
            matricule: string;
            date_emission: string;
            net_a_payer: number;
            created_by: {
                name: string;
            };
        }>;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters: {
        search?: string;
        month?: string;
        year?: string;
    };
    auth: Auth;
}

export default function Index({ auth, paies, filters }: PaieIndexProps) {
    const months = [
        { value: '01', label: 'Janvier' },
        { value: '02', label: 'Février' },
        { value: '03', label: 'Mars' },
        { value: '04', label: 'Avril' },
        { value: '05', label: 'Mai' },
        { value: '06', label: 'Juin' },
        { value: '07', label: 'Juillet' },
        { value: '08', label: 'Août' },
        { value: '09', label: 'Septembre' },
        { value: '10', label: 'Octobre' },
        { value: '11', label: 'Novembre' },
        { value: '12', label: 'Décembre' },
    ];

    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

    const handleFilter = (key: string, value: string) => {
        router.get(route('paies.index'), {
            ...filters,
            [key]: value || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Paies', href: route('paies.index') },
    ];
    console.log(paies);
    return (
        <AppLayout
            auth={auth}
            breadcrumbs={breadcrumbs}
        >
            <Head title="Gestion des Paies" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Gestion des Paies
                    </h1>
                    <div className="flex gap-2">
                        <div className=" relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher..."
                                className="pl-9 "
                                value={filters.search || ''}
                                onChange={(e) => handleFilter('search', e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select
                                value={filters.month}
                                onValueChange={(value) => handleFilter('month', value)}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Mois" />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((month) => (
                                        <SelectItem key={month.value} value={month.value}>
                                            {month.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.year}
                                onValueChange={(value) => handleFilter('year', value)}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Année" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((year) => (
                                        <SelectItem key={year} value={String(year)}>
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                            <Link href={route('paies.create')}>
                            
                            <Button> <PlusCircle className="mr-2 h-4 w-4" />Nouvelle Paie</Button>
                        </Link>
                    </div>
                </div>


                <div className="rounded-lg border shadow-sm">
                    <Card className="rounded-lg border shadow-sm bg-background border-border">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl font-bold tracking-tight">Liste des Bulletins de Paie</CardTitle>
                                
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableHead>Agent</TableHead>
                                        <TableHead>Matricule</TableHead>
                                        <TableHead>Date Émission</TableHead>
                                        <TableHead>Net à Payer</TableHead>
                                        <TableHead>Créé par</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paies.data.map((paie, index) => (
                                        <TableRow key={paie.id}>
                                            <TableCell className="font-medium text-center ">
                                                {paies.from + index}
                                            </TableCell>
                                            <TableCell>{paie.nom_complet}</TableCell>
                                            <TableCell>{paie.matricule}</TableCell>
                                            <TableCell>
                                                {new Date(paie.date_emission).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {formatMoney(paie.net_a_payer, 'USD')}
                                            </TableCell>
                                            <TableCell>{paie.created_by.name}</TableCell>
                                            <TableCell className="space-x-2">
                                                
                                                    <Link href={route('paies.show', paie.ref)}>
                                                        
                                                        <Button variant="outline" size="sm" >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={route('paies.print', paie.id)}>
                                                        <Printer className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <PaginationComponent data={paies} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}