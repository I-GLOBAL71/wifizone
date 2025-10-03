import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, RefreshCw, Phone, Users, Wifi } from "lucide-react";
import BackgroundEffects from "@/components/BackgroundEffects";
import Logo from "@/components/Logo";
import { useNavigate } from "react-router-dom";

const Account = () => {
  const navigate = useNavigate();

  // Données simulées
  const userData = {
    name: "Utilisateur",
    currentPackage: {
      volume: "1 Go",
      remaining: 750, // Mo
      total: 1000,
      expiresIn: "18h",
    },
    history: [
      { date: "01/10", package: "1 Go", status: "✓" },
      { date: "28/09", package: "500 Mo", status: "✓" },
      { date: "25/09", package: "1 Go", status: "✓" },
    ],
  };

  const remainingPercentage = (userData.currentPackage.remaining / userData.currentPackage.total) * 100;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundEffects />

      <main className="relative z-10 min-h-screen p-4 md:p-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-white hover:bg-white/10 transition-smooth"
          >
            <ArrowLeft className="mr-2" size={20} />
            Retour
          </Button>
          
          <Logo size="sm" />
        </div>

        {/* Contenu */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Salutation */}
          <div className="text-white text-2xl md:text-3xl font-bold animate-fade-slide-up">
            Bonjour {userData.name} 👋
          </div>

          {/* Forfait actif */}
          <Card className="glass shadow-soft p-6 space-y-4 animate-fade-slide-up" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-white text-xl font-bold">Votre forfait actif</h2>
            
            {/* Barre de progression circulaire */}
            <div className="space-y-3">
              <Progress value={remainingPercentage} className="h-3" />
              <div className="flex justify-between text-white/90">
                <span className="font-semibold text-lg">
                  {userData.currentPackage.remaining} Mo restants
                </span>
                <span className="text-sm text-white/70">
                  {remainingPercentage.toFixed(0)}%
                </span>
              </div>
              <p className="text-white/70">
                Expire dans <span className="font-semibold text-white">{userData.currentPackage.expiresIn}</span>
              </p>
            </div>

            {/* Alerte si faible */}
            {remainingPercentage < 20 && (
              <div className="bg-secondary/20 border-2 border-secondary rounded-lg p-3 flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <p className="text-white text-sm">
                  Plus que {userData.currentPackage.remaining} Mo restants
                </p>
              </div>
            )}
          </Card>

          {/* Actions rapides */}
          <div className="animate-fade-slide-up" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-white text-lg font-semibold mb-4">Actions rapides</h3>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => navigate("/packages")}
                className="glass hover-scale p-6 rounded-xl text-center space-y-2 transition-all duration-300 hover:bg-white/10"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-prosperity flex items-center justify-center">
                  <RefreshCw className="text-white" size={32} />
                </div>
                <p className="text-white font-semibold">Recharger</p>
              </button>

              <button
                onClick={() => navigate("/support")}
                className="glass hover-scale p-6 rounded-xl text-center space-y-2 transition-all duration-300 hover:bg-white/10"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-wisdom flex items-center justify-center">
                  <Phone className="text-white" size={32} />
                </div>
                <p className="text-white font-semibold">Aide</p>
              </button>

              <button
                onClick={() => navigate("/ambassador")}
                className="glass hover-scale p-6 rounded-xl text-center space-y-2 transition-all duration-300 hover:bg-white/10"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-growth flex items-center justify-center">
                  <Users className="text-white" size={32} />
                </div>
                <p className="text-white font-semibold">Ambassadeur</p>
              </button>
            </div>
          </div>

          {/* Historique */}
          <Card className="glass shadow-soft p-6 space-y-4 animate-fade-slide-up" style={{ animationDelay: "0.3s" }}>
            <h2 className="text-white text-xl font-bold">Historique</h2>
            <div className="space-y-3">
              {userData.history.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-white/90 pb-3 border-b border-white/10 last:border-0"
                >
                  <span>{item.package}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-white/60 text-sm">{item.date}</span>
                    <span className="text-success text-lg">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Déconnexion */}
          <div className="text-center animate-fade-slide-up" style={{ animationDelay: "0.4s" }}>
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              Se déconnecter
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Account;
