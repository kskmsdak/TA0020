import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentUser } from "@/hooks/use-user-profile";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  LogOut,
  ShieldCheck,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { logout } = useAuth();
  const { data: userData } = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);

  const role = userData?.profile?.role;

  const NavLink = ({ href, icon: Icon, children }: { href: string; icon: any; children: ReactNode }) => {
    const isActive = location === href;
    return (
      <Link href={href} className={`
        flex items-center gap-3 px-4 py-2 rounded-md transition-colors font-medium
        ${isActive 
          ? "bg-primary text-primary-foreground" 
          : "text-muted-foreground hover:bg-muted hover:text-foreground"}
      `}
      onClick={() => setIsOpen(false)}
      >
        <Icon className="w-5 h-5" />
        {children}
      </Link>
    );
  };

  const navContent = (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-2xl font-serif font-bold text-primary flex items-center gap-2">
          <ShieldCheck className="w-8 h-8" />
          CivicAudit
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Blockchain Transparency</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <NavLink href="/" icon={LayoutDashboard}>Dashboard</NavLink>
        
        {role === "citizen" && (
          <NavLink href="/create-report" icon={FileText}>Create Report</NavLink>
        )}
        
        {role === "contractor" && (
          <NavLink href="/contracts" icon={Briefcase}>Find Contracts</NavLink>
        )}
        
        <NavLink href="/public-ledger" icon={ShieldCheck}>Public Ledger</NavLink>
      </nav>

      <div className="p-4 border-t">
        <div className="mb-4 px-2">
          <p className="font-medium truncate">{userData?.user?.email}</p>
          <p className="text-xs text-muted-foreground capitalize">{role || "No Role"}</p>
        </div>
        <Button variant="outline" className="w-full justify-start gap-2" onClick={() => logout()}>
          <LogOut className="w-4 h-4" />
          Log Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-white border-r fixed inset-y-0 z-10">
        {navContent}
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b z-20 flex items-center justify-between px-4">
        <div className="font-serif font-bold text-xl flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          CivicAudit
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            {navContent}
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
