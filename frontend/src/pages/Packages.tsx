import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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

export default function PackagesPage() {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTariffs = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3000/tariffs'); // Adjust URL if needed
        setTariffs(response.data);
        setError(null);
      } catch (err) {
        setError('Impossible de charger les forfaits. Veuillez réessayer.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTariffs();
  }, []);

  const handlePurchase = async (tariffId: string) => {
    try {
      // In a real app, you might pass a user_id if the user is logged in
      const response = await axios.post('http://localhost:3000/create-session', { tariff_id: tariffId });
      const { session_id, amount } = response.data;
      
      // Redirect to the payment page, passing session info
      // This is a placeholder; actual redirection would be to Campay's URL
      navigate(`/payment?session_id=${session_id}&amount=${amount}`);

    } catch (err) {
      console.error('Failed to create purchase session:', err);
      setError('La création de la session de paiement a échoué.');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-8">Choisissez votre forfait</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border-2 rounded-lg p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-10 w-1/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 p-8">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-8">Choisissez votre forfait</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
    </div>
  );
}
