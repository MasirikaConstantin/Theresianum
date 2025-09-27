import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect } from "react"
import { useForm } from "@inertiajs/react"

interface Category {
  id?: number
  nom: string
  description: string
  is_active: boolean
  ref?: string
}

interface DialogCategoryProps {
  category?: Category
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

export function DialogCategory({ 
  category, 
  open, 
  onOpenChange, 
  trigger 
}: DialogCategoryProps) {
  const [isOpen, setIsOpen] = useState(open || false);
  const isEdit = !!category?.id;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    nom: category?.nom || "",
    description: category?.description || "",
    is_active: category?.is_active ?? true,
  })

  // Synchroniser l'état interne avec les props
  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open])

  useEffect(() => {
    if (category) {
      setData({
        nom: category.nom,
        description: category.description,
        is_active: category.is_active,
      })
    } else {
      reset()
    }
  }, [category])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
    
    if (!open) {
      // Réinitialiser le formulaire quand le modal se ferme
      setTimeout(() => reset(), 300);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isEdit && category?.id) {
      put(route('categories.update', category.id), {
        onSuccess: () => {
          reset()
          handleOpenChange(false)
        }
      })
    } else {
      post(route('categories.store'), {
        onSuccess: () => {
          reset()
          handleOpenChange(false)
        }
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">{isEdit ? "Modifier" : "Nouvelle Catégorie"}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Modifier la catégorie" : "Nouvelle catégorie"}
            </DialogTitle>
            <DialogDescription>
              {isEdit 
                ? "Modifiez les informations de la catégorie ici."
                : "Remplissez les informations pour créer une nouvelle catégorie."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nom">Nom de la catégorie *</Label>
              <Input
                id="nom"
                name="nom"
                value={data.nom}
                onChange={(e) => setData('nom', e.target.value)}
                placeholder="Entrez le nom de la catégorie"
                className={errors.nom ? "border-destructive" : ""}
              />
              {errors.nom && (
                <p className="text-sm text-destructive">{errors.nom}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Description de la catégorie"
                rows={3}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="is_active"
                checked={data.is_active}
                onCheckedChange={(checked) => setData('is_active', checked)}
              />
              <Label htmlFor="is_active">Catégorie active</Label>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Annuler
              </Button>
            </DialogClose>
            <Button type="submit" disabled={processing}>
              {processing ? "En cours..." : (isEdit ? "Modifier" : "Créer")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}