import { useReports, useBlockchainVerification } from "@/hooks/use-reports";
import { BlockchainVisualizer } from "@/components/BlockchainVisualizer";
import { Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PublicLedger() {
  const { data: reports, isLoading } = useReports();
  const { data: verification, refetch, isFetching: isVerifying } = useBlockchainVerification();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Public Transparency Ledger</h1>
          <p className="text-muted-foreground mt-1">
            Immutable record of all civic complaints and resolutions. Verified by SHA-256 hash chaining.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => refetch()} 
          disabled={isVerifying}
          className="gap-2"
        >
          {isVerifying ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-green-600" />
          )}
          Verify Integrity
        </Button>
      </div>

      {verification && (
        <div className={`p-4 rounded-lg border flex items-center gap-3 ${
          verification.isValid 
            ? "bg-green-50 border-green-200 text-green-800" 
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {verification.isValid ? (
            <ShieldCheck className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          <div>
            <p className="font-semibold">
              {verification.isValid ? "Blockchain Integrity Verified" : "Tampering Detected"}
            </p>
            {!verification.isValid && (
              <p className="text-sm mt-1">
                Invalid blocks found at indices: {verification.invalidBlocks.join(", ")}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="bg-gray-50/50 p-6 rounded-xl border">
        <BlockchainVisualizer reports={reports || []} />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-serif font-bold mb-4">Raw Ledger Data</h2>
        <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-medium text-muted-foreground">Block ID</th>
                <th className="p-4 font-medium text-muted-foreground">Timestamp</th>
                <th className="p-4 font-medium text-muted-foreground">Type</th>
                <th className="p-4 font-medium text-muted-foreground">Area</th>
                <th className="p-4 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reports?.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-mono">#{report.id}</td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(report.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4 font-medium">{report.complaintType}</td>
                  <td className="p-4">{report.area}</td>
                  <td className="p-4">
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full font-medium">
                      {report.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
