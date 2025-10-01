import { MonitorCog } from "lucide-react";
import { Link } from "@inertiajs/react";
const NotFound = () => {

  return (
    <>
    <div className="flex min-h-screen items-center justify-center bg-gradient-secondary">
      <div className="text-center">
        <h1 className="mb-4 text-8xl font-bold text-red-500">404</h1>
        <p className="mb-4 text-xl dark:text-gray-100 text-gray-500 ">Oops! Page non trouvée</p>
        <Link href={route('home')} className="text-blue-500 underline hover:text-blue-700 dark:text-blue-400">
          Revenir à la page d'accueil
        </Link>

        <blockquote className="mt-6 border-l-2 pl-6 italic">
          une erreur est survenue veuillez contacter le support
    </blockquote>

      </div>
    <MonitorCog className="h-12 w-12 text-primary" />

    </div>
    </>
  );
};

export default NotFound;
