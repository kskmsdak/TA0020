import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// We need to define the type for the updateRole input manually or import
const updateRoleSchema = z.object({ role: z.enum(['citizen', 'contractor', 'admin']) });
type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

export function useCurrentUser() {
  return useQuery({
    queryKey: [api.users.me.path],
    queryFn: async () => {
      const res = await fetch(api.users.me.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return api.users.me.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateRoleInput) => {
      const res = await fetch(api.users.updateRole.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update role");
      return api.users.updateRole.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.me.path] });
      toast({ title: "Profile Updated", description: "Your role has been set." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
}
