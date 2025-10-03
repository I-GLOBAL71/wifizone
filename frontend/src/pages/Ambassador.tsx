import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AmbassadorAuthModal } from '@/components/ui/AmbassadorAuthModal';
import { AmbassadorDashboard } from '@/components/ambassador/AmbassadorDashboard';
import { AmbassadorLanding } from '@/components/ambassador/AmbassadorLanding';

interface AmbassadorData {
  id: string;
  user_id: string;
  name: string;
  referral_code: string;
  balance: number;
  stats: {
    signups: number;
    clicks: number;
  };
}

const LoadingSkeleton = () => (
    <div className="p-8 w-full max-w-6xl">
        <Skeleton className="h-8 w-1/2 mb-8" />
        <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-40" />
    </div>
);

export default function AmbassadorPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<AmbassadorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isLoggedInWithoutProfile, setIsLoggedInWithoutProfile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleCreateAmbassador = async (userId: string, referralCode: string, name?: string, email?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session");

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/ambassadors`, { user_id: userId, referral_code: referralCode, name, email }, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      setData(response.data);
      setIsNotFound(false);
      toast({ title: "Félicitations!", description: "Votre profil d'ambassadeur a été créé." });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        toast({ title: "Info", description: "Vous êtes déjà un ambassadeur. Chargement de votre profil..." });
        if (user) fetchAmbassadorData(user.id);
      } else {
        toast({ title: "Erreur", description: "Impossible de créer le profil d'ambassadeur.", variant: "destructive" });
      }
    }
  };

  const fetchAmbassadorData = async (userId: string) => {
    console.log(`AmbassadorPage: Fetching data for user ${userId}...`);
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('AmbassadorPage: No active session found.');
        throw new Error("No active session");
      }
      console.log('AmbassadorPage: Session found.');

      const { data, error } = await supabase.functions.invoke(`ambassadors/${userId}`);

      if (error) {
        console.error('AmbassadorPage: Error invoking function:', error);
        throw error;
      }

      console.log('AmbassadorPage: Ambassador data response:', data);
      setData(data);
      setIsNotFound(false);
      setIsLoggedInWithoutProfile(false);
      console.log('AmbassadorPage: Data fetching successful.');
    } catch (err) {
      console.error('AmbassadorPage: Error fetching ambassador data:', err);
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        if (user) {
          setIsLoggedInWithoutProfile(true);
        } else {
          setIsNotFound(true);
        }
      } else {
        toast({
          title: "Erreur",
          description: "Une erreur inattendue est survenue lors de la récupération des données.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (user) {
      const params = new URLSearchParams(location.hash.replace('#', '?'));
      const referralCode = params.get('referral_code');
      
      if (referralCode) {
        handleCreateAmbassador(user.id, referralCode, user.user_metadata.full_name, user.email)
          .finally(() => setLoading(false));
        navigate(location.pathname, { replace: true });
      } else {
        fetchAmbassadorData(user.id);
      }
      setIsModalOpen(false);
    } else {
      setIsNotFound(true);
      setIsLoggedInWithoutProfile(false);
      setLoading(false);
    }
  }, [user, authLoading, location, navigate]);

  const getShareData = () => {
    if (!data) return null;
    const referralLink = `http://hotspot.local/r/${data.referral_code}`;
    return {
      title: 'Rejoignez-moi sur ce super réseau WiFi!',
      text: `Utilisez mon code pour obtenir des avantages sur votre prochain forfait internet: ${data.referral_code}`,
      url: referralLink,
    };
  };

  const handleShare = async () => {
    const shareData = getShareData();
    if (navigator.share && shareData) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      handleCopyToClipboard();
    }
  };

  const handleCopyToClipboard = () => {
    const shareData = getShareData();
    if (shareData?.url) {
      navigator.clipboard.writeText(shareData.url);
      toast({
        title: "Copié!",
        description: "Le lien de parrainage a été copié dans le presse-papiers.",
      });
    }
  };

  const renderContent = () => {
    if (loading || authLoading) {
      return <LoadingSkeleton />;
    }

    if (data) {
      return <AmbassadorDashboard data={data} onCopy={handleCopyToClipboard} onShare={handleShare} />;
    }

    if (isLoggedInWithoutProfile && user) {
      // User is logged in but has no profile. Show a specific CTA.
      return (
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-4">Finalisez votre profil d'ambassadeur</h2>
          <p className="text-muted-foreground mb-6">Vous êtes à un pas de commencer à gagner. Créez votre profil maintenant.</p>
          <Button onClick={() => handleCreateAmbassador(user.id, user.email!, user.user_metadata.full_name, user.email)}>
            Créer mon profil d'ambassadeur
          </Button>
        </div>
      );
    }
    
    // Default case for logged-out users.
    return <AmbassadorLanding onJoin={() => setIsModalOpen(true)} />;
  }

  return (
    <>
      <AmbassadorAuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(userId, referralCode) => handleCreateAmbassador(userId, referralCode)}
      />
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50 dark:bg-background">
          {renderContent()}
      </div>
    </>
  );
}
