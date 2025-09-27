import { UserProfileCard } from "@/components/ui/user-profile-card";
import { type Auth } from "@/types";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import HeadingSmall from "@/components/heading-small";
import { Head } from "@inertiajs/react";
import SettingsLayout from "@/layouts/settings/layout";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Mon compte',
        href: '/mon_compte',
    },
];

export default function UserProfilePage(auth: Auth) {
  

  
  return (
    <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Mon compte" />
                        <SettingsLayout>
            <div className="space-y-6">

        <HeadingSmall title="Mon compte" description="Gestion de votre profil" />
        <div className="container py-8">
      <UserProfileCard 
        user={{
          ...auth.user,
          succursale: auth.user.succursale ? { name: auth.user.succursale.nom } : null
        }} 
        
      />
    </div>
    </div>
    </SettingsLayout>
    </AppLayout>
  );
}