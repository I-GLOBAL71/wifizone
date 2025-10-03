import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader } from 'lucide-react';

interface PurchaseStatus {
    state: 'pending' | 'completed' | 'failed';
    mikrotik_user?: string;
    mikrotik_pass?: string;
}

export default function SuccessPage() {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [status, setStatus] = useState<PurchaseStatus | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [polling, setPolling] = useState(true);

    useEffect(() => {
        if (!sessionId) {
            setError("ID de session non trouvé.");
            setPolling(false);
            return;
        }

        const intervalId = setInterval(async () => {
            try {
                const response = await axios.get<PurchaseStatus>(`http://localhost:3000/purchase/status/${sessionId}`);
                if (response.data.state === 'completed') {
                    setStatus(response.data);
                    setPolling(false);
                    clearInterval(intervalId);
                } else if (response.data.state === 'failed') {
                    setError("Le paiement a échoué.");
                    setPolling(false);
                    clearInterval(intervalId);
                }
                // If pending, we just keep polling.
            } catch (err) {
                setError("Impossible de vérifier le statut du paiement.");
                setPolling(false);
                clearInterval(intervalId);
            }
        }, 2000); // Poll every 2 seconds

        // Cleanup on component unmount
        return () => clearInterval(intervalId);

    }, [sessionId]);

    const renderContent = () => {
        if (polling) {
            return (
                <>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center">
                            <Loader className="mr-2 h-6 w-6 animate-spin" />
                            Vérification du paiement...
                        </CardTitle>
                        <CardDescription>
                            Veuillez patienter pendant que nous confirmons votre transaction.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center text-muted-foreground">
                            Cela peut prendre quelques instants. Ne fermez pas cette page.
                        </div>
                    </CardContent>
                </>
            );
        }

        if (error) {
            return (
                <CardHeader>
                    <CardTitle className="text-red-500">Erreur</CardTitle>
                    <CardDescription>{error}</CardDescription>
                </CardHeader>
            );
        }

        if (status?.state === 'completed') {
            return (
                <>
                    <CardHeader className="items-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                        <CardTitle>Paiement Réussi!</CardTitle>
                        <CardDescription>
                            Utilisez ces identifiants pour vous connecter au portail Wi-Fi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Nom d'utilisateur</label>
                            <div className="font-mono p-2 bg-muted rounded-md">{status.mikrotik_user}</div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Mot de passe</label>
                            <div className="font-mono p-2 bg-muted rounded-md">{status.mikrotik_pass}</div>
                        </div>
                        <Button className="w-full" asChild>
                            <a href="http://hotspot.local">Se connecter au Wi-Fi</a>
                        </Button>
                    </CardContent>
                </>
            );
        }

        return null; // Should not be reached
    };

    return (
        <div className="container flex h-screen items-center justify-center">
            <Card className="w-[400px] text-center">
                {renderContent()}
            </Card>
        </div>
    );
}
