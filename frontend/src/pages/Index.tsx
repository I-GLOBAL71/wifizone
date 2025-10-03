import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Skeleton } from '@/components/ui/skeleton';
import TariffCard from '@/components/TariffCard'; // Import the new component

// Define the Tariff type
interface Tariff {
  id: string;
  name: string;
  data_bytes: number;
  duration_seconds: number;
  price_cfa: number;
  speed_limit: string | null;
}

export default function IndexPage() {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [columns, setColumns] = useState(2); // Default to 2 columns
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('IndexPage: Fetching data...');
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.error('IndexPage: No active session found.');
          throw new Error("No active session");
        }
        console.log('IndexPage: Session found.');

        const [tariffsResult, settingsResult] = await Promise.all([
          supabase.functions.invoke('tariffs', {
            headers: { 'Authorization': `Bearer ${session.access_token}` }
          }),
          supabase.functions.invoke('settings/get-setting', {
            body: { key: 'columns' },
            headers: { 'Authorization': `Bearer ${session.access_token}` }
          })
        ]);

        if (tariffsResult.error) throw tariffsResult.error;
        if (settingsResult.error) throw settingsResult.error;

        console.log('IndexPage: Tariffs response:', tariffsResult.data);
        console.log('IndexPage: Settings response:', settingsResult.data);

        setTariffs(tariffsResult.data);
        if (settingsResult.data && settingsResult.data.value) {
          console.log('IndexPage: Setting columns to:', settingsResult.data.value);
          setColumns(parseInt(settingsResult.data.value, 10));
        }
        setError(null);
        console.log('IndexPage: Data fetching successful.');
      } catch (err) {
        console.error('IndexPage: Error fetching data:', err);
        setError('Impossible de charger les données. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePurchase = async (tariffId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/purchase`, { tariff_id: tariffId }, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      const { session_id, amount } = response.data;
      navigate(`/payment?session_id=${session_id}&amount=${amount}`);
    } catch (err) {
      console.error('Failed to create purchase session:', err);
      setError('La création de la session de paiement a échoué.');
    }
  };

  return (
    <div className="container mx-auto p-4 overflow-x-hidden">
        <div className="flex flex-col space-y-2 text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Bienvenue sur notre réseau Wi-Fi
          </h1>
          <p className="text-sm text-muted-foreground">
            Connectez-vous en quelques clics. Choisissez un forfait pour commencer.
          </p>
        </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="border-2 rounded-lg p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-10 w-1/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      )}

      {error && <div className="text-center text-red-500 p-8">{error}</div>}

      {!loading && !error && (
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns} gap-4 sm:gap-8`}>
          {tariffs.map((tariff, index) => {
            const packageThemes = [
                { bg: "bg-card", text: "text-card-foreground", border: "border-transparent" },
                { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-900 dark:text-blue-200", border: "border-blue-200 dark:border-blue-800" },
                { bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-900 dark:text-green-200", border: "border-green-200 dark:border-green-800" },
                { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-900 dark:text-purple-200", border: "border-purple-200 dark:border-purple-800" },
                { bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-900 dark:text-orange-200", border: "border-orange-200 dark:border-orange-800" },
                { bg: "bg-pink-50 dark:bg-pink-900/20", text: "text-pink-900 dark:text-pink-200", border: "border-pink-200 dark:border-pink-800" },
            ];
            const theme = packageThemes[index % packageThemes.length];

            return (
              <TariffCard
                key={tariff.id}
                tariff={tariff}
                onPurchase={handlePurchase}
                theme={theme}
              />
            );
          })}
        </div>
      )}

      <p className="px-8 text-center text-sm text-muted-foreground mt-8">
        En cliquant sur continuer, vous acceptez nos{" "}
        <Link
          to="/terms"
          className="underline underline-offset-4 hover:text-primary"
        >
          Conditions d'utilisation
        </Link>
        .
      </p>
    </div>
  );
}
