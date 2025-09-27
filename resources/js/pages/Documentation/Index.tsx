import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, BookOpen, Search, Video, MessageSquareQuoteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/documentation/page";

export default function DocumentationIndex() {
    const breadcrumbs = [
        { title: 'Accueil', href: '/' },
        { title: 'Documentation', href: '#' },
    ];

    const cardLinks = [
        {
            title: "Guide d'utilisation",
            description: "Découvrez comment utiliser les fonctionnalités principales",
            icon: <BookOpen className="w-6 h-6" />,
            href: "#",
            color: "bg-blue-50 text-blue-600"
        },
        {
            title: "Tutoriels vidéo",
            description: "Apprenez en regardant nos guides pas à pas",
            icon: <Video className="w-6 h-6" />,
            href: "#",
            color: "bg-purple-50 text-purple-600"
        },
        {
            title: "FAQ",
            description: "Réponses aux questions fréquentes",
            icon: <MessageSquareQuoteIcon className="w-6 h-6" />,
            href: "#",
            color: "bg-green-50 text-green-600"
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Documentation - Logiciel de gestion de salon de coiffure" />
            
            <div className="space-y-8">
                {/* Hero section */}
                <div className="text-center max-w-3xl mx-auto py-8">
                    <h1 className="text-3xl font-bold tracking-tight mb-4">
                        Documentation du logiciel Coiff'Manager
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Tout ce dont vous avez besoin pour maîtriser notre solution de gestion pour salons de coiffure
                    </p>
                    
                    {/* Search bar */}
                    <div className="mt-6 relative max-w-xl mx-auto">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Rechercher dans la documentation..."
                        />
                    </div>
                </div>
                
                {/* Cards grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cardLinks.map((card, index) => (
                        <Link 
                            href={card.href} 
                            key={index}
                            className="group border rounded-lg p-6 hover:border-primary transition-colors"
                        >
                            <div className={`${card.color} w-12 h-12 rounded-full flex items-center justify-center mb-4`}>
                                {card.icon}
                            </div>
                            <h3 className="text-lg font-semibold mb-2 group-hover:text-primary">
                                {card.title}
                            </h3>
                            <p className="text-muted-foreground">
                                {card.description}
                            </p>
                        </Link>
                    ))}
                </div>
                
                {/* Getting started section */}
                <div className="bg-gray-50 rounded-lg p-6 mt-8">
                    <h2 className="text-xl font-semibold mb-4">Premiers pas</h2>
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">1</span>
                            <div>
                                <h3 className="font-medium">Configuration initiale</h3>
                                <p className="text-muted-foreground text-sm">
                                    Configurez votre salon, vos services et vos employés
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">2</span>
                            <div>
                                <h3 className="font-medium">Prise en main du calendrier</h3>
                                <p className="text-muted-foreground text-sm">
                                    Apprenez à gérer les rendez-vous et la disponibilité
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">3</span>
                            <div>
                                <h3 className="font-medium">Gestion des clients</h3>
                                <p className="text-muted-foreground text-sm">
                                    Créez et gérez vos fiches clients et historiques
                                </p>
                            </div>
                        </div>
                    </div>
                    <Button className="mt-6" variant="outline">
                        Voir le guide complet
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}