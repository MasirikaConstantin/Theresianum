import { ReactNode } from 'react';
import { Head, Link } from '@inertiajs/react';

interface GuestLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function GuestLayout({ children, title }: GuestLayoutProps) {
  return (
    <div className="min-h-screen bg-accent">
      <Head>
        <title>{title || 'Prendre Rendez-vous'}</title>
        <meta name="description" content="Prenez rendez-vous dans notre salon" />
      </Head>

      <div className="navbar bg-base-100 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex-1">
            <a href="/" className="btn btn-ghost normal-case text-xl">
              <span className="text-primary">Bella Hair</span>Makeup
            </a>
          </div>
          <div className="flex-none">
            <Link href="#" className="btn btn-outline btn-sm" >
              Espace Client
            </Link>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">{children}</main>

      <footer className="footer footer-center p-10 bg-primary text-base-100">
        <div>
          <p className="font-bold">
            Bella Hair <br />Prenez rendez-vous en ligne facilement
          </p>
          <p>Copyright © {new Date().getFullYear()} - Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
}