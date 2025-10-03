import { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, DollarSign, Gift, Share2, Zap } from "lucide-react";

const HowItWorksStep = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
            {icon}
        </div>
        <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    </div>
);


export const AmbassadorLanding = ({ onJoin }: { onJoin: () => void }) => {
    useEffect(() => {
        console.log('[AmbassadorLanding] Component has mounted. New landing page should be visible.');
    }, []);

    return (
    <div className="w-full">
        {/* Hero Section */}
        <section className="text-center py-20 lg:py-32 px-4 bg-gradient-to-b from-background to-blue-50/50 dark:to-gray-900/50">
            <Gift className="mx-auto h-16 w-16 text-primary mb-6 animate-bounce" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tighter text-gray-900 dark:text-gray-100 mb-4">
                Devenez Ambassadeur. Gagnez de l'Argent.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Rejoignez notre programme exclusif, partagez une connexion Internet de qualité et soyez récompensé pour chaque nouveau client que vous nous apportez.
            </p>
            <Button onClick={onJoin} size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-shadow group">
                Rejoindre le Programme
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
        </section>

        {/* How It Works Section */}
        {/* How It Works Section */}
        <section className="py-16 lg:py-24 px-4 bg-white dark:bg-gray-900">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">Comment ça marche ?</h2>
                <div className="space-y-10">
                    <HowItWorksStep
                        icon={<Zap size={24} />}
                        title="1. Inscription Rapide et Gratuite"
                        description="Devenir ambassadeur ne prend que quelques minutes. Remplissez le formulaire et obtenez votre lien de parrainage personnalisé instantanément."
                    />
                    <HowItWorksStep
                        icon={<Share2 size={24} />}
                        title="2. Partagez Votre Lien Unique"
                        description="Partagez votre lien sur les réseaux sociaux, par e-mail, ou directement avec vos amis. Plus vous partagez, plus vous avez de chances de gagner."
                    />
                    <HowItWorksStep
                        icon={<DollarSign size={24} />}
                        title="3. Gagnez des Commissions"
                        description="Recevez une commission pour chaque personne qui achète un forfait internet en utilisant votre lien. Suivez vos gains en temps réel depuis votre tableau de bord."
                    />
                </div>
            </div>
        </section>

        {/* Final CTA Section */}
        <section className="bg-primary text-primary-foreground py-20 px-4">
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-4">Prêt à commencer à gagner ?</h2>
                <p className="text-lg opacity-90 mb-8">
                    Ne manquez pas cette opportunité de générer un revenu passif en partageant un service de qualité.
                </p>
                <Button onClick={onJoin} size="lg" variant="secondary" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-shadow group">
                    Devenir Ambassadeur Maintenant
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
            </div>
        </section>
    </div>
    );
};