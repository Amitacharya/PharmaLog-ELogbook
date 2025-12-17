import { Suspense, lazy, useTransition } from "react";
import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import { AppLayout } from "@/components/layout/AppLayout";

// Lazy load pages for faster initial load and smoother navigation
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const LogEntry = lazy(() => import("@/pages/LogEntry"));
const EquipmentMaster = lazy(() => import("@/pages/Equipment"));
const AuditTrail = lazy(() => import("@/pages/AuditTrail"));
const PreventiveMaintenance = lazy(() => import("@/pages/PreventiveMaintenance"));
const Reports = lazy(() => import("@/pages/Reports"));
const UserManagement = lazy(() => import("@/pages/UserManagement"));
const AdminConfiguration = lazy(() => import("@/pages/AdminConfiguration"));

// Simple loading fallback for pages
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-xs text-slate-500">Loading...</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <AppLayout>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/logs" component={LogEntry} />
          <Route path="/equipment" component={EquipmentMaster} />
          <Route path="/pm" component={PreventiveMaintenance} />
          <Route path="/reports" component={Reports} />
          <Route path="/users" component={UserManagement} />
          <Route path="/audit" component={AuditTrail} />
          <Route path="/admin" component={AdminConfiguration} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </AppLayout>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
          <p className="mt-2 text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      {user ? (
        <Route>
          <AppRoutes />
        </Route>
      ) : (
        <Redirect to="/login" />
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
