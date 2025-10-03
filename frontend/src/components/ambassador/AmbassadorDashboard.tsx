import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Share2, Users, BarChart } from "lucide-react";
import { StatCard } from "./StatCard";

interface AmbassadorData {
  id: string;
  user_id: string;
  name: string;
  referral_code: string;
  balance: number;
  stats: {
    signups: number;
    clicks: number;
  };
}

interface AmbassadorDashboardProps {
    data: AmbassadorData;
    onCopy: () => void;
    onShare: () => void;
}

import { useEffect } from 'react';

export const AmbassadorDashboard = ({ data, onCopy, onShare }: AmbassadorDashboardProps) => {
    useEffect(() => {
        console.log('[AmbassadorDashboard] Component has mounted with data:', data);
    }, [data]);

    return (
      <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 md:p-8 w-full max-w-7xl mx-auto">
        <header className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Tableau de Bord Ambassadeur</h1>
                <p className="text-muted-foreground">Bienvenue, {data.name}!</p>
            </div>
            <Button onClick={() => supabase.auth.signOut()} variant="ghost">
                Déconnexion
            </Button>
        </header>
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
                title="Solde Actuel"
                value={`${data.balance.toLocaleString()} XAF`}
                subtitle="Disponible pour retrait"
                icon={<span className="text-muted-foreground">XAF</span>}
            />
            <StatCard
                title="Parrainages Réussis"
                value={`+${data.stats.signups}`}
                subtitle="Nouveaux utilisateurs via votre lien"
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
            <StatCard
                title="Clics sur votre lien"
                value={`+${data.stats.clicks}`}
                subtitle="Personnes intéressées"
                icon={<BarChart className="h-4 w-4 text-muted-foreground" />}
            />
        </section>
        <section className="grid gap-6 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
                <CardTitle className="text-lg">Votre Lien de Parrainage Unique</CardTitle>
                <CardDescription>Partagez ce lien. Chaque fois que quelqu'un achète un forfait, vous gagnez une commission.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                <p className="text-sm font-mono text-muted-foreground flex-grow overflow-x-auto">
                    {`${import.meta.env.VITE_API_URL}/r/${data.referral_code}`}
                </p>
                <Button onClick={onCopy} variant="ghost" size="icon">
                    <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={onShare} size="sm" className="gap-2 w-full mt-4">
                  <Share2 className="h-4 w-4" /> Partager mon lien
              </Button>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Retirer vos Gains</CardTitle>
              <CardDescription>Demandez un paiement de votre solde disponible via Mobile Money.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" disabled>Demander un retrait</Button>
               <p className="text-xs text-muted-foreground mt-2">Le solde minimum pour un retrait est de 5,000 XAF.</p>
            </CardContent>
          </Card>
        </section>
      </div>
    );
};