import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import MedicationsList from "@/pages/medications/index";
import MedicationDetail from "@/pages/medications/detail";
import ProfilesList from "@/pages/profiles/index";
import ProfileDetail from "@/pages/profiles/detail";
import SimulationsList from "@/pages/simulations/index";
import SimulationDetail from "@/pages/simulations/detail";
import Simulate from "@/pages/simulate/index";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/medications" component={MedicationsList} />
      <Route path="/medications/:id" component={MedicationDetail} />
      <Route path="/profiles" component={ProfilesList} />
      <Route path="/profiles/:id" component={ProfileDetail} />
      <Route path="/simulations" component={SimulationsList} />
      <Route path="/simulations/:id" component={SimulationDetail} />
      <Route path="/simulate" component={Simulate} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;