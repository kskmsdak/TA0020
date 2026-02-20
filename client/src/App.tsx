import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentUser } from "@/hooks/use-user-profile";
import { Layout } from "@/components/Layout";
import { Loader2 } from "lucide-react";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import CreateReport from "@/pages/CreateReport";
import PublicLedger from "@/pages/PublicLedger";
import ContractMarketplace from "@/pages/ContractMarketplace";
import { RoleSelection } from "@/pages/RoleSelection";

function AuthenticatedApp() {
  const { data: userProfile, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // If user is authenticated but has no role yet (first time login)
  if (!userProfile?.profile?.role) {
    return <RoleSelection />;
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/create-report" component={CreateReport} />
        <Route path="/public-ledger" component={PublicLedger} />
        <Route path="/contracts" component={ContractMarketplace} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
