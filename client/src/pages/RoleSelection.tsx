import { useUpdateRole } from "@/hooks/use-user-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Briefcase, ShieldCheck } from "lucide-react";

export function RoleSelection() {
  const { mutate, isPending } = useUpdateRole();

  const handleSelect = (role: 'citizen' | 'contractor' | 'admin') => {
    mutate({ role });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Welcome to CivicAudit</h1>
          <p className="text-muted-foreground">Select your role to continue to the platform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:border-primary cursor-pointer transition-all hover:shadow-lg" onClick={() => handleSelect('citizen')}>
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                <User className="w-8 h-8" />
              </div>
              <CardTitle>Citizen</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              Report issues, track progress, and rate completed work. Be the eyes of your community.
            </CardContent>
          </Card>

          <Card className="hover:border-primary cursor-pointer transition-all hover:shadow-lg" onClick={() => handleSelect('contractor')}>
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
                <Briefcase className="w-8 h-8" />
              </div>
              <CardTitle>Contractor</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              Find government contracts, update work status, and build your reputation.
            </CardContent>
          </Card>

          <Card className="hover:border-primary cursor-pointer transition-all hover:shadow-lg" onClick={() => handleSelect('admin')}>
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <CardTitle>Admin</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              Verify reports, assign contracts, allocate budgets, and monitor analytics.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
