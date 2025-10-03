import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import axios from 'axios';

const SettingsAdmin = () => {
  const [settings, setSettings] = useState({
    commission_mode: 'percentage',
    commission_rate: '10',
    commission_fixed_amount: '500',
    commission_percentage_limit: '3',
    discount_rate: '5',
    // Payment Provider Settings
    campay_enabled: 'true',
    flutterwave_enabled: 'false',
    flutterwave_public_key: '',
    flutterwave_secret_key: '', // Note: Handled securely on the backend
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const keys = Object.keys(settings);
        const responses = await Promise.all(
          keys.map(key => axios.get(`http://localhost:3000/settings/${key}`))
        );
        const newSettings = responses.reduce((acc, res, index) => {
          acc[keys[index]] = res.data.value;
          return acc;
        }, {} as typeof settings);
        setSettings(newSettings);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        toast({ title: "Erreur", description: "Impossible de charger les paramètres." });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [toast]);

  const handleSave = async () => {
    try {
      await Promise.all(
        Object.entries(settings).map(([key, value]) =>
          axios.post('http://localhost:3000/settings', { key, value })
        )
      );
      toast({ title: "Succès", description: "Les paramètres ont été mis à jour." });
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast({ title: "Erreur", description: "Impossible d'enregistrer les paramètres.", variant: "destructive" });
    }
  };
  
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return <div>Chargement des paramètres...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Paramètres du Programme</h2>
        <Button onClick={handleSave} className="w-full sm:w-auto">Enregistrer</Button>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rémunération des Ambassadeurs</CardTitle>
            <CardDescription>Choisissez comment récompenser vos ambassadeurs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label>Mode de Commission</label>
              <Select value={settings.commission_mode} onValueChange={(value) => handleSettingChange('commission_mode', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Pourcentage</SelectItem>
                  <SelectItem value="fixed">Montant Fixe</SelectItem>
                  <SelectItem value="both">Les Deux</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(settings.commission_mode === 'percentage' || settings.commission_mode === 'both') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <label>Taux de Commission (%)</label>
                  <Input type="number" value={settings.commission_rate} onChange={(e) => handleSettingChange('commission_rate', e.target.value)} />
                  <p className="text-xs text-muted-foreground">Le % du montant de l'achat versé à l'ambassadeur.</p>
                </div>
                <div className="space-y-2">
                  <label>Limite d'Application</label>
                  <Input type="number" value={settings.commission_percentage_limit} onChange={(e) => handleSettingChange('commission_percentage_limit', e.target.value)} />
                  <p className="text-xs text-muted-foreground">Appliquer ce % pour les 'X' premières souscriptions du client.</p>
                </div>
              </div>
            )}

            {(settings.commission_mode === 'fixed' || settings.commission_mode === 'both') && (
              <div className="p-4 border rounded-lg space-y-2">
                <label>Montant Fixe (XAF)</label>
                <Input type="number" value={settings.commission_fixed_amount} onChange={(e) => handleSettingChange('commission_fixed_amount', e.target.value)} />
                <p className="text-xs text-muted-foreground">Un montant fixe versé à l'ambassadeur pour chaque nouveau client.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Réduction Client</CardTitle>
            <CardDescription>Configurez la réduction pour le client qui utilise un code de parrainage.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Input type="number" value={settings.discount_rate} onChange={(e) => handleSettingChange('discount_rate', e.target.value)} className="w-24" />
              <span className="text-lg font-medium">%</span>
            </div>
            <p className="text-xs text-muted-foreground sm:mt-0">Le % de réduction appliqué à la facture du client.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Moyens de Paiement</CardTitle>
            <CardDescription>Activez et configurez les fournisseurs de paiement.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Campay Settings */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <label htmlFor="campay_enabled" className="font-medium">Campay</label>
                <Switch
                  id="campay_enabled"
                  checked={settings.campay_enabled === 'true'}
                  onCheckedChange={(checked) => handleSettingChange('campay_enabled', String(checked))}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Activer ou désactiver le paiement par Campay (Mobile Money).</p>
            </div>

            {/* Flutterwave Settings */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <label htmlFor="flutterwave_enabled" className="font-medium">Flutterwave</label>
                <Switch
                  id="flutterwave_enabled"
                  checked={settings.flutterwave_enabled === 'true'}
                  onCheckedChange={(checked) => handleSettingChange('flutterwave_enabled', String(checked))}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Activer ou désactiver le paiement par Flutterwave (Cartes, etc.).</p>
              {settings.flutterwave_enabled === 'true' && (
                <div className="grid gap-2 mt-4">
                  <label>Clé Publique Flutterwave</label>
                  <Input
                    type="text"
                    placeholder="FLWPUBK_TEST-..."
                    value={settings.flutterwave_public_key}
                    onChange={(e) => handleSettingChange('flutterwave_public_key', e.target.value)}
                  />
                   <label>Clé Secrète Flutterwave</label>
                  <Input
                    type="password"
                    placeholder="FLWSECK_TEST-..."
                    value={settings.flutterwave_secret_key}
                    onChange={(e) => handleSettingChange('flutterwave_secret_key', e.target.value)}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsAdmin;