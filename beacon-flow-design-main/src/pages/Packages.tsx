import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Zap, Star, Crown, HelpCircle, ArrowRight } from "lucide-react";
import BackgroundEffects from "@/components/BackgroundEffects";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Package {
  id: string;
  name: string;
  icon: typeof Zap;
  badge?: string;
  badgeColor?: string;
  volume: string;
  duration: string;
  price: number;
  speed: string;
  popular?: boolean;
  description: string;
}

const packages: Package[] = [
  {
    id: "rapide",
    name: "RAPIDE",
    icon: Zap,
    badge: "RAPIDE",
    badgeColor: "bg-emerald-bright",
    volume: "500 Mo",
    duration: "24h",
    price: 500,
    speed: "Jusqu'à 5 Mbps",
    description: "Environ 1h de vidéo ou 250 chansons",
  },
  {
    id: "populaire",
    name: "POPULAIRE",
    icon: Star,
    badge: "POPULAIRE",
    badgeColor: "bg-secondary",
    volume: "1 Go",
    duration: "24h",
    price: 1000,
    speed: "Jusqu'à 5 Mbps",
    popular: true,
    description: "Environ 2h de vidéo ou 500 chansons",
  },
  {
    id: "premium",
    name: "PREMIUM",
    icon: Crown,
    badge: "PREMIUM",
    badgeColor: "bg-violet-light",
    volume: "3 Go",
    duration: "7 jours",
    price: 2500,
    speed: "Jusqu'à 10 Mbps",
    description: "Environ 6h de vidéo ou 1500 chansons",
  },
];

const Packages = () => {
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const handleSelectPackage = (packageId: string) => {
    setSelectedPackage(packageId);
    navigate("/payment", { state: { packageId } });
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundEffects />

      <main className="relative z-10 min-h-screen p-4 md:p-8">
        {/* Header avec retour */}
        <div className="max-w-4xl mx-auto mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-white hover:bg-white/10 transition-smooth"
          >
            <ArrowLeft className="mr-2" size={20} />
            Retour
          </Button>
        </div>

        {/* Titre */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h1 className="text-white text-3xl md:text-4xl font-bold mb-3 animate-fade-slide-up">
            Choisissez votre forfait
          </h1>
          <p className="text-white/80 text-lg animate-fade-slide-up" style={{ animationDelay: "0.1s" }}>
            Des forfaits adaptés à tous vos besoins
          </p>
        </div>

        {/* Cards de forfaits */}
        <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-3">
          {packages.map((pkg, index) => {
            const Icon = pkg.icon;
            return (
              <Card
                key={pkg.id}
                className={`glass hover-scale shadow-soft overflow-hidden animate-fade-slide-up ${
                  pkg.popular ? "border-2 border-secondary glow-gold" : ""
                }`}
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <div className="p-6 space-y-4">
                  {/* Badge */}
                  <div className="flex items-start justify-between">
                    <div className={`${pkg.badgeColor} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
                      <Icon size={14} />
                      {pkg.badge}
                    </div>
                    {pkg.popular && (
                      <div className="text-2xl animate-pulse-sacred">⭐</div>
                    )}
                  </div>

                  {/* Infos du forfait */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white text-2xl font-bold">{pkg.volume}</h3>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="text-white/60 hover:text-white/80 transition-smooth">
                              <HelpCircle size={18} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="bg-card text-card-foreground max-w-xs">
                            <p>{pkg.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    <p className="text-white/80 text-lg font-medium">{pkg.duration}</p>
                    <p className="text-white/60 text-sm">{pkg.speed}</p>
                    
                    <div className="pt-2">
                      <p className="text-white text-3xl font-bold">
                        {pkg.price} <span className="text-xl font-normal">FCFA</span>
                      </p>
                    </div>
                  </div>

                  {/* Barre de progression visuelle */}
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="bg-gradient-prosperity h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${(pkg.price / 2500) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Bouton de sélection */}
                  <Button
                    onClick={() => handleSelectPackage(pkg.id)}
                    className={`w-full h-12 font-bold text-lg transition-all duration-300 ${
                      pkg.popular
                        ? "bg-secondary hover:bg-secondary/90 text-white"
                        : "bg-white hover:bg-white/90 text-primary"
                    }`}
                  >
                    CHOISIR
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Info supplémentaire */}
        <div className="text-center mt-12 max-w-2xl mx-auto">
          <p className="text-white/70 text-sm">
            Tous les forfaits incluent une connexion sécurisée et un support client 24/7
          </p>
        </div>
      </main>
    </div>
  );
};

export default Packages;
