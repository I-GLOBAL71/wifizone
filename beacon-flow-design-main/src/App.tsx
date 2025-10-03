import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserApp from "./pages/UserApp";
import Packages from "./pages/Packages";
import Payment from "./pages/Payment";
import Success from "./pages/Success";
import Account from "./pages/Account";
import Ambassador from "./pages/Ambassador";
import Admin from "./pages/Admin";
import RedeemCode from "./pages/RedeemCode";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UserApp />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/success" element={<Success />} />
          <Route path="/account" element={<Account />} />
          <Route path="/ambassador" element={<Ambassador />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/redeem-code" element={<RedeemCode />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
