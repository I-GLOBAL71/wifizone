import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Award, Users, DollarSign } from "lucide-react";
import axios from 'axios';

interface Ambassador {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  referral_code: string;
  balance: number;
  created_at: string;
}

const AmbassadorsAdmin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAmbassadors = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3000/ambassadors');
        setAmbassadors(response.data);
      } catch (error) {
        console.error("Failed to fetch ambassadors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAmbassadors();
  }, []);

  const handleNavigateToDetails = (userId: string) => {
    navigate(`/admin/ambassador/${userId}`);
  };

  const filteredAmbassadors = ambassadors.filter(amb =>
    amb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    amb.referral_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (amb.phone && amb.phone.includes(searchTerm)) ||
    (amb.email && amb.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: ambassadors.length,
    totalCommissions: ambassadors.reduce((sum, a) => sum + a.balance, 0),
  };

  if (loading) {
    return <div>Chargement des ambassadeurs...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gestion des Ambassadeurs</h2>
        <p className="text-muted-foreground text-sm">Suivez les performances de vos ambassadeurs</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ambassadeurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commissions Totales (Solde)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.totalCommissions).toLocaleString()} FCFA</div>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Nouveaux Ambassadeurs (Mois)</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">N/A</div>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Rechercher par nom, code, téléphone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredAmbassadors.map((ambassador) => (
          <Card key={ambassador.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-bold">{ambassador.name}</h3>
                  <p className="text-muted-foreground text-sm">{ambassador.email || ambassador.phone || "N/A"}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-muted-foreground text-xs mb-1">Code ambassadeur</p>
                <p className="font-mono font-bold text-lg">{ambassador.referral_code}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Solde</p>
                  <p className="font-bold text-lg text-primary">{ambassador.balance.toLocaleString()} FCFA</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Parrainages</p>
                  <p className="font-bold">N/A</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-muted-foreground text-xs">Membre depuis {new Date(ambassador.created_at).toLocaleDateString()}</span>
                <Button variant="outline" size="sm" onClick={() => handleNavigateToDetails(ambassador.user_id)}>Détails</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AmbassadorsAdmin;
