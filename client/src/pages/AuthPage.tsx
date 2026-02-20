import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export default function AuthPage() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Branding */}
      <div className="bg-primary p-8 lg:p-12 flex flex-col justify-between text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] opacity-10 bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-blue-900 opacity-90" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 font-serif font-bold text-2xl">
            <ShieldCheck className="w-8 h-8" />
            CivicAudit
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="font-serif text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Transparent Governance Powered by AI & Blockchain
          </h1>
          <p className="text-blue-100 text-lg">
            Empowering citizens to report issues, tracking funds immutably, and ensuring accountability in public works.
          </p>
        </div>

        <div className="relative z-10 text-sm text-blue-200">
          © 2025 CivicAudit Platform. All rights reserved.
        </div>
      </div>

      {/* Right: Login CTA */}
      <div className="bg-white p-8 lg:p-12 flex flex-col justify-center items-center">
        <div className="w-full max-w-sm space-y-8 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-serif font-bold text-gray-900">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to access your dashboard</p>
          </div>

          <Button 
            size="lg" 
            className="w-full text-base h-12 shadow-xl shadow-primary/20" 
            onClick={handleLogin}
          >
            Log In or Sign Up
          </Button>

          <div className="grid grid-cols-3 gap-4 text-center text-xs text-muted-foreground pt-8">
             <div>
               <div className="font-bold text-gray-900 text-lg mb-1">AI</div>
               Assisted Reports
             </div>
             <div>
               <div className="font-bold text-gray-900 text-lg mb-1">100%</div>
               Transparent Ledger
             </div>
             <div>
               <div className="font-bold text-gray-900 text-lg mb-1">Secure</div>
               Blockchain Record
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
