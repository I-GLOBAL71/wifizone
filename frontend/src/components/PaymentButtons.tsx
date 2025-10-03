import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

// Define the provider type
interface PaymentProvider {
  id: string;
  name: string;
  publicKey?: string;
}

interface PaymentButtonsProps {
  providers: PaymentProvider[];
  amount: number;
  sessionId: string;
  customer: {
    email: string;
    name: string;
    phone_number: string;
  };
}

// Load the Flutterwave script
const useFlutterwaveScript = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);
};

export default function PaymentButtons({ providers, amount, sessionId, customer }: PaymentButtonsProps) {
  useFlutterwaveScript();
  const { toast } = useToast();

  const handlePayment = (provider: PaymentProvider) => {
    if (provider.id === 'flutterwave' && provider.publicKey) {
      handleFlutterwavePayment(provider.publicKey);
    } else if (provider.id === 'campay') {
      handleCampayPayment();
    }
  };

  const handleFlutterwavePayment = (publicKey: string) => {
    if (window.FlutterwaveCheckout) {
      window.FlutterwaveCheckout({
        public_key: publicKey,
        tx_ref: sessionId,
        amount: amount,
        currency: "XAF",
        payment_options: "card, mobilemoney, ussd",
        customer: {
          email: customer.email || 'customer@example.com',
          phone_number: customer.phone_number || '000000000',
          name: customer.name || 'Anonymous Customer',
        },
        customizations: {
          title: "Paiement Forfait Internet",
          description: `Paiement pour la session ${sessionId}`,
          logo: "https://www.votre-logo.com/logo.png",
        },
        callback: function (data) {
          console.log("Flutterwave callback:", data);
          if (data.status === "successful") {
            // The backend webhook will handle the rest.
            // We can redirect to a pending/success page.
            window.location.href = `/success?session_id=${sessionId}&amount=${amount}`;
          } else {
            toast({
              title: "Paiement Échoué",
              description: "Votre paiement n'a pas pu être complété.",
              variant: "destructive",
            });
          }
        },
        onclose: function() {
          console.log("Flutterwave modal closed.");
        },
      });
    } else {
      toast({
        title: "Erreur",
        description: "Le script de paiement Flutterwave n'a pas pu être chargé.",
        variant: "destructive",
      });
    }
  };

  const handleCampayPayment = () => {
    // TODO: Implement Campay payment logic
    toast({ title: "Info", description: "Le paiement Campay sera bientôt disponible." });
  };

  return (
    <div className="grid gap-4">
      {providers.map((provider) => (
        <Button key={provider.id} className="w-full" onClick={() => handlePayment(provider)}>
          Payer avec {provider.name}
        </Button>
      ))}
    </div>
  );
}

// Define FlutterwaveCheckout function on the window object
declare global {
  interface Window {
    FlutterwaveCheckout: (options: any) => void;
  }
}