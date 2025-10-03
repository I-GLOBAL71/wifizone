import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Users, UserCheck, UserX } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

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

type Purchase = {
  id: string;
  amount: number;
  created_at: string;
  tariffs: { name: string } | null;
};

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  last_seen: string | null;
  users: { email: string } | null;
  purchases: Purchase[];
};

const fetchUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      phone,
      last_seen,
      users ( email ),
      purchases (
        id,
        amount,
        created_at,
        tariffs ( name )
      )
    `)
    .returns<Profile[]>();

  if (error) {
    throw new Error(error.message);
  }

  return data?.map((profile) => {
    const totalSpent = profile.purchases.reduce((acc, p) => acc + p.amount, 0);
    const lastPurchase = profile.purchases.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    
    const lastSeen = profile.last_seen ? new Date(profile.last_seen) : null;
    let status: "active" | "inactive" | "blocked" = "inactive";
    if (lastSeen) {
      const diff = new Date().getTime() - lastSeen.getTime();
      const days = diff / (1000 * 3600 * 24);
      if (days < 7) {
        status = "active";
      }
    }

    return {
      id: profile.id,
      name: profile.full_name || 'N/A',
      phone: profile.phone || 'N/A',
      email: profile.users?.email,
      status: status,
      currentPackage: lastPurchase?.tariffs?.name,
      totalSpent: totalSpent,
      lastConnection: profile.last_seen ? new Date(profile.last_seen).toLocaleDateString() : 'N/A',
    };
  }) || [];
};

const UsersAdmin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

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
      <div>
        <h2 className="text-2xl font-bold">Gestion des Utilisateurs</h2>
        <p className="text-muted-foreground text-sm">Gérez et suivez tous vos utilisateurs</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactifs</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bloqués</CardTitle>
            <UserX className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.blocked}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Rechercher par nom ou téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant={statusFilter === "all" ? "default" : "outline"} onClick={() => setStatusFilter("all")}>Tous</Button>
              <Button variant={statusFilter === "active" ? "default" : "outline"} onClick={() => setStatusFilter("active")}>Actifs</Button>
              <Button variant={statusFilter === "inactive" ? "default" : "outline"} onClick={() => setStatusFilter("inactive")}>Inactifs</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead className="hidden sm:table-cell">Contact</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="hidden md:table-cell">Forfait</TableHead>
                <TableHead className="text-right hidden lg:table-cell">Dépenses</TableHead>
                <TableHead className="hidden md:table-cell">Dernière connexion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">Chargement...</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground sm:hidden">{user.phone}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div>{user.phone}</div>
                      {user.email && <div className="text-xs text-muted-foreground">{user.email}</div>}
                    </TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {user.currentPackage ? (
                        <Badge variant="outline">{user.currentPackage}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right hidden lg:table-cell">{user.totalSpent.toLocaleString()} FCFA</TableCell>
                    <TableCell className="hidden md:table-cell">{user.lastConnection}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default UsersAdmin;
