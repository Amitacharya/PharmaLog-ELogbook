import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import LogEntry from "@/pages/LogEntry";
import EquipmentMaster from "@/pages/Equipment";
import AuditTrail from "@/pages/AuditTrail";
import PreventiveMaintenance from "@/pages/PreventiveMaintenance";
import Reports from "@/pages/Reports";
import UserManagement from "@/pages/UserManagement";

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/logs" component={LogEntry} />
        <Route path="/equipment" component={EquipmentMaster} />
        <Route path="/pm" component={PreventiveMaintenance} />
        <Route path="/reports" component={Reports} />
        <Route path="/users" component={UserManagement} />
        <Route path="/audit" component={AuditTrail} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
