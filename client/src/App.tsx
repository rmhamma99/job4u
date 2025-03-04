import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Switch, Route } from "wouter";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import JobsPage from "@/pages/jobs-page";
import ProfilePage from "@/pages/profile-page";
import NotFound from "@/pages/not-found";
import Navigation from "@/components/navigation";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/jobs" component={JobsPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Router />
        </main>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
