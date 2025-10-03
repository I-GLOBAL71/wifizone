import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Copy, Share2, TrendingUp, Users, DollarSign, Link as LinkIcon, LogOut } from "lucide-react";
import BackgroundEffects from "@/components/BackgroundEffects";
import Logo from "@/components/Logo";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { signInWithGoogle, signOut } from "@/lib/auth";

const Ambassador = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [ambassadorCode] = useState("JD843K");
  const [ambassadorLink] = useState(`wifi.cm/amb/${ambassadorCode}`);

  // Données simulées
  const ambassadorData = {
    earningsThisMonth: 2500,
    earningsChange: 15,
    totalEarnings: 5200,
    referrals: 8,
    clicks: 23,
    level: "Bronze",
    commissionRate: 10,
    history: [
      { date: "30/09", amount: 500, description: "Commission parrainage" },
      { date: "28/09", amount: 300, description: "Commission parrainage" },
    ],
  };

  const copyLink = () => {
    navigator.clipboard.writeText(ambassadorLink);
    toast.success("Lien copié ✓");
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "MonWiFi - WiFi Rapide et Abordable",
          text: `🎁 Profite de WiFi rapide à partir de 500 FCFA ! Utilise mon code : ${ambassadorCode}`,
          url: `https://${ambassadorLink}`,
        });
      } catch (err) {
        console.log("Partage annulé");
      }
    } else {
      copyLink();
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error("Erreur de connexion");
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error("Erreur de déconnexion");
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <BackgroundEffects />
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
        <BackgroundEffects />
        
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
          <div className="mb-12">
            <Logo animated />
          </div>
          
          <Card className="glass p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-gold-warm/20 flex items-center justify-center mx-auto mb-6">
              <DollarSign className="text-gold-warm" size={32} />
            </div>
            <h1 className="text-white text-2xl font-bold mb-4">Espace Ambassadeur</h1>
            <p className="text-white/70 mb-8">
              Connectez-vous avec votre compte Google pour accéder à votre tableau de bord ambassadeur
            </p>
            <Button
              onClick={handleGoogleSignIn}
              className="w-full h-14 bg-white text-primary hover:bg-white/90 font-semibold text-lg"
            >
              <Share2 className="mr-2" size={20} />
              Se connecter avec Google
            </Button>
          </Card>
        </div>
      </div>
    );
  }

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
            Accueil
          </Button>
          
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <LogOut size={18} className="mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Contenu */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Titre */}
          <div className="text-center space-y-2 animate-fade-slide-up">
            <div className="text-4xl mb-2">💎</div>
            <h1 className="text-white text-3xl md:text-4xl font-bold">
              Programme Ambassadeur
            </h1>
            <p className="text-white/80 text-lg">
              Partagez et gagnez {ambassadorData.commissionRate}% sur chaque achat
            </p>
          </div>

          {/* Lien ambassadeur */}
          <Card className="glass shadow-soft p-6 space-y-4 animate-fade-slide-up" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-white text-xl font-bold flex items-center gap-2">
              <LinkIcon size={24} />
              Votre lien ambassadeur
            </h2>
            
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 h-14 bg-white/10 border-2 border-white/30 rounded-lg flex items-center px-4">
                <code className="text-white font-mono text-sm md:text-base truncate">
                  {ambassadorLink}
                </code>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={copyLink}
                  variant="outline"
                  className="h-14 px-6 border-2 border-white/30 text-white hover:bg-white/10 font-semibold"
                >
                  <Copy className="mr-2" size={20} />
                  Copier
                </Button>
                
                <Button
                  onClick={shareLink}
                  className="h-14 px-6 bg-secondary hover:bg-secondary/90 text-white font-semibold"
                >
                  <Share2 className="mr-2" size={20} />
                  Partager
                </Button>
              </div>
            </div>

            {/* QR Code */}
            <div className="pt-4 flex justify-center">
              <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center">
                <div className="text-center p-4">
                  <div className="w-40 h-40 bg-gradient-sacred rounded-lg flex items-center justify-center">
                    <LinkIcon size={60} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Gains du mois */}
          <Card className="glass shadow-soft p-8 text-center space-y-3 animate-fade-slide-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-white text-lg font-semibold">Gains ce mois</h2>
            <div className="text-white text-5xl md:text-6xl font-bold">
              {ambassadorData.earningsThisMonth.toLocaleString()} <span className="text-2xl">FCFA</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-success text-lg">
              <TrendingUp size={20} />
              <span>+{ambassadorData.earningsChange}% vs mois dernier</span>
            </div>
          </Card>

          {/* Statistiques */}
          <div className="grid md:grid-cols-3 gap-4 animate-fade-slide-up" style={{ animationDelay: "0.3s" }}>
            <Card className="glass shadow-soft p-6 text-center space-y-2">
              <Users className="text-secondary mx-auto" size={40} />
              <div className="text-white text-3xl font-bold">{ambassadorData.referrals}</div>
              <p className="text-white/70">Parrainages</p>
            </Card>

            <Card className="glass shadow-soft p-6 text-center space-y-2">
              <DollarSign className="text-gold-warm mx-auto" size={40} />
              <div className="text-white text-3xl font-bold">
                {ambassadorData.totalEarnings.toLocaleString()}
              </div>
              <p className="text-white/70">FCFA total</p>
            </Card>

            <Card className="glass shadow-soft p-6 text-center space-y-2">
              <LinkIcon className="text-emerald-bright mx-auto" size={40} />
              <div className="text-white text-3xl font-bold">{ambassadorData.clicks}</div>
              <p className="text-white/70">Clics</p>
            </Card>
          </div>

          {/* Niveau et badge */}
          <Card className="glass shadow-soft p-6 animate-fade-slide-up" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white text-xl font-bold mb-2">Niveau actuel</h3>
                <p className="text-white/70">
                  Continuez à parrainer pour débloquer des niveaux supérieurs
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">🥉</div>
                <div className="text-white font-bold text-lg">{ambassadorData.level}</div>
              </div>
            </div>
          </Card>

          {/* Bouton retirer gains */}
          <Button
            className="w-full h-16 text-xl font-bold bg-gradient-growth hover:opacity-90 text-white shadow-lg transition-all duration-300 hover:scale-105 animate-fade-slide-up"
            style={{ animationDelay: "0.5s" }}
          >
            <DollarSign className="mr-2" size={28} />
            RETIRER MES GAINS
          </Button>

          {/* Historique des gains */}
          <Card className="glass shadow-soft p-6 space-y-4 animate-fade-slide-up" style={{ animationDelay: "0.6s" }}>
            <h2 className="text-white text-xl font-bold">Historique des gains</h2>
            <div className="space-y-3">
              {ambassadorData.history.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-white/90 pb-3 border-b border-white/10 last:border-0"
                >
                  <div>
                    <p className="font-semibold">+{item.amount} FCFA</p>
                    <p className="text-sm text-white/60">{item.description}</p>
                  </div>
                  <span className="text-white/60 text-sm">{item.date}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Ambassador;
