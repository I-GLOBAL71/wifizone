import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CreditCard } from "lucide-react";
import BackgroundEffects from "@/components/BackgroundEffects";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

// Logos des opérateurs (en SVG ou images)
const operators = [
  { id: "mtn", name: "MTN Mobile Money", color: "bg-[#FFCC00]", logo: "🟡" },
  { id: "orange", name: "Orange Money", color: "bg-[#FF6600]", logo: "🟠" },
  { id: "express", name: "Express Union", color: "bg-[#0066CC]", logo: "🔵" },
];

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const packageId = location.state?.packageId || "populaire";

  const [phoneNumber, setPhoneNumber] = useState("+237 ");
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Données du forfait sélectionné
  const packageData = {
    rapide: { name: "Rapide", volume: "500 Mo", duration: "24 heures", price: 500 },
    populaire: { name: "Populaire", volume: "1 Go", duration: "24 heures", price: 1000 },
    premium: { name: "Premium", volume: "3 Go", duration: "7 jours", price: 2500 },
  }[packageId] || { name: "Populaire", volume: "1 Go", duration: "24 heures", price: 1000 };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Garder le préfixe +237
    if (!value.startsWith("+237 ")) {
      value = "+237 ";
    }
    
    // Retirer tout sauf les chiffres après le préfixe
    const numbers = value.substring(5).replace(/\D/g, "");
    
    // Limiter à 9 chiffres
    if (numbers.length <= 9) {
      setPhoneNumber("+237 " + numbers);
    }
  };

  const handlePayment = async () => {
    // Validation
    if (phoneNumber.length < 14) {
      toast.error("Veuillez entrer un numéro valide");
      return;
    }

    if (!selectedOperator) {
      toast.error("Veuillez sélectionner un opérateur");
      return;
    }

    setIsProcessing(true);

    // Simulation de paiement
    toast.info("Connexion à Campay...");
    
    setTimeout(() => {
      setIsProcessing(false);
      navigate("/success", { state: { packageData } });
    }, 2000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundEffects />

      <main className="relative z-10 min-h-screen p-4 md:p-8">
        {/* Header */}
        <div className="max-w-2xl mx-auto mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/packages")}
            className="text-white hover:bg-white/10 transition-smooth"
          >
            <ArrowLeft className="mr-2" size={20} />
            Retour
          </Button>
        </div>

        {/* Contenu */}
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Récapitulatif */}
          <Card className="glass shadow-soft p-6 animate-fade-slide-up">
            <h2 className="text-white text-2xl font-bold mb-4">Récapitulatif</h2>
            <div className="space-y-3 text-white/90">
              <div className="flex justify-between">
                <span>Forfait :</span>
                <span className="font-semibold">{packageData.volume}</span>
              </div>
              <div className="flex justify-between">
                <span>Durée :</span>
                <span className="font-semibold">{packageData.duration}</span>
              </div>
              <div className="h-px bg-white/20 my-3" />
              <div className="flex justify-between text-xl font-bold">
                <span>Prix :</span>
                <span className="text-secondary">{packageData.price} FCFA</span>
              </div>
            </div>
          </Card>

          {/* Formulaire de paiement */}
          <Card className="glass shadow-soft p-6 space-y-6 animate-fade-slide-up" style={{ animationDelay: "0.1s" }}>
            {/* Numéro de téléphone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white text-lg font-semibold">
                Numéro de téléphone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="+237 6__ __ __ __"
                className="h-14 text-lg bg-white/10 border-white/30 text-white placeholder:text-white/50"
              />
            </div>

            {/* Mode de paiement */}
            <div className="space-y-3">
              <Label className="text-white text-lg font-semibold">Mode de paiement</Label>
              <div className="grid grid-cols-3 gap-3">
                {operators.map((op) => (
                  <button
                    key={op.id}
                    onClick={() => setSelectedOperator(op.id)}
                    className={`h-20 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                      selectedOperator === op.id
                        ? "border-4 border-secondary scale-105 shadow-lg glow-gold"
                        : "border-2 border-white/30 hover:border-white/50"
                    } ${op.color} bg-opacity-20 backdrop-blur`}
                  >
                    <span className="text-3xl">{op.logo}</span>
                    <span className="text-white text-xs font-semibold text-center px-1">
                      {op.name.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bouton de paiement */}
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full h-16 text-xl font-bold bg-secondary hover:bg-secondary/90 text-white shadow-lg glow-gold transition-all duration-300 hover:scale-105"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion à Campay...
                </span>
              ) : (
                <>
                  <CreditCard className="mr-2" size={24} />
                  PAYER {packageData.price} FCFA
                </>
              )}
            </Button>

            {/* Message de réassurance */}
            <p className="text-white/70 text-sm text-center flex items-center justify-center gap-2">
              <span className="text-lg">🔒</span>
              Paiement 100% sécurisé • Aucun frais caché • Remboursement si échec
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Payment;
