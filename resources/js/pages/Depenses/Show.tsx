import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wallet, User, FileText, Calendar } from 'lucide-react';
import { Auth, BreadcrumbItem } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FrancCongolais } from '@/hooks/Currencies';

interface Depense {
    id: number;
    ref: string;
    libelle: string;
    montant: string;
    description?: string;
    created_at: string;
    caisse: {
        ref: string;
    };
    user: {
        name: string;
    };
}

interface Props {
    depense: Depense;
    auth: Auth;
}

export default function DepenseShow({ depense, auth }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Depenses', href: '/depenses' },
        { title: `Dépense `, href: '#' },
    ];
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title={`Dépense ${depense.ref}`} />
            
            <div className="container py-6 px-4">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Détails de la dépense</h1>
                    <Button variant="outline" asChild>
                        <Link href={route('depenses.index')}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Montant</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-200">
                                -{FrancCongolais(parseFloat(depense.montant))}
                            </div>
                        </CardContent>
                    </Card>

                    

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Enregistré par</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                <p>{depense.user.name}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Détails</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 ">
                            <div className="flex items-center gap-4">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Libellé</p>
                                    <p>{depense.libelle}</p>
                                </div>
                            </div>

                            {depense.description && (
                                <div className="flex items-start gap-4">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Description</p>
                                        <p className="whitespace-pre-line">{depense.description}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Date</p>
                                    <p>{format(new Date(depense.created_at), 'PPPPp', { locale: fr })}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}