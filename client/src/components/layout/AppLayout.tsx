import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Activity, 
  ClipboardList, 
  FlaskConical,
  Menu,
  Bell,
  Search,
  User,
  Users,
  CalendarClock,
  FileBarChart,
  LogOut,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import logo from "@assets/generated_images/minimalist_pharma_logo_symbol.png";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: ClipboardList, label: "E-Log Book", href: "/logs" },
  { icon: FlaskConical, label: "Equipment Master", href: "/equipment" },
  { icon: CalendarClock, label: "Preventive Maintenance", href: "/pm" },
  { icon: FileBarChart, label: "Reports", href: "/reports" },
  { icon: Users, label: "User Management", href: "/users" },
  { icon: Activity, label: "Audit Trail", href: "/audit" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [role, setRole] = useState("Operator");

  // Persist role for demo purposes
  useEffect(() => {
    const savedRole = localStorage.getItem("demo-role");
    if (savedRole) setRole(savedRole);
  }, []);

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    localStorage.setItem("demo-role", newRole);
    window.location.reload(); // Simple reload to "refresh" permissions view
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-0 bg-slate-900 text-slate-100">
      <div className="flex h-16 items-center border-b border-slate-800 px-6">
        <Link href="/" className="flex items-center gap-3 font-display font-bold text-xl tracking-tight">
          <div className="bg-blue-600 p-1 rounded-sm">
             <img src={logo} alt="PharmaLog" className="h-6 w-6 brightness-0 invert" />
          </div>
          <span>PharmaLog<span className="text-blue-500">.io</span></span>
        </Link>
      </div>
      
      <div className="px-4 py-6">
        <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Core Modules
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  location === item.href
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto border-t border-slate-800 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-3 ring-1 ring-slate-700">
          <Avatar className="h-9 w-9 border border-slate-600">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback className="bg-slate-700 text-slate-300">JD</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium text-slate-200">John Doe</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
              <span className="truncate text-xs text-slate-400">{role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 bg-slate-900 lg:block fixed h-full z-30 shadow-xl">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-screen transition-all">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-slate-600">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-slate-900 border-r-slate-800">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                {navItems.find((i) => i.href === location)?.label || "Dashboard"}
              </h1>
              <span className="text-xs text-slate-500 hidden md:block">
                GMP Compliant System • v2.4.1
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center mr-4">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 mr-2">
                System Active
              </Badge>
              <span className="text-xs font-mono text-slate-400">
                {new Date().toISOString().split('T')[0]} UTC
              </span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Switch Role ({role})</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Simulate User Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={role} onValueChange={handleRoleChange}>
                  <DropdownMenuRadioItem value="Operator">Operator</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Supervisor">Supervisor</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="QA">Quality Assurance (QA)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Admin">System Admin</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8 bg-slate-50/50">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
