import { useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from './ui/switch';
import { SharedData } from '@/types';

interface Currency {
    id: number;
    name: string;
    code: string;
    symbol: string;
    exchange_rate: number;
    is_active: boolean;
    is_default: boolean;
}

export default function CurrencyExchange({currencies}: {currencies: Currency[]}) {
    const [editMode, setEditMode] = useState<number | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        code: '',
        symbol: '',
        exchange_rate: 1,
        is_active: true,
        is_default: false
    });
    const { flash } = usePage<SharedData>().props;
    flash.error && toast.error(flash.error);
    flash.success && toast.success(flash.success);
    
    const handleEdit = (currency: Currency) => {
        setEditMode(currency.id);
        setData({
            name: currency.name,
            code: currency.code,
            symbol: currency.symbol,
            exchange_rate: currency.exchange_rate,
            is_active: currency.is_active,
            is_default: currency.is_default
        });
    };

    const handleUpdate = (id: number) => {
        put(route('currencies.update', id), {
            onSuccess: () => {
                toast.success('Devise mise à jour avec succès');
                setEditMode(null);
            },
            onError: () => {
                toast.error('Erreur lors de la mise à jour');
            }
        });
    };

    const handleDelete = (id: number) => {
        destroy(route('currencies.destroy', id), {
            onSuccess: () => {
                toast.success('Devise supprimée avec succès');
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('currencies.store'), {
            onSuccess: () => {
                toast.success('Nouvelle devise ajoutée');
                reset();
                setIsCreateModalOpen(false);
            },
            onError: (errors) => {
                toast.error('Erreur lors de la création');
            }
        });
    };
    const handleStatusChange = (id: number, checked: boolean) => {
        if (checked) {
            router.patch(route('currencies.set-active', id));
        } else {
            router.patch(route('currencies.set-inactive', id));
        }
    };
    return (
        <div className="container mx-auto py-6">
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                <div className="flex flex-row justify-between items-center">
                    <h1 className='text-2xl font-bold tracking-tight'>Gestion des Taux de Change</h1>
                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter une devise
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Ajouter une nouvelle devise</DialogTitle>
                                <DialogDescription>
                                    Ajouter une nouvelle devise
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                <div className="space-y-1">
                                    <Label>Nom de la devise</Label>
                                    <Input
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label>Code (3 lettres)</Label>
                                    <Input
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                        maxLength={3}
                                        required
                                    />
                                    {errors.code && <p className="text-red-500 text-sm">{errors.code}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label>Symbole</Label>
                                    <Input
                                        value={data.symbol}
                                        onChange={(e) => setData('symbol', e.target.value)}
                                        required
                                    />
                                    {errors.symbol && <p className="text-red-500 text-sm">{errors.symbol}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label>Taux (pour 1 USD)</Label>
                                    <Input
                                        type="number"
                                        step="0.0001"
                                        value={data.exchange_rate}
                                        onChange={(e) => setData('exchange_rate', parseFloat(e.target.value) || 0)}
                                        required
                                    />
                                    {errors.exchange_rate && <p className="text-red-500 text-sm">{errors.exchange_rate}</p>}
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button 
                                        type="button" 
                                        variant="outline"
                                        onClick={() => setIsCreateModalOpen(false)}
                                    >
                                        Annuler
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        Créer la devise
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
                <CardContent>
                <div className="rounded-lg border shadow-sm">
                        {/* Tableau des devises */}
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nom</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Symbole</TableHead>
                                    <TableHead>Taux (1 USD = ?)</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currencies?.map((currency: Currency) => (
                                    <TableRow key={currency.id}>
                                        {editMode === currency.id ? (
                                            <>
                                                <TableCell>
                                                    <Input
                                                        value={data.name}
                                                        onChange={(e) => setData('name', e.target.value)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        value={data.code}
                                                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                                        maxLength={3}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        value={data.symbol}
                                                        onChange={(e) => setData('symbol', e.target.value)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        step="0.0001"
                                                        value={data.exchange_rate}
                                                        onChange={(e) => setData('exchange_rate', parseFloat(e.target.value) || 0)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {/* Switch pour actif/par défaut */}
                                                </TableCell>
                                                <TableCell className="flex gap-2">
                                                    <Button 
                                                        size="sm" 
                                                        onClick={() => handleUpdate(currency.id)}
                                                    >
                                                        Enregistrer
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => setEditMode(null)}
                                                    >
                                                        Annuler
                                                    </Button>
                                                </TableCell>
                                            </>
                                        ) : (
                                            <>
                                                <TableCell>{currency.name}</TableCell>
                                                <TableCell>{currency.code}</TableCell>
                                                <TableCell>{currency.symbol}</TableCell>
                                                <TableCell>{currency.exchange_rate}</TableCell>
                                                <TableCell>
                                                    <>
                                                    <Switch
                                                        checked={currency.is_active}
                                                        onCheckedChange={(checked) => handleStatusChange(currency.id, checked)}
                                                    />
                                                    {currency.is_default ? 'Défaut' : currency.is_active ? 'Actif' : 'Inactif'}
                                                    </>
                                                </TableCell>
                                                <TableCell className="flex gap-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => handleEdit(currency)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    {!currency.is_default && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm"
                                                            onClick={() => handleDelete(currency.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </div>
        </div>
    );
}