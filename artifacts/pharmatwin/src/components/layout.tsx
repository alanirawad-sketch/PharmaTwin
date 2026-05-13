import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Activity,
  Pill,
  Users,
  BarChart,
  PlayCircle,
  LayoutDashboard,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { useHealthCheck } from "@workspace/api-client-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: health, isError } = useHealthCheck();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/medications", label: "Medications", icon: Pill },
    { href: "/profiles", label: "Patient Profiles", icon: Users },
    { href: "/simulations", label: "Simulations", icon: BarChart },
    { href: "/simulate", label: "Run Simulation", icon: PlayCircle },
  ];

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Activity className="h-6 w-6 text-primary mr-2" />
          <span className="font-bold text-lg tracking-tight text-card-foreground">PharmaTwin</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer group",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground"
                    )}
                  />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border space-y-4">
          <div className="flex items-center text-xs text-muted-foreground bg-muted/30 p-2 rounded">
            {isError ? (
              <><XCircle className="w-3 h-3 mr-2 text-destructive" /> System Offline</>
            ) : health ? (
              <><CheckCircle2 className="w-3 h-3 mr-2 text-primary" /> API Online</>
            ) : (
              <><Activity className="w-3 h-3 mr-2 text-muted-foreground animate-pulse" /> Checking...</>
            )}
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
              AD
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-foreground">Admin User</p>
              <p className="text-xs text-muted-foreground">Clinical Research</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="h-16 border-b border-border bg-card flex items-center justify-between px-8 md:hidden">
          <div className="flex items-center">
            <Activity className="h-6 w-6 text-primary mr-2" />
            <span className="font-bold text-lg tracking-tight text-card-foreground">PharmaTwin</span>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-background p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}