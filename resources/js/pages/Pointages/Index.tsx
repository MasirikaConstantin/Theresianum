import { Agent, Auth, BreadcrumbItem, flash, Pointage } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Eye, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AppLayout from '@/layouts/app-layout';
import { PaginationComponent } from '@/components/Pagination';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DetailPresence } from '@/components/detailPresence';
import { Combobox } from '@/components/ui/combobox';
import { AgentCombobox } from '@/components/AgentCombobox';
import PrintPointages from './Print';
import { config } from 'process';
import { toast } from 'sonner';

export default function Index({ auth, pointages, filters, agents, flash }: {flash :flash, auth: Auth, pointages: Pointage[], filters: { agent_id?: string; date?: string; statut?: string }, agents: Agent[]}) {
    const handleFilter = (key: string, value: string | undefined) => {
        router.get(route('pointages.index'), { ...filters, [key]: value }, {
            preserveState: true,
            replace: true,
        });
    };

    if(flash.success){
        toast.success(flash.success);
    }else if(flash.error){
        toast.error(flash.error);
    }
    

    const handleTimePointage = (e: React.FormEvent, agentId: string, date: string, heureArrivee: string, heureDepart: string, pointageId: string) => {
        e.preventDefault();         
        router.post(route('pointages.generate-time'), {
            agent_id: agentId,
            date: date,
            heure_arrivee: heureArrivee,
            heure_depart: heureDepart,
            pointage_id: pointageId,
        });
    };
    // Dans votre composant parent
    const handlePrint = () => {
    router.visit(route('pointages.print'), {
        data: {
            agent_id: filters.agent_id,
            date: filters.date,
            statut: filters.statut,
        },
    });
    };
  const checkDateDuJour = (date: string) => {
    const dateDuJour = format(new Date(), 'yyyy-MM-dd');
    const datePointage = format(new Date(date), 'yyyy-MM-dd');
    return dateDuJour === datePointage;
  };
 
    return (
        <AppLayout
            auth={auth}
            breadcrumbs={[
                { title: 'Pointages', href: route('pointages.index') },
            ]}
        >
            <Head title="Pointages" />

            <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <h2 className="font-semibold text-2xl  leading-tight">Gestion des pointages</h2>
                <div className="space-x-2">
                   {/** <Button asChild>
                        <Link href={route('pointages.create')}>Nouveau pointage</Link>
                    </Button> */}
                    <Button variant="outline" onClick={() => router.post(route('pointages.generate-daily'))}>
                        Générer pointages du jour
                    </Button>
                    {/* Bouton d'impression */}
                    <Button 
                        onClick={handlePrint}
                    >
                        Imprimer le rapport
                    </Button>
                </div>
            </div>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-6">
                        {/* Filtre par agent */}
                        <AgentCombobox
                            agents={agents}
                            value={filters.agent_id || ""}
                            onChange={(val) => handleFilter("agent_id", val)}
                            />


                        {/* Filtre par date */}
                        <Popover >
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="justify-start text-left font-normal ml-6"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {filters.date ? format(new Date(filters.date), 'PPP', { locale: fr }) : 'Filtrer par date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={filters.date ? new Date(filters.date) : undefined}
                                    onSelect={(date) => handleFilter('date', date ? format(date, 'yyyy-MM-dd') : undefined)}
                                    initialFocus
                                    locale={fr}
                                />
                            </PopoverContent>
                        </Popover>

                        {/* Filtre par statut - À adapter selon vos valeurs exactes en base */}
                        <Select
                            value={filters.statut || ''}
                            onValueChange={(value) => handleFilter('statut', value || undefined)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Filtrer par statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="present">Présent</SelectItem>
                                <SelectItem value="absent">Absent</SelectItem>
                                <SelectItem value="congé">En congé</SelectItem>
                                <SelectItem value="malade">Malade</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Bouton pour vider les filtres */}
                        <Button 
                            variant="outline"
                            onClick={() => {
                                router.get(route('pointages.index'), {}, { preserveState: false });
                            }}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Vider les filtres
                        </Button>
                    </div>
                    <Alert className='bg-amber-100 mb-3'>
                        <AlertDescription>
                        Les pointages automatique se font pour les agents actif et ayant un contrat actif
                        </AlertDescription>
                    </Alert>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Agent</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Heure arrivée</TableHead>
                                    <TableHead>Heure départ</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableCaption>
                                Les pointages
                            </TableCaption>
                            <TableBody>
                                {pointages.data.map((pointage) => (
                                    <TableRow key={pointage.id}>
                                        <TableCell>{pointage.agent.nom} {pointage.agent.postnom} {pointage.agent.nom}</TableCell>
                                        <TableCell>{format(new Date(pointage.date), 'PPP', { locale: fr })}</TableCell>
                                        <TableCell>{pointage.heure_arrivee || '-'}</TableCell>
                                        <TableCell>{pointage.heure_depart || '-'}</TableCell>
                                        {/*
                                            <TableCell>
                                                <Badge variant={
                                                    pointage.statut === 'present' ? 'default' :
                                                        pointage.statut === 'absent' ? 'destructive' :
                                                            pointage.statut === 'congé' ? 'secondary' : 'outline'
                                                }>
                                                    {pointage.statut}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {pointage.retard && (
                                                    <Badge variant={pointage.justifie ? 'secondary' : 'destructive'}>
                                                        {pointage.retard} {pointage.justifie && '(justifié)'}
                                                    </Badge>
                                                )}
                                            </TableCell>*
                                        */}
                                        <TableCell className="space-x-2 flex">
                                        {pointage.statut === "congé" ? (
                                            <Badge variant="secondary" className="bg-green-500 p-1">En congé</Badge>
                                        ) : (
                                            <>
                                            <Link href={route('pointages.edit', pointage.id)}>
                                                <Button variant="outline" size="sm">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <div className="flex">
                                        <DetailPresence pointage={pointage} />
                                        </div>

                                        {checkDateDuJour(pointage.date) ? (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline">Pointage</Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-96">
                                                    <div className="grid gap-4">
                                                    <div className="space-y-2">
                                                        <h4 className="leading-none font-medium">Pointage</h4>
                                                        <Alert className="flex items-center gap-2 bg-emerald-400">
                                                        <p className='text-sm text-black'>Pointez lorsque l'agent se pointe. l'heure d'arrivée et de départ seront automatiquement enregistrées.</p>
                                                        </Alert>
                                                    </div>
                                                    <div className="grid gap-2">
                                                        <div className="grid grid-cols-2 items-center ">
                                                        <Label htmlFor="width">Heure d'arrivée</Label>
                                                        {pointage.heure_arrivee ? (
                                                            <Badge variant="outline" className="bg-green-500">Pointé à  {pointage.heure_arrivee} : {pointage.statut_arrivee === 'en-retard' ? 'en retard' : 'à l\'heure'}</Badge>
                                                        ) : (
                                                            <Button variant="default" size="sm" onClick={(e) => handleTimePointage(e, pointage.agent_id, pointage.date, format(new Date(), 'HH:mm:ss'), '', pointage.id)}>
                                                            Pointer  
                                                        </Button>
                                                        )}
                                                        </div>
                                                        {pointage.heure_arrivee ? (
                                                        <div className="grid grid-cols-2 items-center">
                                                        <Label htmlFor="maxWidth">Heure de départ</Label>
                                                        {pointage.heure_depart ? (
                                                            <Badge variant="outline" className="bg-green-500">Pointé à  {pointage.heure_depart} : {pointage.statut_depart === 'parti-tot' ? 'parti tot' : 'à l\'heure'}</Badge>
                                                        ) : (
                                                            <Button variant="default" size="sm" onClick={(e) => handleTimePointage(e, pointage.agent_id, pointage.date, '', format(new Date(), 'HH:mm:ss'), pointage.id)}>
                                                            Pointer
                                                        </Button>
                                                        )}
                                                        </div>
                                                        ):(
                                                        <p className="text-sm text-gray-500">Pointé l'heure d'arrivée avant de pointer l'heure de départ</p>

                                                        )}
                                                    </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                            ):
                                            <p className="text-sm text-gray-500">Jour passé</p>
                                        }
                                            </>
                                        )}
                                        
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        <div className="mt-4 flex justify-center items-center">
                            <PaginationComponent data={pointages} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}