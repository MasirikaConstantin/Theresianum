import { DialogCategory } from '@/components/CategorieModal';
import { CategoryDetails } from '@/components/CategoryDetailsModal';
import AppLayout from '@/layouts/app-layout';
import { Auth, BreadcrumbItem, Categorie } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function CategoriesIndex({ categories, auth, flash }: { categories: Categorie[]; auth: Auth, flash: any }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Tableau de bord', href: route('dashboard') },
        {title: 'Produits', href: route('produits.index')},
        { title: 'Categories', href: route('categories.index') },
    ];
    
    flash.error && toast.error(flash.error);
    flash.success && toast.success(flash.success);
    
    const [editingCategory, setEditingCategory] = useState<Categorie | null>(null);
    const [viewingCategory, setViewingCategory] = useState<Categorie | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    const canCreate = auth.user.role === "admin";
    
    const handleDelete = (ref: string) => {
        router.delete(route('categories.destroy', ref));
    };

    const handleEdit = (category: Categorie) => {
        setEditingCategory(category);
    };

    const handleView = (category: Categorie) => {
        setViewingCategory(category);
    };

    const handleCloseEditModal = () => {
        setEditingCategory(null);
    };

    const handleCloseViewModal = () => {
        setViewingCategory(null);
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };
    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'PPP', { locale: fr });
      }

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Categories" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Gestion des categories</h1>
                    <div className="flex gap-2">
                        {canCreate && (
                            <DialogCategory 
                                open={isCreateModalOpen}
                                onOpenChange={setIsCreateModalOpen}
                                trigger={
                                    <Button variant="outline">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Ajouter une categorie
                                    </Button>
                                }
                            />
                        )}
                    </div>
                </div>
                
                <div className="rounded-lg border shadow-sm">
                    <Table>
                        <TableCaption>
                            {categories.length > 0 ? (
                                `Affichage des categories ${categories.length}`
                            ) : (
                                'Aucune categorie trouvé'
                            )}
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">#</TableHead>
                                <TableHead>Nom</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Enregistré par</TableHead>
                                <TableHead>Créée le</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category: any, index: any) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell className="font-medium">{category.nom}</TableCell>
                                    <TableCell>
                                        <Badge variant={category.is_active ? "default" : "secondary"}>
                                            {category.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {category.enregistre_par ? (
                                            <Badge variant="outline">
                                                {category.enregistre_par?.name}
                                            </Badge>
                                        ) : (
                                            '-'
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {formatDate(category.created_at)}
                                    </TableCell>
                                    <TableCell className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleView(category)}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        
                                        {canCreate && (
                                            <>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => handleEdit(category)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="destructive" size="sm">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Cette action supprimera définitivement la categorie et ne pourra pas être annulée.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(category.ref)}>
                                                                Supprimer
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Modal de création */}
                {isCreateModalOpen && (
                    <DialogCategory 
                        open={isCreateModalOpen}
                        onOpenChange={setIsCreateModalOpen}
                    />
                )}

                {/* Modal d'édition */}
                {editingCategory && (
                    <DialogCategory 
                        category={editingCategory}
                        open={!!editingCategory}
                        onOpenChange={(open) => !open && handleCloseEditModal()}
                    />
                )}

                {/* Modal de détails */}
                {viewingCategory && (
                    <CategoryDetails 
                        category={viewingCategory}
                        open={!!viewingCategory}
                        onOpenChange={(open) => !open && handleCloseViewModal()}
                    />
                )}
            </div>
        </AppLayout>
    );
}