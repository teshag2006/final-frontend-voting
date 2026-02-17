import { Shield, CheckCircle2 } from "lucide-react";

export function VotingSecurityNotice() {
  return (
    <div className="rounded-2xl border border-accent/30 bg-accent/5 px-6 py-5 flex items-start gap-4">
      <Shield className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">
          <span className="font-semibold">Voting is protected by SMS verification, vote limits, fraud detection systems, and blockchain anchoring.</span>
        </p>
        
        <div className="mt-3 flex items-center gap-2 text-sm text-accent font-medium">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>Blockchain Verified</span>
        </div>
      </div>
    </div>
  );
}
