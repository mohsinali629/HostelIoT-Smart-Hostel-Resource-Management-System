import { Switch, Route, Router as WouterRouter } from "wouter";
  import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
  import { Toaster } from "@/components/ui/toaster";
  import { TooltipProvider } from "@/components/ui/tooltip";
  import { AuthProvider, useAuth } from "@/context/AuthContext";
  import Layout from "@/components/Layout";
  import Home from "@/pages/Home";
  import Login from "@/pages/Login";
  import Dashboard from "@/pages/Dashboard";
  import WaterTank from "@/pages/WaterTank";
  import WaterChiller from "@/pages/WaterChiller";
  import Lights from "@/pages/Lights";
  import Power from "@/pages/Power";
  import Logs from "@/pages/Logs";
  import PageNotFound from "@/pages/PageNotFound";
  // import NotFound from "@/pages/not-found";
  import { useLocation } from "wouter";
  import { useEffect } from "react";

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: 1, staleTime: 5000 },
    },
  });

  function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
    const { user, isLoading } = useAuth();
    const [, setLocation] = useLocation();

    useEffect(() => {
      if (!isLoading && !user) {
        setLocation("/login");
      }
    }, [user, isLoading, setLocation]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }

    if (!user) return null;

    return (
      <Layout>
        <Component />
      </Layout>
    );
  }

  function Router() {
    return (
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/dashboard">{() => <ProtectedRoute component={Dashboard} />}</Route>
        <Route path="/water-tank">{() => <ProtectedRoute component={WaterTank} />}</Route>
        <Route path="/water-chiller">{() => <ProtectedRoute component={WaterChiller} />}</Route>
        <Route path="/lights">{() => <ProtectedRoute component={Lights} />}</Route>
        <Route path="/power">{() => <ProtectedRoute component={Power} />}</Route>
        <Route path="/logs">{() => <ProtectedRoute component={Logs} />}</Route>
        <Route path="*">{() => <PageNotFound />}</Route>
      </Switch>
    );
  }

  function App() {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <WouterRouter base="">
              <Router />
            </WouterRouter>
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  export default App;
  