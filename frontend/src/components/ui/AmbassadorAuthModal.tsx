import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Mail, Chrome } from 'lucide-react';

interface AmbassadorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userId: string, referralCode: string) => void;
}

export const AmbassadorAuthModal = ({ isOpen, onClose, onSuccess }: AmbassadorAuthModalProps) => {
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState<'google' | 'magiclink' | 'none'>('none');
  const { toast } = useToast();

  const handleAuth = async (provider: 'google' | 'magiclink') => {
    if (provider === 'magiclink' && !email) {
      toast({ title: "Erreur", description: "Veuillez entrer votre adresse e-mail.", variant: "destructive" });
      return;
    }
    if (!referralCode) {
        toast({ title: "Erreur", description: "Veuillez choisir un code de parrainage.", variant: "destructive" });
        return;
    }

    setLoading(provider);

    const redirectTo = window.location.href;

    if (provider === 'google') {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            referral_code: referralCode,
          }
        },
      });
      if (error) {
        toast({ title: "Erreur d'authentification", description: error.message, variant: "destructive" });
        setLoading('none');
      }
    } else if (provider === 'magiclink') {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${redirectTo}?referral_code=${referralCode}`,
        },
      });
      if (error) {
        toast({ title: "Erreur d'authentification", description: error.message, variant: "destructive" });
        setLoading('none');
      } else {
        toast({ title: "Vérifiez vos e-mails", description: "Nous vous avons envoyé un lien magique pour vous connecter." });
        onClose();
      }
    }
  };
  
  // This effect will handle the user session after OAuth redirect or magic link click
  // It should be placed in the page that receives the redirect (AmbassadorPage)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="p-6 text-center bg-gray-50 dark:bg-gray-800/50">
            <DialogHeader className="mb-4">
                <DialogTitle className="text-2xl font-bold">Devenir Ambassadeur</DialogTitle>
                <DialogDescription>
                    Choisissez un code de parrainage et connectez-vous pour commencer.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
                <label htmlFor="referral-code" className="sr-only">Votre Code de Parrainage</label>
                <Input
                    id="referral-code"
                    placeholder="Votre code de parrainage (ex: promo2024)"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.replace(/\s/g, ''))}
                    className="text-center"
                />
            </div>
        </div>

        <div className="p-6 space-y-4">
            <Button
                variant="outline"
                className="w-full"
                onClick={() => handleAuth('google')}
                disabled={loading !== 'none' || !referralCode}
            >
                {loading === 'google' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Chrome className="mr-2 h-4 w-4" />}
                Continuer avec Google
            </Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Ou continuer avec votre email
                    </span>
                </div>
            </div>

            <div className="grid gap-2">
                <label htmlFor="email" className="sr-only">Email</label>
                <Input
                    id="email"
                    type="email"
                    placeholder="votre.email@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <Button onClick={() => handleAuth('magiclink')} disabled={loading !== 'none' || !referralCode || !email} className="w-full">
                {loading === 'magiclink' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                Recevoir un lien magique
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};