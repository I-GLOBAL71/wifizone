import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Wifi, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Package {
  id: string;
  name: string;
  speed: string;
  duration: string;
  price: number;
  active: boolean;
}

const PackagesAdmin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [packages, setPackages] = useState<Package[]>([
    { id: "1", name: "RAPIDE", speed: "5 Mbps", duration: "1h", price: 500, active: true },
    { id: "2", name: "POPULAIRE", speed: "10 Mbps", duration: "3h", price: 1000, active: true },
    { id: "3", name: "PREMIUM", speed: "20 Mbps", duration: "24h", price: 3000, active: true },
    { id: "4", name: "BUSINESS", speed: "50 Mbps", duration: "7j", price: 15000, active: true },
    { id: "5", name: "ÉTUDIANT", speed: "8 Mbps", duration: "5h", price: 1500, active: false },
  ]);

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const togglePackageStatus = (id: string) => {
    setPackages(packages.map(pkg =>
      pkg.id === id ? { ...pkg, active: !pkg.active } : pkg
    ));
    toast({
      title: "Statut modifié",
      description: "Le statut du forfait a été mis à jour",
    });
  };

  const deletePackage = (id: string) => {
    setPackages(packages.filter(pkg => pkg.id !== id));
    toast({
      title: "Forfait supprimé",
      description: "Le forfait a été supprimé avec succès",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-white text-2xl font-bold">Gestion des Forfaits</h2>
          <p className="text-white/60 text-sm">Créez et gérez vos forfaits WiFi</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white">
          <Plus size={20} className="mr-2" />
          Nouveau forfait
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4 glass">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={20} />
          <Input
            placeholder="Rechercher un forfait..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
          />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 glass">
          <p className="text-white/70 text-sm">Total forfaits</p>
          <p className="text-white text-2xl font-bold">{packages.length}</p>
        </Card>
        <Card className="p-4 glass">
          <p className="text-white/70 text-sm">Forfaits actifs</p>
          <p className="text-white text-2xl font-bold">{packages.filter(p => p.active).length}</p>
        </Card>
        <Card className="p-4 glass">
          <p className="text-white/70 text-sm">Forfaits inactifs</p>
          <p className="text-white text-2xl font-bold">{packages.filter(p => !p.active).length}</p>
        </Card>
      </div>

      {/* Packages List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPackages.map((pkg) => (
          <Card key={pkg.id} className="p-6 glass hover-scale shadow-soft">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Wifi className="text-primary" size={24} />
              </div>
              <Badge variant={pkg.active ? "default" : "secondary"}>
                {pkg.active ? "Actif" : "Inactif"}
              </Badge>
            </div>

            <h3 className="text-white text-xl font-bold mb-2">{pkg.name}</h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Vitesse</span>
                <span className="text-white font-semibold">{pkg.speed}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Durée</span>
                <span className="text-white font-semibold">{pkg.duration}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Prix</span>
                <span className="text-secondary font-bold">{pkg.price.toLocaleString()} FCFA</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-white/30 text-white hover:bg-white/10"
                onClick={() => togglePackageStatus(pkg.id)}
              >
                {pkg.active ? "Désactiver" : "Activer"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
              >
                <Edit size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:bg-red-400/10"
                onClick={() => deletePackage(pkg.id)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PackagesAdmin;
