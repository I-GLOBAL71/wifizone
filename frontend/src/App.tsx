import { Outlet } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BackgroundEffects from '@/components/BackgroundEffects';
import { AuthProvider } from './hooks/use-auth';
import Footer from './components/Footer';
import Header from './components/Header';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <div className="bg-background text-foreground">
            <BackgroundEffects />
            <main className="relative z-10 flex min-h-screen flex-col">
              <Header />
              <div className="flex-1 pb-20 pt-20">
                <Outlet />
              </div>
              <Toaster />
              <Sonner />
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
