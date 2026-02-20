import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Report } from "@shared/schema";
import { useAssignContractor } from "@/hooks/use-reports";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function AssignContractorDialog({ 
  report, 
  open, 
  onOpenChange 
}: { 
  report: Report | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
}) {
  const { mutate, isPending } = useAssignContractor();
  const { register, handleSubmit, reset } = useForm();

  // In a real app, we would fetch a list of contractors here to populate a select dropdown.
  // For this hackathon version, we might just enter an ID or simulate it.
  // Or better, fetch users with role='contractor'. 
  // To keep it simple as per instructions, let's just input budget/duration details
  // and maybe a contractor ID text field (mocked).

  const onSubmit = (data: any) => {
    if (!report) return;
    
    mutate({
      id: report.id,
      contractorId: "2", // Hardcoding a demo contractor ID or taking from input
      budget: Number(data.budget),
      duration: data.duration,
      requiredSkills: data.requiredSkills
    }, {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      }
    });
  };

  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Contractor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Budget Allocation ($)</Label>
            <Input type="number" {...register("budget", { required: true })} placeholder="5000" />
          </div>
          <div className="space-y-2">
            <Label>Estimated Duration</Label>
            <Input {...register("duration", { required: true })} placeholder="2 weeks" />
          </div>
          <div className="space-y-2">
            <Label>Required Skills</Label>
            <Input {...register("requiredSkills", { required: true })} placeholder="Road repair, heavy machinery" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Assigning..." : "Assign & Allocate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
