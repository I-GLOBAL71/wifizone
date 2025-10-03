import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Chrome, Loader2, Mail } from 'lucide-react';
import { useToast } from './ui/use-toast';

export default function Auth() {
    const [loading, setLoading] = useState<'google' | 'magiclink' | 'none'>('none');
    const [email, setEmail] = useState('');
    const { toast } = useToast();
    const { signInWithGoogle } = useAuth();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast({ title: "Erreur", description: "Veuillez entrer votre adresse e-mail.", variant: "destructive" });
            return;
        }
        
        setLoading('magiclink');
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: window.location.origin,
                }
            });
            if (error) throw error;
            toast({ title: "Vérifiez vos e-mails", description: "Nous vous avons envoyé un lien magique pour vous connecter." });
        } catch (error: any) {
            toast({ title: "Erreur", description: error.error_description || error.message, variant: "destructive" });
        } finally {
            setLoading('none');
        }
    };

    const handleGoogleLogin = async () => {
        setLoading('google');
        try {
            await signInWithGoogle();
        } catch (error: any) {
            toast({ title: "Erreur", description: error.error_description || error.message, variant: "destructive" });
        } finally {
            setLoading('none');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-background p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Connectez-vous</CardTitle>
                    <CardDescription>Accédez à votre tableau de bord en un clic.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={handleGoogleLogin}
                            disabled={loading !== 'none'}
                        >
                            {loading === 'google' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Chrome className="mr-2 h-4 w-4" />}
                            Continuer avec Google
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">
                                    Ou continuer avec l'email
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="grid gap-2">
                                <label htmlFor="email" className="sr-only">Email</label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="votre.email@exemple.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading !== 'none'}
                                />
                            </div>
                            <Button type="submit" disabled={loading !== 'none' || !email} className="w-full">
                                {loading === 'magiclink' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                                Envoyer le lien magique
                            </Button>
                        </form>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}