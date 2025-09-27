import { MonthYearPicker } from "@/components/MonthYearPicker";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { Auth } from "@/types";
import { Agent, Pointage } from "@/types";
import { Head, Link } from "@inertiajs/react";
import axios from "axios";
import { format } from "date-fns";
import { PrinterIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { route } from "ziggy-js";

export default function RapportPresence({auth, agents}: {auth: Auth, agents: Agent[]}) {
    const [pointages, setPointages] = useState<Pointage[]>([]);
    const [agent, setAgent] = useState<Agent | null>(null);
    const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM'));

    useEffect(() => {
        if (agent && date) {
            fetchPointages();
        }
    }, [agent, date]);

    const fetchPointages = () => {
        axios.get(route('pointages.get-agent-pointages'), {
            params: {
                agent_id: agent?.id,
                date: date,
            },
        })
            .then((response) => {
                setPointages(response.data);
            })
            .catch((error) => {
                // Utilisation de console.log au lieu de console.error
                console.log('Error fetching pointages:', error);
            });
    };
  
    return (
        <AppLayout auth={auth} breadcrumbs={[
            { title: 'Tableau de bord', href: route('dashboard') },
            { title: 'Pointages', href: route('pointages.index') },
            { title: 'Rapport de Présence', href: route('pointages.agent') },
        ]}>
            <Head title="Rapport de Présence" />        
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-semibold text-2xl leading-tight">Rapport de Présence</h2>
                    <Button asChild variant="outline">
                        <Link href={route('pointages.index')}>Retour à la liste</Link>
                    </Button>
                </div>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="overflow-hidden">
                        <div className="mb-4">
                            <MonthYearPicker 
                                value={date}
                                onChange={(value) => setDate(value)} 
                            />
                        </div>
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nom</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {agents.map((agentItem) => (
                                            <TableRow key={agentItem.id}>
                                                <TableCell>{agentItem.nom} {agentItem.postnom}</TableCell>
                                                <TableCell>
                                                    <Button 
                                                        variant="outline" 
                                                        onClick={() => setAgent(agentItem)}
                                                    >
                                                        Selectionner
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="col-span-2">
                                {agent && (
                                    <>
                                    <Alert variant="default" className="mb-4">
                                        <AlertTitle>Agent selectionné</AlertTitle>
                                        <AlertDescription>{agent.nom} {agent.postnom} {agent.prenom}</AlertDescription>
                                    </Alert>
                                    <Link href={route('pointages.print-grille', { ref: agent.ref, date: date })}>
                                    <Button 
                                    className="gap-2 w-full md:w-auto mb-1"
                                >
                                    <PrinterIcon className="h-4 w-4" />
                                    Imprimer 
                                </Button>
                                </Link>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Arrivée</TableHead>
                                                <TableHead>Départ</TableHead>
                                                <TableHead>Statut</TableHead>
                                                <TableHead>Statut Départ</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {pointages && pointages.data ? (
                                                pointages.data.map((pointage) => (
                                                    <TableRow key={pointage.id}>
                                                        <TableCell>{pointage.date}</TableCell>
                                                        <TableCell>{pointage.heure_arrivee || '-'}</TableCell>
                                                        <TableCell>{pointage.heure_depart || '-'}</TableCell>
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
                                                            {pointage.statut_depart && (
                                                                <Badge variant={pointage.justifie ? 'secondary' : 'destructive'}>
                                                                    {pointage.statut_depart} {pointage.justifie && '(justifié)'}
                                                                </Badge>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center">
                                                        Aucun pointage trouvé pour cet agent
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}