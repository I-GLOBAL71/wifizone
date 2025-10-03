import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from 'react';
import axios from 'axios';
import PaymentButtons from '@/components/PaymentButtons'; // Import the new component
import { useAuth } from '@/hooks/use-auth'; // Assuming you have an auth hook

// Define the provider type
interface PaymentProvider {
  id: string;
  name: string;
  publicKey?: string;
}

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth(); // Get user from auth context

  const sessionId = searchParams.get('session_id');
  const initialAmount = Number(searchParams.get('amount'));

  const [referralCode, setReferralCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(initialAmount);
  const [isApplyingCode, setIsApplyingCode] = useState(false);
  const [paymentProviders, setPaymentProviders] = useState<PaymentProvider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);

  useEffect(() => {
    if (!sessionId || !initialAmount) {
      navigate('/packages');
      return;
    }
    setFinalAmount(initialAmount - discount);

    const fetchProviders = async () => {
      try {
        setLoadingProviders(true);
        const response = await axios.get('http://localhost:3000/payment-providers');
        setPaymentProviders(response.data);
      } catch (error) {
        console.error("Failed to fetch payment providers:", error);
        toast({ title: "Erreur", description: "Impossible de charger les options de paiement." });
      } finally {
        setLoadingProviders(false);
      }
    };

    fetchProviders();
  }, [sessionId, initialAmount, discount, navigate, toast]);

  const handleApplyCode = async () => {
    if (!referralCode) {
      toast({ title: "Erreur", description: "Veuillez entrer un code.", variant: "destructive" });
      return;
    }
    setIsApplyingCode(true);
    try {
      const response = await axios.post('http://localhost:3000/apply-referral', {
        referral_code: referralCode,
        session_id: sessionId,
      });
      const { discount_amount } = response.data;
      setDiscount(discount_amount);
      toast({ title: "Succès", description: `Une réduction de ${discount_amount} XAF a été appliquée.` });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({ title: "Code Invalide", description: error.response?.data || "Ce code de parrainage n'est pas valide.", variant: "destructive" });
      }
    } finally {
      setIsApplyingCode(false);
    }
  };

  return (
    <div className="container flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Finaliser le paiement</CardTitle>
          <CardDescription>
            Vous pouvez appliquer un code de parrainage pour obtenir une réduction.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="rounded-md border">
            <div className="p-4 flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Sous-total</span>
                <span className="font-medium">{initialAmount.toLocaleString()} XAF</span>
            </div>
            {discount > 0 && (
                <div className="p-4 border-t flex justify-between items-baseline text-green-600">
                    <span className="text-sm text-muted-foreground">Réduction</span>
                    <span className="font-medium">- {discount.toLocaleString()} XAF</span>
                </div>
            )}
            <div className="p-4 border-t flex justify-between items-baseline">
                <span className="text-lg font-bold">Total à payer</span>
                <span className="text-2xl font-bold">{finalAmount.toLocaleString()} XAF</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-4">
          {loadingProviders ? (
            <p>Chargement des options de paiement...</p>
          ) : (
            <PaymentButtons
              providers={paymentProviders}
              amount={finalAmount}
              sessionId={sessionId!}
              customer={{
                email: user?.email || 'default-customer@example.com',
                name: user?.user_metadata?.full_name || 'Guest User',
                phone_number: user?.phone || 'N/A',
              }}
            />
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
