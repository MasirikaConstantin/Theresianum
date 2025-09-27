// Définir les types TypeScript
interface Pointage {
    id: number;
    date: string;
    statut: string;
    // ... autres champs
  }
  
  interface Agent {
    id: number;
    nom: string;
    postnom: string;
    prenom: string;
    pointages: Pointage[];
    // ... autres champs
  }
  
  // Fonction pour calculer les stats
  const calculateStats = (agent: Agent) => {
    const stats = {
      present: 0,
      absent: 0,
      conge: 0
    };
  
    agent.pointages.forEach(pointage => {
      if (pointage.statut === 'present' || pointage.statut === 'congé') {
        stats.present++;
      } else if (pointage.statut === 'absent') {
        stats.absent++;
      }
      // Pour le décompte séparé des congés si besoin
      if (pointage.statut === 'congé') {
        stats.conge++;
      }
    });
  
    return {
      ...stats,
      total: agent.pointages.length,
      tauxPresence: agent.pointages.length > 0 
        ? Math.round((stats.present / agent.pointages.length) * 100) 
        : 0
    };
  };
  
  // Utilisation dans votre composant
  function AgentStats({ agent }: { agent: Agent }) {
    const stats = calculateStats(agent);
  
    return (
      <div className="border p-4 rounded-lg">
        <h3 className="font-bold text-lg">
          {agent.nom} {agent.prenom}
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <p className="text-sm">Présences</p>
            <p className=" font-bold">{stats.present}</p>
          </div>
          
          <div>
            <p className="text-sm ">Absences</p>
            <p className=" font-bold">{stats.absent}</p>
          </div>
          
          <div>
            <p className="text-sm ">Congés</p>
            <p className=" font-bold">{stats.conge}</p>
          </div>
        </div>
      </div>
    );
  }
  
  export default AgentStats;