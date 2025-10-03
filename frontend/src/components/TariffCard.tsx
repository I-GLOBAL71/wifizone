import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Tariff {
  id: string;
  name: string;
  data_bytes: number;
  duration_seconds: number;
  price_cfa: number;
  speed_limit: string | null;
}

interface TariffCardProps {
  tariff: Tariff;
  onPurchase: (tariffId: string) => void;
  theme: {
    bg: string;
    text: string;
    border: string;
  };
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const formatDuration = (seconds: number) => {
    if (seconds < 3600) return `${seconds / 60} minutes`;
    if (seconds < 86400) return `${seconds / 3600} heures`;
    return `${seconds / 86400} jours`;
}

export default function TariffCard({ tariff, onPurchase, theme }: TariffCardProps) {
  return (
    <Card className={`flex flex-col border-2 ${theme.bg} ${theme.text} ${theme.border} transition-transform duration-300 ease-in-out hover:scale-105`}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{tariff.name}</CardTitle>
        <CardDescription className={`${theme.text} opacity-80`}>{formatDuration(tariff.duration_seconds)} de validité</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-4xl font-bold">{formatBytes(tariff.data_bytes)}</p>
        {tariff.speed_limit && <p className="text-sm text-muted-foreground">Vitesse: {tariff.speed_limit}</p>}
      </CardContent>
      <CardFooter className="flex flex-col items-stretch mt-auto">
          <p className="text-2xl font-semibold self-center mb-4">{tariff.price_cfa} XAF</p>
          <Button onClick={() => onPurchase(tariff.id)} className="w-full">
              Acheter maintenant
          </Button>
      </CardFooter>
    </Card>
  );
}