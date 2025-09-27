import { Auth } from '@/types';
import Form from './Form';

export default function Create({ auth, succursales }: { auth: Auth; succursales: Array<{ id: string; name: string }> }) {
    return <Form agent={null} auth={auth} succursales={succursales} />;
}
