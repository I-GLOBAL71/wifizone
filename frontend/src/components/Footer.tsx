import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-50">
      <div className="container mx-auto flex items-center justify-center gap-2">
        <Button variant="outline" onClick={() => navigate('/redeem-code')} className="flex-1">
          Utiliser un code
        </Button>
        <Button onClick={() => navigate('/ambassador')} className="flex-1">
          Devenir Ambassadeur
        </Button>
      </div>
    </footer>
  );
}