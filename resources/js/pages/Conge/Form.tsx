import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Agent } from '@/types';
import { fr } from 'date-fns/locale';
import { Textarea } from '@/components/ui/textarea';
import { Combobox } from '@/components/ui/combobox';
import { toast } from 'sonner';
import { useEffect } from 'react';

interface CongeFormProps {
    agents: Agent[];
    types: string[];
    statuts?: string[];
    conge?: {
        id?: number;
        ref?: string;
        agent_id?: number;
        type?: string;
        date_debut?: string;
        date_fin?: string;
        motif?: string;
        statut?: string;
        commentaire?: string;
    };
}

export default function CongeForm({ agents, types, statuts, conge }: CongeFormProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        agent_id: conge?.agent_id || '',
        type: conge?.type || '',
        date_debut: conge?.date_debut || '',
        date_fin: conge?.date_fin || '',
        motif: conge?.motif || '',
        statut: conge?.statut || 'en_attente',
        commentaire: conge?.commentaire || '',
    });

    const calculateDuration = () => {
        if (data.date_debut && data.date_fin) {
            const start = new Date(data.date_debut);
            const end = new Date(data.date_fin);
            return (end.getTime() - start.getTime()) / (1000 * 3600 * 24) + 1;
        }
        return 0;
    };
    console.log(data.date_debut ? format(new Date(data.date_debut), "PPP", { locale: fr }) : '');
    console.log(data.date_fin ? format(new Date(data.date_fin), "PPP", { locale: fr }) : '');
    console.log(calculateDuration());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (conge?.ref) {
            put(route('conges.update', conge.ref), {
                onSuccess: () => {
                    toast.success('Congé mis à jour avec succès');
                },
                onError: (response) => {
                    if(response.agent_id){
                        toast.error(response.agent_id);
                    }
                    if(response.type){
                        toast.error(response.type);
                    }
                    if(response.date_debut){
                        toast.error(response.date_debut);
                    }
                    if(response.date_fin){
                        toast.error(response.date_fin);
                    }
                    if(response.motif){
                        toast.error(response.motif);
                    }
                    if(response.statut){
                        toast.error(response.statut);
                    }
                    if(response.commentaire){
                        toast.error(response.commentaire);
                    }
                },
            });
        } else {
            post(route('conges.store'), {
                onSuccess: () => {
                    toast.success('Congé enregistré avec succès');
                },
                onError: (response) => {
                    if(response.agent_id){
                        toast.error(response.agent_id);
                    }
                    if(response.type){
                        toast.error(response.type);
                    }
                    if(response.date_debut){
                        toast.error(response.date_debut);
                    }
                    if(response.date_fin){
                        toast.error(response.date_fin);
                    }
                    if(response.motif){
                        toast.error(response.motif);
                    }
                    if(response.statut){
                        toast.error(response.statut);
                    }
                    if(response.commentaire){
                        toast.error(response.commentaire);
                    }
                },
            });
        }
    };
    useEffect(() => {
        if (conge?.agent_id) {
          setData('agent_id', conge.agent_id.toString());
        }
      }, [conge]);
      
    return (
        <form onSubmit={handleSubmit} className="space-y-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-6   shadow-lg shadow-card p-6 rounded-lg">
                <div>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Informations de base
                    </h2>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="agent_id">Agent</Label>
                        <Combobox
                            options={agents.map(agent => ({
                                value: agent.id.toString(),
                                label: `${agent.matricule} - ${agent.nom} ${agent.postnom} ${agent.prenom}`,
                            }))}
                            value={data.agent_id}
                            onChange={(value) => setData('agent_id', value)}
                            disabled={!!conge}
                            placeholder="Sélectionner un agent"
                            searchPlaceholder="Rechercher un agent..."
                            emptyText="Aucun agent trouvé"
                            />

                        
                        {errors.agent_id && <p className="text-sm text-red-500">{errors.agent_id}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="type">Type de congé</Label>
                        <Select
                            value={data.type}
                            onValueChange={(value) => setData('type', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un type" />
                            </SelectTrigger>
                            <SelectContent>
                                {types.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type.replace('_', ' ').toUpperCase()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                    </div>
                </div>
            </div>

            

            <div className="space-y-6 shadow-lg shadow-card p-6 rounded-lg">
                <h2 className="font-semibold text-xl  leading-tight">
                    Détails
                </h2>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="motif">Motif</Label>
                        <Textarea
                            id="motif"
                            value={data.motif}
                            onChange={(e) => setData('motif', e.target.value)}
                        />
                        {errors.motif && <p className="text-sm text-red-500">{errors.motif}</p>}
                    </div>

                    {statuts && (
                        <div className="space-y-2">
                            <Label htmlFor="statut">Statut</Label>
                            <Select
                                value={data.statut}
                                onValueChange={(value) => setData('statut', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuts.map((statut) => (
                                        <SelectItem key={statut} value={statut}>
                                            {statut.replace('_', ' ').toUpperCase()}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                   
                </div>
            </div>

            <div className="space-y-6 shadow-lg shadow-card p-6 rounded-lg">
                <h2 className="font-semibold text-xl  leading-tight">
                    Période de congé
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Date de début</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !data.date_debut && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {data.date_debut ? (
                                        format(new Date(data.date_debut), "PPP", { locale: fr })
                                    ) : (
                                        <span>Choisir une date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    locale={fr}
                                    selected={data.date_debut ? format(new Date(data.date_debut), "PPP", { locale: fr }) : undefined}
                                    onSelect={(date) => setData('date_debut', date?.toISOString() || '')}
                                    initialFocus
                                    disabled={(date) => date < new Date()}
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.date_debut && <p className="text-sm text-red-500">{errors.date_debut}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Date de fin</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !data.date_fin && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {data.date_fin ? (
                                        format(new Date(data.date_fin), "PPP", { locale: fr })
                                    ) : (
                                        <span>Choisir une date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    locale={fr}
                                    mode="single"
                                    selected={data.date_fin ? new Date(data.date_fin) : undefined}
                                    onSelect={(date) => setData('date_fin', format(date, 'yyyy-MM-dd'))}
                                    initialFocus
                                    disabled={(date) => 
                                        data.date_debut ? date < (new Date(data.date_debut)) : date < new Date()
                                    }
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.date_fin && <p className="text-sm text-red-500">{errors.date_fin}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Durée</Label>
                        <Input
                            value={`${calculateDuration()} jours`}
                            readOnly
                        />
                    </div>
                </div>
                
            </div>
            <div className="space-y-2 shadow-lg shadow-card p-6 rounded-lg ">
                    <Label>Commentaire (Optionnel)</Label>
                    <Textarea
                        id="commentaire"
                        rows={4}
                        value={data.commentaire}
                        onChange={(e) => setData('commentaire', e.target.value)}
                    />
                    {errors.commentaire && <p className="text-sm text-red-500">{errors.commentaire}</p>}
                </div>

            <div className="flex justify-end gap-4">
                <Button variant="outline" type="button" asChild>
                    <a href={route('conges.index')}>Annuler</a>
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
            </div>
        </form>
    );
}