import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  Users, 
  Wifi, 
  Award,
  TrendingUp,
  AlertCircle,
  Plus,
  Settings,
  BarChart3,
  LogOut
} from "lucide-react";
import Logo from "@/components/Logo";
import PackagesAdmin from "./admin/PackagesAdmin";
import UsersAdmin from "./admin/UsersAdmin";
import AmbassadorsAdmin from "./admin/AmbassadorsAdmin";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useNavigate } from "react-router-dom";
import { signOut } from "@/lib/auth";
import { toast } from "sonner";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error("Erreur de déconnexion");
    } else {
      navigate('/');
    }
  };
  
  // Données simulées
  const stats = {
    todayRevenue: 45000,
    newUsers: 23,
    activeConnections: 18,
    ambassadorCommissions: 12000,
  };

  const salesData = [
    { day: "Lun", amount: 32000 },
    { day: "Mar", amount: 38000 },
    { day: "Mer", amount: 42000 },
    { day: "Jeu", amount: 35000 },
    { day: "Ven", amount: 48000 },
    { day: "Sam", amount: 52000 },
    { day: "Dim", amount: 45000 },
  ];

  const alerts = [
    { type: "warning", message: "2 routeurs offline" },
    { type: "info", message: "1 paiement en attente" },
  ];

  return (
    <ProtectedRoute requireAdmin>
      <div className="min-h-screen bg-gradient-wisdom">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo size="sm" />
              <nav className="hidden md:flex items-center gap-6">
                <a href="#dashboard" className="text-foreground font-semibold hover:text-primary transition-smooth">
                  Dashboard
                </a>
                <a href="#packages" className="text-muted-foreground hover:text-foreground transition-smooth">
                  Forfaits
                </a>
                <a href="#users" className="text-muted-foreground hover:text-foreground transition-smooth">
                  Utilisateurs
                </a>
                <a href="#ambassadors" className="text-muted-foreground hover:text-foreground transition-smooth">
                  Ambassadeurs
                </a>
              </nav>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <Settings size={20} />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-foreground hover:text-primary">
                <LogOut size={18} className="mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/10 border border-white/20">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="packages" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Forfaits
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="ambassadors" className="data-[state=active]:bg-primary data-[state=active]:text-white">
              Ambassadeurs
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-8">
            {/* Page Title */}
            <div className="flex items-center justify-between">
              <h1 className="text-white text-3xl md:text-4xl font-bold">Dashboard Administrateur</h1>
              <div className="text-white/70 text-sm">
                Dernière mise à jour : {new Date().toLocaleTimeString('fr-FR')}
              </div>
            </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 glass hover-scale shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                  <DollarSign className="text-secondary" size={24} />
                </div>
                <TrendingUp className="text-success" size={20} />
              </div>
              <div className="space-y-1">
                <p className="text-white/70 text-sm">Revenus du jour</p>
                <p className="text-white text-3xl font-bold">
                  {stats.todayRevenue.toLocaleString()}
                </p>
                <p className="text-white/60 text-xs">FCFA</p>
              </div>
            </Card>

            <Card className="p-6 glass hover-scale shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-violet-light/20 flex items-center justify-center">
                  <Users className="text-violet-light" size={24} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-white/70 text-sm">Nouveaux utilisateurs</p>
                <p className="text-white text-3xl font-bold">{stats.newUsers}</p>
                <p className="text-white/60 text-xs">Aujourd'hui</p>
              </div>
            </Card>

            <Card className="p-6 glass hover-scale shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-bright/20 flex items-center justify-center">
                  <Wifi className="text-emerald-bright" size={24} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-white/70 text-sm">Connexions actives</p>
                <p className="text-white text-3xl font-bold">{stats.activeConnections}</p>
                <p className="text-white/60 text-xs">En ligne maintenant</p>
              </div>
            </Card>

            <Card className="p-6 glass hover-scale shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-gold-warm/20 flex items-center justify-center">
                  <Award className="text-gold-warm" size={24} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-white/70 text-sm">Commissions ambassadeurs</p>
                <p className="text-white text-3xl font-bold">
                  {stats.ambassadorCommissions.toLocaleString()}
                </p>
                <p className="text-white/60 text-xs">FCFA</p>
              </div>
            </Card>
          </div>

          {/* Sales Chart & Alerts */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Sales Chart */}
            <Card className="lg:col-span-2 p-6 glass shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-xl font-bold">Ventes (7 derniers jours)</h2>
                <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
                  <BarChart3 size={16} className="mr-2" />
                  Exporter
                </Button>
              </div>
              
              <div className="h-64 flex items-end justify-between gap-2">
                {salesData.map((data, index) => {
                  const maxAmount = Math.max(...salesData.map(d => d.amount));
                  const height = (data.amount / maxAmount) * 100;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="text-white/70 text-xs font-semibold">
                        {(data.amount / 1000).toFixed(0)}k
                      </div>
                      <div
                        className="w-full bg-gradient-prosperity rounded-t-lg transition-all duration-500 hover:opacity-80"
                        style={{ height: `${height}%` }}
                      />
                      <div className="text-white/60 text-xs">{data.day}</div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Alerts & Quick Actions */}
            <div className="space-y-6">
              {/* Alerts */}
              <Card className="p-6 glass shadow-soft">
                <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
                  <AlertCircle size={20} className="text-secondary" />
                  Alertes
                </h3>
                <div className="space-y-3">
                  {alerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        alert.type === "warning" 
                          ? "bg-secondary/20 border border-secondary/30" 
                          : "bg-violet-light/20 border border-violet-light/30"
                      }`}
                    >
                      <p className="text-white text-sm">• {alert.message}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-6 glass shadow-soft">
                <h3 className="text-white text-lg font-bold mb-4">Actions rapides</h3>
                <div className="space-y-2">
                  <Button className="w-full justify-start bg-primary hover:bg-primary/90 text-white">
                    <Plus size={18} className="mr-2" />
                    Créer forfait
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-white/30 text-white hover:bg-white/10">
                    <Settings size={18} className="mr-2" />
                    Générer vouchers
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-white/30 text-white hover:bg-white/10">
                    <Users size={18} className="mr-2" />
                    Envoyer push
                  </Button>
                </div>
              </Card>
            </div>
          </div>
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages">
            <PackagesAdmin />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <UsersAdmin />
          </TabsContent>

          {/* Ambassadors Tab */}
          <TabsContent value="ambassadors">
            <AmbassadorsAdmin />
          </TabsContent>
        </Tabs>
      </main>
      </div>
    </ProtectedRoute>
  );
};

export default Admin;
