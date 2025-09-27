import { type BreadcrumbItem, type Auth } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Progress } from '@radix-ui/react-progress';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

export default function OtherData({ auth }: { auth: Auth }) {
    const fileInput = useRef<HTMLInputElement>(null);

    const { data, setData, post, errors, progress, reset } = useForm({
        avatar: null as File | null,
        telephone: auth.user.telephone || '',
        adresse: auth.user.adresse || '',
        is_active: auth.user.is_active || false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('telephone', data.telephone);
        formData.append('adresse', data.adresse);
        formData.append('is_active', data.is_active.toString());
        if (data.avatar) {
            formData.append('avatar', data.avatar);
        }

        post(route('other-data.update'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {reset('avatar'); toast.success('Informations mises à jour avec succès')},
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('avatar', e.target.files[0]);
        }
    };
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Données supplémentaires',
            href: '/settings/other-data',
        },
    ];
    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Données supplémentaires" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Informations de profil" description="Mise à jour de vos informations personnelles" />

                    <div className="space-y-6">
                        <form onSubmit={submit} encType="multipart/form-data" className="space-y-6">
                            {/* Avatar Upload */}
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage 
                                        src={data.avatar 
                                            ? URL.createObjectURL(data.avatar)
                                            : auth.user?.avatar_url
                                                ? auth.user.avatar_url
                                                : undefined
                                        } 
                                    />
                                    <AvatarFallback>
                                        {auth.user.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => fileInput.current?.click()}
                                    >
                                        Changer la photo
                                    </Button>
                                    <input
                                        type="file"
                                        ref={fileInput}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                    <InputError message={errors.avatar} className="mt-2" />
                                    {progress && (
                                        <>
                                            <Progress value={progress.percentage} max={100} className="mt-2"/>
                                            {progress.percentage}%
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="telephone">Téléphone</Label>
                                    <Input
                                        id="telephone"
                                        value={data.telephone}
                                        onChange={(e) => setData('telephone', e.target.value)}
                                    />
                                    <InputError message={errors.telephone} className="mt-2" />
                                </div>

                                <div>
                                    <Label htmlFor="adresse">Adresse</Label>
                                    <Textarea
                                        id="adresse"
                                        value={data.adresse}
                                        onChange={(e) => setData('adresse', e.target.value)}
                                    />
                                    <InputError message={errors.adresse} className="mt-2" />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="is_active">Actif</Label>
                                    <Switch
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                    />
                                </div>
                            </div>

                            <Button type="submit" variant={'outline'}>Enregistrer</Button>
                        </form>
                    </div>
                </div>

            </SettingsLayout>
        </AppLayout>
    );
}