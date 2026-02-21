import { useForm } from "react-hook-form";
import { useCreateReport, useGenerateAiReport } from "@/hooks/use-reports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CreateReport() {
  const [, setLocation] = useLocation();
  const { mutate: createReport, isPending: isCreating } = useCreateReport();
  const { mutate: generateAi, isPending: isGenerating } = useGenerateAiReport();

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      area: "",
      complaintType: "",
      description: "",
      estimatedImpact: "",
      fundMisuseEstimate: ""
    }
  });

  const [aiPrompt, setAiPrompt] = useState("");

  const onAiAssist = () => {
    if (!aiPrompt.trim()) return;
    generateAi({ chatContext: aiPrompt }, {
      onSuccess: (data) => {
        setValue("area", data.area);
        setValue("complaintType", data.complaintType);
        setValue("description", data.description);
        setValue("estimatedImpact", data.estimatedImpact);
        if (data.fundMisuseEstimate) setValue("fundMisuseEstimate", data.fundMisuseEstimate);
      }
    });
  };

  const onSubmit = (data: any) => {
    // Ensure all required fields are strings and trimmed
    const reportData = {
      area: String(data.area || "").trim(),
      complaintType: String(data.complaintType || "").trim(),
      description: String(data.description || "").trim(),
      estimatedImpact: String(data.estimatedImpact || "").trim(),
      fundMisuseEstimate: data.fundMisuseEstimate ? String(data.fundMisuseEstimate).trim() : null
    };

    if (!reportData.area || !reportData.complaintType || !reportData.description || !reportData.estimatedImpact) {
      return;
    }

    createReport(reportData, {
      onSuccess: () => setLocation("/")
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <Link href="/">
        <Button variant="ghost" className="mb-4 pl-0 gap-2 hover:bg-transparent hover:text-primary">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-gray-900">New Civic Report</h1>
        <p className="text-muted-foreground mt-2">
          Submit a new issue to the blockchain ledger. You can fill the form manually or use our AI assistant.
        </p>
      </div>

      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> AI Assistant
          </TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-6">
          <Card className="border-primary/20 shadow-md">
            <CardContent className="pt-6">
              <Label className="text-lg font-medium mb-2 block">Tell us what happened</Label>
              <Textarea
                placeholder="E.g., There is a huge pothole on Main Street near the school. It's causing traffic jams and looks dangerous for kids."
                className="min-h-[150px] text-base mb-4"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              <Button 
                onClick={onAiAssist} 
                disabled={isGenerating || !aiPrompt.trim()} 
                className="w-full h-12 text-lg bg-gradient-to-r from-primary to-primary/90"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-50 px-2 text-muted-foreground">Then review below</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="manual">
          {/* Just empty content, form is always visible below */}
        </TabsContent>
      </Tabs>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-xl border shadow-sm mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Area / Ward</Label>
            <Input {...register("area", { required: true })} placeholder="e.g. North Ward" />
          </div>
          <div className="space-y-2">
            <Label>Complaint Type</Label>
            <Input {...register("complaintType", { required: true })} placeholder="e.g. Broken Road" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea 
            {...register("description", { required: true })} 
            placeholder="Detailed description of the issue..." 
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Estimated Impact</Label>
          <Input {...register("estimatedImpact", { required: true })} placeholder="High traffic area, safety risk" />
        </div>

        <div className="space-y-2">
          <Label>Potential Fund Misuse Estimate (Optional)</Label>
          <Input {...register("fundMisuseEstimate")} placeholder="e.g. $5000 wasted" />
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isCreating}>
          {isCreating ? "Submitting to Blockchain..." : "Submit Report"}
        </Button>
      </form>
    </div>
  );
}
