import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Users, UserCheck, UserX } from "lucide-react";

interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: "active" | "inactive" | "blocked";
  currentPackage?: string;
  totalSpent: number;
  lastConnection: string;
}

const UsersAdmin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const users: User[] = [
    {
      id: "1",
      name: "Jean Dupont",
      phone: "+237 6XX XXX 001",
      email: "jean@example.com",
      status: "active",
      currentPackage: "PREMIUM",
      totalSpent: 15000,
      lastConnection: "Il y a 5 min",
    },
    {
      id: "2",
      name: "Marie Kouam",
      phone: "+237 6XX XXX 002",
      status: "active",
      currentPackage: "POPULAIRE",
      totalSpent: 8000,
      lastConnection: "Il y a 1h",
    },
    {
      id: "3",
      name: "Paul Kamdem",
      phone: "+237 6XX XXX 003",
      status: "inactive",
      totalSpent: 3000,
      lastConnection: "Il y a 2 jours",
    },
    {
      id: "4",
      name: "Sophie Ngo",
      phone: "+237 6XX XXX 004",
      email: "sophie@example.com",
      status: "active",
      currentPackage: "RAPIDE",
      totalSpent: 25000,
      lastConnection: "Il y a 30 min",
    },
    {
      id: "5",
      name: "David Mballa",
      phone: "+237 6XX XXX 005",
      status: "blocked",
      totalSpent: 500,
      lastConnection: "Il y a 1 semaine",
    },
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === "active").length,
    inactive: users.filter(u => u.status === "inactive").length,
    blocked: users.filter(u => u.status === "blocked").length,
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      active: { variant: "default", label: "Actif" },
      inactive: { variant: "secondary", label: "Inactif" },
      blocked: { variant: "destructive", label: "Bloqué" },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-white text-2xl font-bold">Gestion des Utilisateurs</h2>
        <p className="text-white/60 text-sm">Gérez et suivez tous vos utilisateurs</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 glass">
          <div className="flex items-center gap-3">
            <Users className="text-violet-light" size={24} />
            <div>
              <p className="text-white/70 text-sm">Total</p>
              <p className="text-white text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 glass">
          <div className="flex items-center gap-3">
            <UserCheck className="text-emerald-bright" size={24} />
            <div>
              <p className="text-white/70 text-sm">Actifs</p>
              <p className="text-white text-2xl font-bold">{stats.active}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 glass">
          <div className="flex items-center gap-3">
            <UserX className="text-gold-warm" size={24} />
            <div>
              <p className="text-white/70 text-sm">Inactifs</p>
              <p className="text-white text-2xl font-bold">{stats.inactive}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 glass">
          <div className="flex items-center gap-3">
            <UserX className="text-red-400" size={24} />
            <div>
              <p className="text-white/70 text-sm">Bloqués</p>
              <p className="text-white text-2xl font-bold">{stats.blocked}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="p-4 glass">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" size={20} />
            <Input
              placeholder="Rechercher par nom ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
              className={statusFilter === "all" ? "" : "border-white/30 text-white hover:bg-white/10"}
            >
              Tous
            </Button>
            <Button
              variant={statusFilter === "active" ? "default" : "outline"}
              onClick={() => setStatusFilter("active")}
              className={statusFilter === "active" ? "" : "border-white/30 text-white hover:bg-white/10"}
            >
              Actifs
            </Button>
            <Button
              variant={statusFilter === "inactive" ? "default" : "outline"}
              onClick={() => setStatusFilter("inactive")}
              className={statusFilter === "inactive" ? "" : "border-white/30 text-white hover:bg-white/10"}
            >
              Inactifs
            </Button>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left p-4 text-white/70 font-semibold">Utilisateur</th>
                <th className="text-left p-4 text-white/70 font-semibold">Contact</th>
                <th className="text-left p-4 text-white/70 font-semibold">Statut</th>
                <th className="text-left p-4 text-white/70 font-semibold">Forfait actuel</th>
                <th className="text-right p-4 text-white/70 font-semibold">Dépenses totales</th>
                <th className="text-left p-4 text-white/70 font-semibold">Dernière connexion</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <span className="text-white font-semibold">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-white text-sm">{user.phone}</div>
                    {user.email && <div className="text-white/60 text-xs">{user.email}</div>}
                  </td>
                  <td className="p-4">{getStatusBadge(user.status)}</td>
                  <td className="p-4">
                    {user.currentPackage ? (
                      <Badge className="bg-primary/20 text-primary border-primary/30">
                        {user.currentPackage}
                      </Badge>
                    ) : (
                      <span className="text-white/40">-</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <span className="text-secondary font-bold">{user.totalSpent.toLocaleString()} FCFA</span>
                  </td>
                  <td className="p-4">
                    <span className="text-white/60 text-sm">{user.lastConnection}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default UsersAdmin;
