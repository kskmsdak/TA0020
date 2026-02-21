import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export default function AuthPage() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl border shadow-lg text-center space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div className="bg-primary/10 p-4 rounded-full">
            <ShieldCheck className="w-12 h-12 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">CivicAudit</h1>
            <p className="text-muted-foreground">Blockchain Transparency Platform</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-medium text-gray-700">Welcome Back</h2>
          <p className="text-sm text-muted-foreground">Please sign in with your Replit account to access the dashboard.</p>
          <Button 
            size="lg" 
            className="w-full text-base h-12 shadow-md hover:shadow-lg transition-all" 
            onClick={handleLogin}
          >
            Continue to Login
          </Button>
        </div>

        <div className="pt-6 border-t grid grid-cols-3 gap-2 text-[10px] text-muted-foreground uppercase tracking-widest">
          <div className="font-semibold">Secure</div>
          <div className="font-semibold">Transparent</div>
          <div className="font-semibold">Immutable</div>
        </div>
      </div>
    </div>
  );
}
