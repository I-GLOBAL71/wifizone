import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Copy } from "lucide-react";
import { useToast } from '@/components/ui/use-toast';

interface AmbassadorData {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  referral_code: string;
  balance: number;
  stats: {
    signups: number;
    clicks: number;
  };
}

export default function AmbassadorAdminPage() {
  const [data, setData] = useState<AmbassadorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchAmbassadorData = async () => {
      if (!id) {
        setError("ID de l'ambassadeur non trouvé dans l'URL.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/ambassador/${id}`);
        setData(response.data);
        setError(null);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setError("Cet utilisateur n'est pas un ambassadeur.");
        } else {
          setError("Impossible de charger les données de l'ambassadeur.");
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAmbassadorData();
  }, [id]);

  const copyToClipboard = () => {
    if (data?.referral_code) {
      const referralLink = `http://hotspot.local/r/${data.referral_code}`;
      navigator.clipboard.writeText(referralLink);
      toast({
        title: "Copié!",
        description: "Le lien de parrainage a été copié dans le presse-papiers.",
      });
    }
  };

  if (loading) {
    return <div className="text-center p-8">Chargement des détails de l'ambassadeur...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-4">{error}</p>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center p-8">Aucune donnée d'ambassadeur trouvée.</div>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <h2 className="text-2xl font-bold">Détails de l'Ambassadeur: {data.name}</h2>
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Solde</CardTitle>
              <span className="text-muted-foreground">XAF</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.balance.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inscriptions</CardTitle>
              <span className="text-muted-foreground">Utilisateurs</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{data.stats.signups}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clics</CardTitle>
              <span className="text-muted-foreground">Total</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{data.stats.clicks}</div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Lien de parrainage</CardTitle>
                <CardDescription>Lien de parrainage de l'ambassadeur.</CardDescription>
              </div>
              <Button onClick={copyToClipboard} size="sm" className="ml-auto gap-1">
                Copier
                <Copy className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-mono p-4 bg-muted rounded-md">
                http://hotspot.local/r/{data.referral_code}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Gérer le compte de l'ambassadeur.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button size="sm" variant="outline">Voir les parrainages</Button>
              <Button size="sm" variant="destructive">Désactiver le compte</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}