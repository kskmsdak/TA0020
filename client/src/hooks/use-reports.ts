import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import {
  InsertReport,
  UpdateReportStatusRequest,
  AssignContractorRequest,
  SubmitFeedbackRequest,
  GenerateReportRequest,
  Report
} from "@shared/schema";

// --- Queries ---

export function useReports() {
  return useQuery({
    queryKey: [api.reports.list.path],
    queryFn: async () => {
      const res = await fetch(api.reports.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch reports");
      return await res.json();
    },
  });
}

export function useMyReports() {
  return useQuery({
    queryKey: [api.reports.listMyReports.path],
    queryFn: async () => {
      const res = await fetch(api.reports.listMyReports.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch my reports");
      return await res.json();
    },
  });
}

export function useAvailableContracts() {
  return useQuery({
    queryKey: [api.reports.listAvailableContracts.path],
    queryFn: async () => {
      const res = await fetch(api.reports.listAvailableContracts.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch contracts");
      return await res.json();
    },
  });
}

export function useReport(id: number) {
  return useQuery({
    queryKey: [api.reports.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.reports.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch report");
      return await res.json();
    },
    enabled: !!id,
  });
}

export function useBlockchainVerification() {
  return useQuery({
    queryKey: [api.reports.verifyBlockchain.path],
    queryFn: async () => {
      const res = await fetch(api.reports.verifyBlockchain.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to verify blockchain");
      return await res.json();
    },
  });
}

// --- Mutations ---

export function useCreateReport() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertReport) => {
      const res = await fetch(api.reports.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create report");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reports.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.reports.listMyReports.path] });
      toast({ title: "Report Submitted", description: "Your report has been added to the blockchain." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
}

export function useGenerateAiReport() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: GenerateReportRequest) => {
      // Note: mapping 'chatContext' to 'prompt' to match API schema if needed,
      // but schema says input is { prompt: z.string() }
      const res = await fetch(api.reports.generateAi.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: data.chatContext }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("AI Generation failed");
      return await res.json();
    },
    onError: (err) => {
      toast({ title: "AI Error", description: err.message, variant: "destructive" });
    }
  });
}

export function useUpdateReportStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number } & UpdateReportStatusRequest) => {
      const url = buildUrl(api.reports.updateStatus.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update status");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reports.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.reports.listAvailableContracts.path] });
      queryClient.invalidateQueries({ queryKey: [api.reports.listMyReports.path] });
      toast({ title: "Status Updated", description: "The report status has been updated." });
    },
  });
}

export function useAssignContractor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & AssignContractorRequest) => {
      const url = buildUrl(api.reports.assignContractor.path, { id });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to assign contractor");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reports.list.path] });
      toast({ title: "Contractor Assigned", description: "Work has been assigned successfully." });
    },
  });
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & SubmitFeedbackRequest) => {
      const url = buildUrl(api.reports.submitFeedback.path, { id });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit feedback");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reports.listMyReports.path] });
      toast({ title: "Feedback Submitted", description: "Thank you for rating the work." });
    },
  });
}
