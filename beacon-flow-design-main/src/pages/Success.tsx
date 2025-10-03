import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Copy, Wifi, BarChart3 } from "lucide-react";
import BackgroundEffects from "@/components/BackgroundEffects";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

const Success = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const packageData = location.state?.packageData;
  
  const [countdown, setCountdown] = useState(3);
  const [wifiCode] = useState(`u${Date.now()}`);

  useEffect(() => {
    // Confetti effect (simulation)
    toast.success("Paiement réussi !", {
      description: "Votre connexion WiFi est maintenant active",
    });

    // Compte à rebours
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(wifiCode);
    toast.success("Code copié ✓");
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundEffects />

      <main className="relative z-10 min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full space-y-8">
          {/* Animation de succès */}
          <div className="text-center space-y-6 animate-fade-slide-up">
            <div className="inline-block">
              <CheckCircle2 
                size={120} 
                className="text-success mx-auto animate-scale-in" 
                strokeWidth={2}
              />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-white text-4xl md:text-5xl font-bold">
                Paiement réussi !
              </h1>
              <p className="text-white/80 text-xl">
                {countdown > 0 ? `Connexion automatique dans ${countdown}...` : "Connexion automatique..."}
              </p>
            </div>
          </div>

          {/* QR Code et code WiFi */}
          <Card className="glass shadow-soft p-8 space-y-6 animate-fade-slide-up" style={{ animationDelay: "0.2s" }}>
            {/* QR Code placeholder */}
            <div className="flex justify-center">
              <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="w-40 h-40 bg-gradient-sacred rounded-lg flex items-center justify-center">
                    <Wifi size={80} className="text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Code WiFi */}
            <div className="space-y-3">
              <Label className="text-white text-lg font-semibold text-center block">
                Votre code WiFi
              </Label>
              <div className="flex gap-2">
                <div className="flex-1 h-14 bg-white/10 border-2 border-white/30 rounded-lg flex items-center justify-center">
                  <code className="text-white text-xl font-mono font-bold">{wifiCode}</code>
                </div>
                <Button
                  onClick={copyCode}
                  variant="outline"
                  className="h-14 px-4 border-2 border-white/30 text-white hover:bg-white/10"
                >
                  <Copy size={20} />
                </Button>
              </div>
            </div>

            {/* Détails du forfait */}
            {packageData && (
              <div className="pt-4 border-t border-white/20">
                <div className="grid grid-cols-2 gap-4 text-white/90">
                  <div>
                    <p className="text-sm text-white/60">Volume</p>
                    <p className="font-semibold text-lg">{packageData.volume}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Durée</p>
                    <p className="font-semibold text-lg">{packageData.duration}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Actions */}
          <div className="space-y-3 animate-fade-slide-up" style={{ animationDelay: "0.3s" }}>
            <Button
              onClick={() => navigate("/account")}
              className="w-full h-14 text-lg font-bold bg-white hover:bg-white/90 text-primary"
            >
              <Wifi className="mr-2" size={24} />
              SE CONNECTER
            </Button>
            
            <Button
              onClick={() => navigate("/account")}
              variant="outline"
              className="w-full h-12 border-2 border-white/30 text-white hover:bg-white/10"
            >
              <BarChart3 className="mr-2" size={20} />
              Voir mon forfait
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

// Petit composant Label manquant
const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <label className={className}>{children}</label>
);

export default Success;
