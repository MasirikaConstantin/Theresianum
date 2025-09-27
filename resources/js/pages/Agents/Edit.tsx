import Form from './Form';
import { Auth } from '@/types';
import { Agent } from '@/types';

export default function Edit({ auth, agent, succursales }: { auth: Auth; agent: Agent; succursales: Array<{ id: string; name: string }> }) {
    return <Form agent={agent} auth={auth} succursales={succursales} />;
}   