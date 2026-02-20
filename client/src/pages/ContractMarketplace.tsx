import { useAvailableContracts } from "@/hooks/use-reports";
import { Loader2, Briefcase, MapPin, DollarSign, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAssignContractor } from "@/hooks/use-reports"; // Just to get accept logic if needed

export default function ContractMarketplace() {
  const { data: contracts, isLoading } = useAvailableContracts();
  
  // Note: Accepting a contract logic would ideally be a separate mutation like 'acceptContract'
  // But for this hackathon scope, let's assume contractors are assigned by Admin,
  // or they just 'apply' which sends a notification.
  // For visual completeness, I'll add an 'Apply' button.

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-gray-900">Civic Contract Marketplace</h1>
        <p className="text-muted-foreground mt-1">
          Browse and apply for government allocated projects.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contracts?.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed">
            <p className="text-muted-foreground">No open contracts available at the moment.</p>
          </div>
        ) : (
          contracts?.map((contract) => (
            <Card key={contract.id} className="hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <Badge variant="secondary" className="w-fit mb-2">Open for Bids</Badge>
                <h3 className="font-serif font-bold text-lg">{contract.complaintType}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {contract.area}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="line-clamp-2 text-foreground/80">{contract.description}</p>
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-green-50 p-2 rounded border border-green-100">
                    <span className="text-xs text-green-700 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Budget
                    </span>
                    <span className="font-mono font-medium block mt-1">
                      ${contract.budget?.toLocaleString() || "TBD"}
                    </span>
                  </div>
                  <div className="bg-blue-50 p-2 rounded border border-blue-100">
                    <span className="text-xs text-blue-700 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Duration
                    </span>
                    <span className="font-mono font-medium block mt-1">
                      {contract.duration || "Flexible"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Required Skills</span>
                  <div className="flex flex-wrap gap-1">
                    {contract.requiredSkills?.split(',').map(skill => (
                      <span key={skill} className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700 border">
                        {skill.trim()}
                      </span>
                    )) || <span className="text-xs text-muted-foreground">General</span>}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full gap-2">
                  <Briefcase className="w-4 h-4" /> Apply for Contract
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
