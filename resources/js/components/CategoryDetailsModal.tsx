import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
  import { Label } from "@/components/ui/label"
  import { Badge } from "@/components/ui/badge"
  import { Separator } from "@/components/ui/separator"
  import { Categorie } from "@/types"
  
  interface CategoryDetailsProps {
    category: Categorie
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
  
  export function CategoryDetails({ 
    category, 
    open, 
    onOpenChange 
  }: CategoryDetailsProps) {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Détails de la catégorie</DialogTitle>
            <DialogDescription>
              Informations complètes sur la catégorie
            </DialogDescription>
          </DialogHeader>
  
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Nom</Label>
                <p className="text-sm mt-1">{category.nom}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Statut</Label>
                <div className="mt-1">
                  <Badge variant={category.is_active ? "default" : "secondary"}>
                    {category.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
  
            <Separator />
  
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <p className="text-sm mt-1 text-muted-foreground">
                {category.description || "Aucune description"}
              </p>
            </div>
  
            <Separator />
  
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Référence</Label>
                <p className="text-sm mt-1 font-mono">{category.ref}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Créée le</Label>
                <p className="text-sm mt-1">{formatDate(category.created_at)}</p>
              </div>
            </div>
  
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Modifiée le</Label>
                <p className="text-sm mt-1">
                  {category.updated_at ? formatDate(category.updated_at) : '-'}
                </p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Créée par</Label>
                <p className="text-sm mt-1">
                  {category.enregistre_par?.name || 'Système'}
                </p>
              </div>
            </div>
  
            {category.modifie_par && (
              <div>
                <Label className="text-sm font-medium">Modifiée par</Label>
                <p className="text-sm mt-1">{category.modifie_par.name}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }