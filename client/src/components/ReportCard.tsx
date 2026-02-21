import { Report } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, AlertTriangle, Activity, History, CheckCircle2, Circle } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSubmitFeedback, useUpdateReportStatus, useAssignContractor } from "@/hooks/use-reports";
import { Progress } from "@/components/ui/progress";

const statusColors: Record<string, string> = {
  "Report Sent": "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  "Received": "bg-blue-100 text-blue-800 hover:bg-blue-100",
  "Admin Verified": "bg-purple-100 text-purple-800 hover:bg-purple-100",
  "Budget Allocated": "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
  "Contractor Selected": "bg-orange-100 text-orange-800 hover:bg-orange-100",
  "Work Started": "bg-cyan-100 text-cyan-800 hover:bg-cyan-100",
  "Work Completed": "bg-green-100 text-green-800 hover:bg-green-100",
  "Feedback Submitted": "bg-gray-100 text-gray-800 hover:bg-gray-100",
};

const STATUS_STEPS = [
  "Report Sent",
  "Received",
  "Admin Verified",
  "Budget Allocated",
  "Contractor Selected",
  "Work Started",
  "Work Completed"
];

const ProgressTracker = ({ currentStatus }: { currentStatus: string }) => {
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);
  const effectiveIndex = currentIndex === -1 && currentStatus === "Feedback Submitted" 
    ? STATUS_STEPS.length - 1 
    : currentIndex;

  return (
    <div className="relative flex justify-between w-full mt-4 mb-8">
      {/* Connector Line */}
      <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 -z-10" />
      <div 
        className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500 -z-10" 
        style={{ width: `${Math.max(0, (effectiveIndex / (STATUS_STEPS.length - 1)) * 100)}%` }}
      />
      
      {STATUS_STEPS.map((step, index) => {
        const isCompleted = index < effectiveIndex;
        const isCurrent = index === effectiveIndex;
        
        return (
          <div key={step} className="flex flex-col items-center gap-2">
            <div className={`
              w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white transition-colors duration-300
              ${isCompleted || isCurrent ? "border-primary" : "border-gray-300"}
              ${isCompleted ? "bg-primary text-white" : "text-gray-400"}
              ${isCurrent ? "ring-4 ring-primary/20" : ""}
            `}>
              {isCompleted ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <div className={`w-2.5 h-2.5 rounded-full ${isCurrent ? "bg-primary" : "bg-gray-300"}`} />
              )}
            </div>
            <span className={`
              text-[10px] absolute -bottom-6 text-center font-medium max-w-[60px] leading-tight
              ${isCurrent ? "text-primary font-bold" : "text-muted-foreground"}
            `}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export function ReportCard({ 
  report, 
  userRole, 
  onAssignClick 
}: { 
  report: Report; 
  userRole?: string;
  onAssignClick?: () => void;
}) {
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateReportStatus();
  const { mutate: submitFeedback, isPending: isSubmittingFeedback } = useSubmitFeedback();
  
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(5);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const handleFeedbackSubmit = () => {
    submitFeedback({ id: report.id, rating, feedback }, {
      onSuccess: () => setIsFeedbackOpen(false)
    });
  };

  const handleStatusChange = (newStatus: string) => {
    updateStatus({ id: report.id, status: newStatus });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-primary/20 hover:border-l-primary flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div>
            <Badge variant="outline" className={`${statusColors[report.status]} border-none mb-2`}>
              {report.status}
            </Badge>
            <h3 className="font-serif font-bold text-lg leading-tight">{report.complaintType}</h3>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center gap-1 font-mono text-sm font-bold px-2 py-1 rounded ${
              report.severityScore > 7 ? "bg-red-50 text-red-600" :
              report.severityScore > 4 ? "bg-yellow-50 text-yellow-600" :
              "bg-green-50 text-green-600"
            }`}>
              <Activity className="w-3 h-3" />
              {report.severityScore}/10
            </span>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase">Severity</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3 text-sm flex-1">
        <div className="flex items-center gap-2 text-muted-foreground mb-3">
          <MapPin className="w-4 h-4" />
          <span>{report.area}</span>
          <span className="mx-1">•</span>
          <Calendar className="w-4 h-4" />
          <span>{format(new Date(report.timestamp), 'MMM d, yyyy')}</span>
        </div>
        
        <p className="text-foreground/80 line-clamp-2 mb-4">{report.description}</p>
        
        {report.aiSummary && (
          <div className="bg-primary/5 p-3 rounded-md border border-primary/10 mb-4">
            <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> AI Summary
            </p>
            <p className="text-xs text-foreground/70">{report.aiSummary}</p>
          </div>
        )}

        {userRole === "citizen" && (
          <div className="py-6 border-t px-1">
            <div className="flex items-center gap-1 text-xs font-medium text-primary mb-2">
              <History className="w-3 h-3" />
              Track Progress
            </div>
            <ProgressTracker currentStatus={report.status} />
          </div>
        )}

        {report.budget && (
           <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
             <div className="bg-gray-50 p-2 rounded">
               <span className="text-muted-foreground block">Budget</span>
               <span className="font-mono font-medium">${report.budget.toLocaleString()}</span>
             </div>
             <div className="bg-gray-50 p-2 rounded">
               <span className="text-muted-foreground block">Duration</span>
               <span className="font-mono font-medium">{report.duration}</span>
             </div>
           </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex gap-2 justify-end flex-wrap border-t mt-auto p-4">
        {/* Citizen Actions */}
        {userRole === "citizen" && report.status === "Work Completed" && !report.citizenRating && (
          <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="default" className="w-full">Rate Work</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rate Completed Work</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Rating (1-5)</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <Button
                        key={r}
                        variant={rating === r ? "default" : "outline"}
                        size="icon"
                        onClick={() => setRating(r)}
                        className="w-10 h-10"
                      >
                        {r}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Feedback</Label>
                  <Textarea 
                    value={feedback} 
                    onChange={(e) => setFeedback(e.target.value)} 
                    placeholder="Was the work done satisfactorily?"
                  />
                </div>
                <Button onClick={handleFeedbackSubmit} disabled={isSubmittingFeedback} className="w-full">
                  {isSubmittingFeedback ? "Submitting..." : "Submit Rating"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Contractor Actions */}
        {userRole === "contractor" && report.status === "Contractor Selected" && (
          <Button size="sm" className="w-full" onClick={() => handleStatusChange("Work Started")} disabled={isUpdating}>
            Start Work
          </Button>
        )}
        {userRole === "contractor" && report.status === "Work Started" && (
          <Button size="sm" className="w-full" onClick={() => handleStatusChange("Work Completed")} disabled={isUpdating}>
            Complete Work
          </Button>
        )}

        {/* Admin Actions */}
        {userRole === "admin" && report.status === "Report Sent" && (
          <Button size="sm" className="w-full" onClick={() => handleStatusChange("Admin Verified")} disabled={isUpdating}>
            Verify Report
          </Button>
        )}
        {userRole === "admin" && report.status === "Admin Verified" && (
          <Button size="sm" className="w-full" onClick={() => onAssignClick && onAssignClick()}>
            Assign Contractor
          </Button>
        )}

        {userRole === "citizen" && report.status !== "Work Completed" && report.status !== "Feedback Submitted" && (
          <div className="text-[10px] text-muted-foreground italic w-full text-center mt-4">
            Blockchain secured tracking active
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
