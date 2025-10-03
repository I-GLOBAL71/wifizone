import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, Code, Award, Zap, Clock, TrendingUp } from "lucide-react";
import BackgroundEffects from "@/components/BackgroundEffects";
import Logo from "@/components/Logo";
import { useNavigate } from "react-router-dom";

const UserApp = () => {
  const navigate = useNavigate();

  const packages = [
    {
      id: 1,
      name: "RAPIDE",
      speed: "5 Mbps",
      duration: "1h",
      price: 500,
      icon: Zap,
      color: "violet-light",
      popular: false,
    },
    {
      id: 2,
      name: "POPULAIRE",
      speed: "10 Mbps",
      duration: "3h",
      price: 1000,
      icon: TrendingUp,
      color: "secondary",
      popular: true,
    },
    {
      id: 3,
      name: "PREMIUM",
      speed: "20 Mbps",
      duration: "24h",
      price: 3000,
      icon: Award,
      color: "gold-warm",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundEffects />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 md:p-8">
        {/* Logo animé */}
        <div className="mb-12 animate-fade-slide-up">
          <Logo animated size="lg" />
        </div>

        {/* Message d'accueil */}
        <div className="text-center mb-8 space-y-3 animate-fade-slide-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-white text-3xl md:text-4xl font-bold">
            Choisissez votre forfait
          </h2>
          <p className="text-white/90 text-lg md:text-xl font-medium">
            WiFi rapide et sécurisé 🇨🇲
          </p>
        </div>

        {/* Packages Grid */}
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-fade-slide-up" style={{ animationDelay: "0.2s" }}>
          {packages.map((pkg, index) => {
            const Icon = pkg.icon;
            return (
              <Card
                key={pkg.id}
                className="relative p-6 glass hover-scale shadow-elegant cursor-pointer group"
                onClick={() => navigate("/payment", { state: { package: pkg } })}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-secondary text-white">
                    Le plus populaire
                  </Badge>
                )}
                
                <div className="text-center space-y-4">
                  <div className={`w-16 h-16 rounded-full bg-${pkg.color}/20 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform`}>
                    <Icon className={`text-${pkg.color}`} size={32} />
                  </div>
                  
                  <h3 className="text-white text-2xl font-bold">{pkg.name}</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-white/80">
                      <Wifi size={16} />
                      <span>{pkg.speed}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-white/80">
                      <Clock size={16} />
                      <span>{pkg.duration}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-white/10">
                    <p className={`text-${pkg.color} text-4xl font-bold`}>
                      {pkg.price.toLocaleString()}
                    </p>
                    <p className="text-white/60 text-sm">FCFA</p>
                  </div>
                  
                  <Button
                    className={`w-full bg-gradient-prosperity text-white hover:opacity-90`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/payment", { state: { package: pkg } });
                    }}
                  >
                    Acheter
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Bouton code */}
        <div className="w-full max-w-md mb-6 animate-fade-slide-up" style={{ animationDelay: "0.3s" }}>
          <Button
            onClick={() => navigate("/redeem-code")}
            variant="outline"
            className="w-full h-14 text-lg font-semibold border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 hover:scale-105 transition-all duration-300 glass"
          >
            <Code className="mr-2" size={20} />
            J'ai un code d'activation
          </Button>
        </div>

        {/* Message de réassurance */}
        <div className="text-center mb-6 animate-fade-slide-up" style={{ animationDelay: "0.4s" }}>
          <p className="text-white/80 text-sm flex items-center justify-center gap-2">
            <span className="text-lg">🔒</span>
            Paiement sécurisé • 100% Cameroun 🇨🇲
          </p>
        </div>

        {/* Lien ambassadeur discret */}
        <button
          onClick={() => navigate("/ambassador/a9e1c26a-91a3-4e68-9f8a-4c9e1c26a91a")}
          className="text-gold-light hover:text-gold-warm transition-smooth flex items-center gap-2 font-medium animate-fade-slide-up"
          style={{ animationDelay: "0.5s" }}
        >
          <Award size={20} />
          💎 Devenir Ambassadeur
        </button>
      </main>
    </div>
  );
};

export default UserApp;
