import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Tariff {
  id: string;
  name: string;
  data_bytes: number;
  duration_seconds: number;
  price_cfa: number;
  speed_limit: string | null;
}

const emptyTariff: Partial<Tariff> = {
    name: '',
    data_bytes: 1073741824, // 1 GB
    duration_seconds: 86400, // 1 day
    price_cfa: 1000,
    speed_limit: '1M/1M'
};

export default function PackagesAdmin() {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTariff, setSelectedTariff] = useState<Partial<Tariff>>(emptyTariff);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [columns, setColumns] = useState(2);
  const { toast } = useToast();

  useEffect(() => {
    fetchTariffs();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('http://localhost:3000/settings/columns');
      if (response.data && response.data.value) {
        setColumns(parseInt(response.data.value, 10));
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
      toast({ title: "Erreur", description: "Impossible de charger la configuration." });
    }
  };

  const handleColumnChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColumns = parseInt(e.target.value, 10);
    if (isNaN(newColumns) || newColumns < 1 || newColumns > 6) {
        toast({ title: "Valeur invalide", description: "Le nombre de colonnes doit être entre 1 et 6." });
        return;
    }
    setColumns(newColumns);
    try {
        await axios.post('http://localhost:3000/settings', { key: 'columns', value: newColumns.toString() });
        toast({ title: "Succès", description: "Configuration mise à jour." });
    } catch (error) {
        toast({ title: "Erreur", description: "Impossible de sauvegarder la configuration." });
    }
  }

  const fetchTariffs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/tariffs');
      setTariffs(response.data);
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger les forfaits." });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (selectedTariff.id) {
        // Update existing tariff
        await axios.put(`http://localhost:3000/tariffs/${selectedTariff.id}`, selectedTariff);
        toast({ title: "Succès", description: "Forfait mis à jour." });
      } else {
        // Create new tariff
        await axios.post('http://localhost:3000/tariffs', selectedTariff);
        toast({ title: "Succès", description: "Forfait créé." });
      }
      setDialogOpen(false);
      fetchTariffs(); // Refresh the list
    } catch (error) {
      toast({ title: "Erreur", description: "L'opération a échoué." });
    }
  };

  const openDialog = (tariff?: Tariff) => {
    setSelectedTariff(tariff || emptyTariff);
    setDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSelectedTariff(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex flex-col gap-4">
        <Card>
            <CardHeader>
                <CardTitle>Configuration de l'affichage</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid sm:grid-cols-4 items-center gap-4">
                    <Label htmlFor="columns" className="sm:text-right">Colonnes sur l'accueil</Label>
                    <Input id="columns" name="columns" type="number" value={columns} onChange={handleColumnChange} className="sm:col-span-3" min="1" max="6" />
                </div>
            </CardContent>
        </Card>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
        <h1 className="text-2xl font-bold">Gestion des Forfaits</h1>
        <Button onClick={() => openDialog()} className="w-full sm:w-auto">Ajouter un forfait</Button>
      </div>

      <div className="hidden sm:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Données (Go)</TableHead>
              <TableHead>Durée (jours)</TableHead>
              <TableHead>Prix (XAF)</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center">Chargement...</TableCell></TableRow>
            ) : (
              tariffs.map((tariff) => (
                <TableRow key={tariff.id} onClick={() => openDialog(tariff)} className="cursor-pointer">
                  <TableCell>{tariff.name}</TableCell>
                  <TableCell>{(tariff.data_bytes / 1073741824).toFixed(2)}</TableCell>
                  <TableCell>{tariff.duration_seconds / 86400}</TableCell>
                  <TableCell>{tariff.price_cfa}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">Modifier</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="block sm:hidden">
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <p className="text-center">Chargement...</p>
          ) : (
            tariffs.map((tariff) => (
              <Card key={tariff.id} onClick={() => openDialog(tariff)} className="cursor-pointer">
                <CardHeader>
                  <CardTitle>{tariff.name}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Données</p>
                    <p className="font-bold">{(tariff.data_bytes / 1073741824).toFixed(2)} Go</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Durée</p>
                    <p className="font-bold">{tariff.duration_seconds / 86400} jours</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Prix</p>
                    <p className="font-bold">{tariff.price_cfa} XAF</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedTariff.id ? 'Modifier le forfait' : 'Ajouter un nouveau forfait'}</DialogTitle>
            <DialogDescription>
              Remplissez les informations ci-dessous. Cliquez sur "Enregistrer" pour sauvegarder les modifications.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="sm:text-right">Nom</Label>
              <Input id="name" name="name" value={selectedTariff.name} onChange={handleInputChange} className="sm:col-span-3" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="data_bytes" className="sm:text-right">Données (Go)</Label>
              <Input id="data_bytes" name="data_bytes" type="number" value={selectedTariff.data_bytes ? selectedTariff.data_bytes / 1073741824 : ''} onChange={(e) => setSelectedTariff(p => ({...p, data_bytes: Number(e.target.value) * 1073741824}))} className="sm:col-span-3" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="duration_seconds" className="sm:text-right">Durée (jours)</Label>
              <Input id="duration_seconds" name="duration_seconds" type="number" value={selectedTariff.duration_seconds ? selectedTariff.duration_seconds / 86400 : ''} onChange={(e) => setSelectedTariff(p => ({...p, duration_seconds: Number(e.target.value) * 86400}))} className="sm:col-span-3" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="price_cfa" className="sm:text-right">Prix (XAF)</Label>
              <Input id="price_cfa" name="price_cfa" type="number" value={selectedTariff.price_cfa} onChange={handleInputChange} className="sm:col-span-3" />
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
              <Label htmlFor="speed_limit" className="sm:text-right">Vitesse</Label>
              <Input id="speed_limit" name="speed_limit" value={selectedTariff.speed_limit || ''} onChange={handleInputChange} className="sm:col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
