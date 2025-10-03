import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Award, TrendingUp, Users, DollarSign } from "lucide-react";

interface Ambassador {
  id: string;
  name: string;
  phone: string;
  code: string;
  status: "active" | "inactive" | "suspended";
  totalSales: number;
  commission: number;
  referrals: number;
  conversionRate: number;
  joinDate: string;
}

const AmbassadorsAdmin = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const ambassadors: Ambassador[] = [
    {
      id: "1",
      name: "Emmanuel Toko",
      phone: "+237 6XX XXX 101",
      code: "EMM2024",
      status: "active",
      totalSales: 450000,
      commission: 45000,
      referrals: 87,
      conversionRate: 68,
      joinDate: "Jan 2024",
    },
    {
      id: "2",
      name: "Grace Nkolo",
      phone: "+237 6XX XXX 102",
      code: "GRA2024",
      status: "active",
      totalSales: 320000,
      commission: 32000,
      referrals: 65,
      conversionRate: 72,
      joinDate: "Fév 2024",
    },
    {
      id: "3",
      name: "Patrick Essomba",
      phone: "+237 6XX XXX 103",
      code: "PAT2024",
      status: "active",
      totalSales: 280000,
      commission: 28000,
      referrals: 53,
      conversionRate: 65,
      joinDate: "Mar 2024",
    },
    {
      id: "4",
      name: "Christine Biya",
      phone: "+237 6XX XXX 104",
      code: "CHR2024",
      status: "inactive",
      totalSales: 50000,
      commission: 5000,
      referrals: 12,
      conversionRate: 45,
      joinDate: "Avr 2024",
    },
  ];

  const filteredAmbassadors = ambassadors.filter(amb =>
    amb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    amb.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    amb.phone.includes(searchTerm)
  );

  const stats = {
    total: ambassadors.length,
    active: ambassadors.filter(a => a.status === "active").length,
    totalCommissions: ambassadors.reduce((sum, a) => sum + a.commission, 0),
    totalSales: ambassadors.reduce((sum, a) => sum + a.totalSales, 0),
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      active: { variant: "default", label: "Actif" },
      inactive: { variant: "secondary", label: "Inactif" },
      suspended: { variant: "destructive", label: "Suspendu" },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white text-2xl font-bold">Gestion des Ambassadeurs</h2>
        <p className="text-white/60 text-sm">Suivez les performances de vos ambassadeurs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 glass">
          <div className="flex items-center gap-3">
            <Award className="text-gold-warm" size={24} />
            <div>
              <p className="text-white/70 text-sm">Total</p>
              <p className="text-white text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 glass">
          <div className="flex items-center gap-3">
            <Users className="text-emerald-bright" size={24} />
            <div>
              <p className="text-white/70 text-sm">Actifs</p>
              <p className="text-white text-2xl font-bold">{stats.active}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 glass">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-violet-light" size={24} />
            <div>
              <p className="text-white/70 text-sm">Ventes totales</p>
              <p className="text-white text-lg font-bold">{(stats.totalSales / 1000).toFixed(0)}k FCFA</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 glass">
          <div className="flex items-center gap-3">
            <DollarSign className="text-secondary" size={24} />
            <div>
              <p className="text-white/70 text-sm">Commissions</p>
              <p className="text-white text-lg font-bold">{(stats.totalCommissions / 1000).toFixed(0)}k FCFA</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4 glass">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={20} />
          <Input
            placeholder="Rechercher par nom, code ou téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
          />
        </div>
      </Card>

      {/* Ambassadors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAmbassadors.map((ambassador) => (
          <Card key={ambassador.id} className="p-6 glass hover-scale shadow-soft">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gold-warm/20 flex items-center justify-center">
                  <Award className="text-gold-warm" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold">{ambassador.name}</h3>
                  <p className="text-white/60 text-sm">{ambassador.phone}</p>
                </div>
              </div>
              {getStatusBadge(ambassador.status)}
            </div>

            {/* Code ambassadeur */}
            <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-white/60 text-xs mb-1">Code ambassadeur</p>
              <p className="text-white font-mono font-bold text-lg">{ambassador.code}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-white/60 text-xs mb-1">Ventes totales</p>
                <p className="text-secondary font-bold text-lg">
                  {(ambassador.totalSales / 1000).toFixed(0)}k FCFA
                </p>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-1">Commissions</p>
                <p className="text-gold-warm font-bold text-lg">
                  {(ambassador.commission / 1000).toFixed(0)}k FCFA
                </p>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-1">Parrainages</p>
                <p className="text-white font-bold">{ambassador.referrals}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-1">Conversion</p>
                <p className="text-emerald-bright font-bold">{ambassador.conversionRate}%</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-white/60 text-xs">Membre depuis {ambassador.joinDate}</span>
              <Button
                variant="outline"
                size="sm"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Détails
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AmbassadorsAdmin;
