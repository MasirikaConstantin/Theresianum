import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useState } from 'react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Reference {
    id: number;
    nom: string;
    telephone: string;
    email?: string;
    fonction: string;
    created_at: string;
    updated_at: string;
}

interface ReferencesListProps {
    references: Reference[];
    agentId: number;
    onRefresh: () => void;
    onEdit: (reference: Reference) => void;
    flash: any;
}

export function ReferencesList({ references, agentId, onRefresh, onEdit, flash }: ReferencesListProps) {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [viewingReference, setViewingReference] = useState<Reference | null>(null);

    const handleDelete = async (id: number) => {
        setDeletingId(id);
        try {
            await axios.delete(`/api/references/${id}`);
            toast.success('Référence supprimée avec succès.');
            onRefresh();
        } catch (error) {
            console.error('Error deleting reference:', error);
            toast.error('Une erreur est survenue lors de la suppression de la référence.');
        } finally {
            setDeletingId(null);
        }
    };

    flash.error && toast.error(flash.error);
    flash.success && toast.success(flash.success);

    return (
        <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {references.map((reference, index) => (
                        <TableRow key={reference.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{reference.nom}</TableCell>
                            <TableCell>{reference.telephone}</TableCell>
                            <TableCell>{reference.email || '-'}</TableCell>
                            <TableCell className="text-right space-x-2">
                                {/* Modal pour voir les détails */}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setViewingReference(reference)}
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>

                                {/* Modal d'édition */}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => onEdit(reference)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                
                                {/* Modal de suppression */}
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button 
                                            variant="destructive" 
                                            size="sm"
                                            disabled={deletingId === reference.id}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Supprimer la référence</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Voulez-vous vraiment supprimer cette référence ?
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                            <AlertDialogAction 
                                                onClick={() => handleDelete(reference.id)}
                                                disabled={deletingId === reference.id}
                                            >
                                                {deletingId === reference.id ? 'Suppression...' : 'Supprimer'}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                    {references.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">
                                Aucune référence enregistrée
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            {/* Modal unique pour voir les détails */}
            <Dialog open={!!viewingReference} onOpenChange={(open) => !open && setViewingReference(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Informations de la référence</DialogTitle>
                        <DialogDescription>
                            Détails complets de la référence
                        </DialogDescription>
                    </DialogHeader>
                    {viewingReference && (
                        <div className="space-y-4">
                            <div>
                                <p className="font-medium">Nom:</p>
                                <p>{viewingReference.nom}</p>
                            </div>
                            <div>
                                <p className="font-medium">Téléphone:</p>
                                <p>{viewingReference.telephone}</p>
                            </div>
                            <div>
                                <p className="font-medium">Email:</p>
                                <p>{viewingReference.email || '-'}</p>
                            </div>
                            <div>
                                <p className="font-medium">Fonction:</p>
                                <p>{viewingReference.fonction}</p>
                            </div>
                            <div>
                                <p className="font-medium">Créé le:</p>
                                <p>{format(new Date(viewingReference.created_at), 'PPPp', { locale: fr })}</p>
                            </div>
                            {viewingReference.updated_at !== viewingReference.created_at && (
                                <div>
                                    <p className="font-medium">Mis à jour le:</p>
                                    <p>{format(new Date(viewingReference.updated_at), 'PP', { locale: fr })}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}