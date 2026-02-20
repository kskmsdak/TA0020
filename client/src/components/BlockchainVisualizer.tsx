import { motion } from "framer-motion";
import { Link as LinkIcon, Box, CheckCircle } from "lucide-react";
import { Report } from "@shared/schema";

export function BlockchainVisualizer({ reports }: { reports: Report[] }) {
  // Sort by ID/timestamp to show chain order
  const chain = [...reports].sort((a, b) => a.id - b.id);

  if (reports.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed rounded-xl bg-gray-50/50">
        <Box className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
        <h3 className="text-lg font-medium text-muted-foreground">The chain is currently empty</h3>
        <p className="text-sm text-muted-foreground/80 mt-1">Submit the first report to start the blockchain.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-6">
      <div className="flex items-start gap-4 min-w-max px-2">
        {chain.map((block, index) => (
          <div key={block.id} className="flex items-center gap-2">
            {/* Link Connector */}
            {index > 0 && (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                className="text-primary/30"
              >
                <LinkIcon className="w-6 h-6" />
              </motion.div>
            )}

            {/* Block Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="w-72 bg-white rounded-lg border shadow-sm p-4 relative group hover:shadow-md hover:border-primary/50 transition-all"
            >
              <div className="absolute -top-3 -right-3 bg-white p-1 rounded-full shadow-sm border opacity-0 group-hover:opacity-100 transition-opacity">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>

              <div className="flex items-center justify-between mb-3 border-b pb-2">
                <span className="font-mono text-xs text-muted-foreground">Block #{block.id}</span>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono">
                  SHA-256
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Previous Hash</p>
                  <p className="font-mono text-[10px] text-gray-500 truncate" title={block.previousHash || "Genesis"}>
                    {block.previousHash || "00000000000000000000"}
                  </p>
                </div>

                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <p className="text-xs font-medium text-foreground truncate">{block.complaintType}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{block.area}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Current Hash</p>
                  <p className="font-mono text-[10px] text-primary truncate font-medium" title={block.currentHash || ""}>
                    {block.currentHash}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
