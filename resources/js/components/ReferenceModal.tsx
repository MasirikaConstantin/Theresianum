import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

interface ReferenceModalProps {
    open: boolean;
    onClose: () => void;
    agentId: number;
    reference?: {
        id?: number;
        nom: string;
        telephone: number;
        email?: string;
        fonction:string
    };
    onSuccess: () => void;
}

export function ReferenceModal({ open, onClose, agentId, reference, onSuccess }: ReferenceModalProps) {
    const { data, setData, post, patch, processing, errors, reset } = useForm({
        nom: reference?.nom || '',
        telephone: reference?.telephone || '',
        email: reference?.email || '',
        fonction : reference?.fonction || '',
    });

    useEffect(() => {
        if (reference) {
            setData({
                nom: reference.nom,
                telephone: reference.telephone,
                email: reference.email || '',
                fonction :reference.fonction
            });
        } else {
            reset();
        }
    }, [reference]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
    
        const url = reference?.id 
            ? `/api/references/${reference.id}`
            : `/api/agents/${agentId}/references`;
    
        const method = reference?.id ? patch : post;
    
        method(url, {
            onSuccess: () => {
                onSuccess();
                onClose();
            },
        });
    };
    

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {reference?.id ? 'Modifier la référence' : 'Ajouter une référence'}
                    </DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    Ajout d'une personne de référence à l'agent
                </DialogDescription>
                
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nom">Nom *</Label>
                        <Input
                            id="nom"
                            value={data.nom}
                            onChange={(e) => setData('nom', e.target.value)}
                            required
                        />
                        {errors.nom && <p className="text-sm text-red-600">{errors.nom}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="telephone">Téléphone *</Label>
                        <Input
                            id="telephone"
                            value={data.telephone}
                            type="number"
                            onChange={(e) => setData('telephone', e.target.value)}
                            required
                        />
                        {errors.telephone && <p className="text-sm text-red-600">{errors.telephone}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="fonction">Profession *</Label>
                        <Input
                            id="fonction"
                            value={data.fonction}
                            onChange={(e) => setData('fonction', e.target.value)}
                            required
                        />
                        {errors.fonction && <p className="text-sm text-red-600">{errors.fonction}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={onClose} type="button">
                            Annuler
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {reference?.id ? 'Modifier' : 'Ajouter'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}