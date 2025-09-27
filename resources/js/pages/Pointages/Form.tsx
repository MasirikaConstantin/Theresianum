import { Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from '@radix-ui/react-icons';
import { Agent, Pointage } from '@/types';
import { fr } from 'date-fns/locale';



export default function Form({ pointage, agents }: { pointage?: Pointage; agents: Agent[] }) {
    const { data, setData, errors, processing, put, post } = useForm({
        agent_id: pointage?.agent_id || '',
        date: pointage?.date ? format(new Date(pointage.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        statut: pointage?.statut || 'present',
        heure_arrivee: pointage?.heure_arrivee || '',
        heure_depart: pointage?.heure_depart || '',
        justifie: pointage?.justifie || false,
        justification: pointage?.justification || '',
        notes: pointage?.notes || '',
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pointage) {
            put(route('pointages.update', pointage.id));
        } else {
            post(route('pointages.store'));
        }
    };


    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className=" space-y-2">
                    <Label htmlFor="agent_id">Agent</Label>
                    <Select
                        value={String(data.agent_id)}
                        onValueChange={(value) => setData('agent_id', Number(value))}
                        disabled={false}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un agent" />
                        </SelectTrigger>
                        <SelectContent>
                            {agents.map((agent) => (
                                <SelectItem key={agent.id} value={String(agent.id)}>
                                    {agent.nom} {agent.postnom} {agent.prenom}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.agent_id && <p className="text-sm text-red-500">{errors.agent_id}</p>}
                </div>

                <div className=" space-y-2">
                    <Label>Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {data.date ? format(new Date(data.date), 'PPP', { locale: fr }) : 'Choisir une date'}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                           
                        </PopoverContent>
                    </Popover>
                    {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="statut">Statut</Label>
                    <Select
                        value={data.statut}
                        onValueChange={(value) => setData('statut', value as any)}
                        disabled={processing}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="present">Présent</SelectItem>
                            <SelectItem value="absent">Absent</SelectItem>
                            <SelectItem value="congé">Congé</SelectItem>
                            <SelectItem value="malade">Malade</SelectItem>
                            <SelectItem value="formation">Formation</SelectItem>
                            <SelectItem value="mission">Mission</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.statut && <p className="text-sm text-red-500">{errors.statut}</p>}
                </div>

                {data.statut === 'present' && (
                    <>
                        {/*<div className="space-y-2">
                            <Label htmlFor="heure_arrivee">Heure d'arrivée</Label>
                            <Input
                                id="heure_arrivee"
                                type="time"
                                value={data.heure_arrivee}
                                onChange={(e) => setData('heure_arrivee', e.target.value)}
                                disabled={processing}
                            />
                            {errors.heure_arrivee && <p className="text-sm text-red-500">{errors.heure_arrivee}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="heure_depart">Heure de départ</Label>
                            <Input
                                id="heure_depart"
                                type="time"
                                value={data.heure_depart}
                                onChange={(e) => setData('heure_depart', e.target.value)}
                                disabled={processing}
                            />
                            {errors.heure_depart && <p className="text-sm text-red-500">{errors.heure_depart}</p>}
                        </div>
                        */}

                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="justifie"
                                    checked={data.justifie}
                                    onCheckedChange={(checked) => setData('justifie', checked)}
                                    disabled={processing}
                                />
                                <Label htmlFor="justifie">Justifié</Label>
                            </div>
                            {errors.justifie && <p className="text-sm text-red-500">{errors.justifie}</p>}
                        </div>

                        {data.justifie && (
                            <div className="space-y-2">
                                <Label htmlFor="justification">Justification</Label>
                                <Textarea
                                    id="justification"
                                    value={data.justification}
                                    onChange={(e) => setData('justification', e.target.value)}
                                    disabled={processing}
                                />
                                {errors.justification && <p className="text-sm text-red-500">{errors.justification}</p>}
                            </div>
                        )}
                    </>
                )}

                <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                        id="notes"
                        value={data.notes}
                        onChange={(e) => setData('notes', e.target.value)}
                        disabled={processing}
                    />
                    {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
                </div>
            </div>

            <div className="flex justify-end space-x-4">
                <Button asChild variant="outline">
                    <Link href={route('pointages.index')}>Annuler</Link>
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
            </div>
        </form>
    );
}