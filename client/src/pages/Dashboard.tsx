import { useCurrentUser } from "@/hooks/use-user-profile";
import { useReports, useMyReports } from "@/hooks/use-reports";
import { ReportCard } from "@/components/ReportCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Plus, Loader2 } from "lucide-react";
import { AssignContractorDialog } from "@/components/AssignContractorDialog";
import { useState } from "react";
import { Report } from "@shared/schema";
import { AdminAnalytics } from "@/components/AdminAnalytics";

export default function Dashboard() {
  const { data: userData, isLoading: isUserLoading } = useCurrentUser();
  const role = userData?.profile?.role;

  // Fetch different data based on role
  const { data: allReports, isLoading: isAllLoading } = useReports();
  const { data: myReports, isLoading: isMyLoading } = useMyReports();

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isLoading = role === "citizen" ? isMyLoading : isAllLoading;
  const reports = role === "citizen" ? myReports : allReports;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Contractor View - specialized logic maybe? 
  // For simplicity, dashboard shows "My Jobs" for contractor if we filter properly backend side.
  // Assuming 'myReports' returns assigned jobs for contractors.

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">
            {role === "admin" ? "Admin Dashboard" : 
             role === "contractor" ? "Contractor Workspace" : 
             "My Reports"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {role === "admin" ? "Overview of all civic issues and performance" : 
             role === "contractor" ? "Manage your active contracts" : 
             "Track the status of your submitted complaints"}
          </p>
        </div>
        
        {role === "citizen" && (
          <Link href="/create-report">
            <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
              <Plus className="w-4 h-4" />
              New Report
            </Button>
          </Link>
        )}
        
        {role === "contractor" && (
           <Link href="/contracts">
             <Button variant="outline" className="gap-2">
               Browse Open Contracts
             </Button>
           </Link>
        )}
      </div>

      {role === "admin" && reports && (
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-serif font-semibold mb-6">Analytics Overview</h2>
          <AdminAnalytics reports={reports} />
        </div>
      )}

      <div>
        <h2 className="text-xl font-serif font-semibold mb-4">
          {role === "admin" ? "Recent Reports" : "Active Items"}
        </h2>
        
        {reports?.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed">
            <p className="text-muted-foreground">No reports found.</p>
            {role === "citizen" && (
              <Link href="/create-report" className="text-primary font-medium hover:underline mt-2 inline-block">
                Submit your first report
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {reports?.map((report: Report) => (
              <ReportCard 
                key={report.id} 
                report={report} 
                userRole={role}
                onAssignClick={() => setSelectedReport(report)}
              />
            ))}
          </div>
        )}
      </div>

      <AssignContractorDialog 
        report={selectedReport} 
        open={!!selectedReport} 
        onOpenChange={(open) => !open && setSelectedReport(null)} 
      />
    </div>
  );
}
