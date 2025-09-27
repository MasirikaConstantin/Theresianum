import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Auth, type BreadcrumbItem } from "@/types";
import { Link } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useRef } from "react";
import { useForm } from "@inertiajs/react";
import { toast } from "sonner";

export default function UpdateImage({ auth, service, flash }: { auth: Auth; service: any, flash: any }) {
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const { data, setData, post, processing } = useForm({
        image: null as File | null,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Services',
            href: '/services',
        },
        {
            title: 'Modifier une image',
            href: '#',
        },
    ];

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setData('image', null);
            setPreviewImage(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        post(route('services.update-image', service.ref), {
            onSuccess: (response) => {
                console.log(response);
                if(response?.props?.flash?.success){
                    toast.success(response.props.flash.success);
                }
                if(response?.props?.flash?.error){
                    toast.error(response.props.flash.error);
                }
            },
            onError: () => {
                toast.error('Une erreur est survenue lors de la mise à jour de l\'image');
            },
            forceFormData: true, // Important pour les fichiers
        });
    };

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Modifier une image" />
            <div className="p-6">
                <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Link href={route('services.index')}>
                                <Button variant="outline" size="icon">
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                            </Link>
                            <h1 className="text-2xl font-bold tracking-tight">Modifier une image</h1>
                        </div>
                    </div>
                </div>

                {(previewImage || service.image_url) && (
                    <div className="bg-muted relative mb-4 rounded-md overflow-hidden">
                        <img
                            src={previewImage || service.image_url}
                            alt="Preview"
                            className="w-full h-64 object-contain mx-auto"
                        />
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-4">
                        <div className="grid w-full max-w-sm items-center gap-3">
                            <Label htmlFor="image">Image</Label>
                            <Input 
                                id="image" 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                name="image"
                                accept="image/*"
                            />
                        </div>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Envoi en cours...' : 'Modifier'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    )   
}