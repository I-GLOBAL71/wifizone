import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Ticket, ArrowLeft } from "lucide-react";
import BackgroundEffects from "@/components/BackgroundEffects";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const RedeemCode = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRedeem = async () => {
    if (code.length < 6) {
      toast({
        title: "Code invalide",
        description: "Veuillez entrer un code valide",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulation d'appel API
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "✅ Code activé !",
        description: "Votre forfait a été activé avec succès",
      });
      navigate("/success");
    }, 1500);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundEffects />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
        {/* Bouton retour */}
        <div className="absolute top-8 left-4 md:left-8 animate-fade-slide-up">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2" size={20} />
            Retour
          </Button>
        </div>

        {/* Logo */}

        {/* Card principale */}
        <Card className="w-full max-w-md p-8 glass shadow-elegant animate-fade-slide-up" style={{ animationDelay: "0.1s" }}>
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gold-warm/20 flex items-center justify-center mx-auto mb-4">
              <Ticket className="text-gold-warm" size={32} />
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">
              Activer un code
            </h2>
            <p className="text-white/70">
              Entrez votre code d'activation ci-dessous
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="XXXXX-XXXXX-XXXXX"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="h-14 text-center text-lg font-mono tracking-wider bg-white/5 border-white/20 text-white placeholder:text-white/40"
                maxLength={17}
              />
            </div>

            <Button
              onClick={handleRedeem}
              disabled={isLoading || code.length < 6}
              className="w-full h-14 text-lg font-bold bg-gradient-prosperity hover:opacity-90 text-white"
            >
              {isLoading ? "Activation..." : "Activer le code"}
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-white/60 text-sm text-center">
              💡 Vous trouverez votre code sur votre ticket d'achat ou par SMS
            </p>
          </div>
        </Card>

        {/* Aide */}
        <div className="mt-8 text-center animate-fade-slide-up" style={{ animationDelay: "0.2s" }}>
          <p className="text-white/60 text-sm">
            Besoin d'aide ? Contactez-nous au <span className="text-secondary font-semibold">+237 6XX XXX XXX</span>
          </p>
        </div>
      </main>
    </div>
  );
};

export default RedeemCode;
