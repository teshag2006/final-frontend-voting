import { ShieldCheck, CheckCircle2, ChevronRight } from "lucide-react";

export function TransparencySecurity() {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-base font-bold text-foreground">
          Transparency {"&"} Security
        </h3>
      </div>

      <div className="p-5 flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
          <span className="text-sm text-muted-foreground">
            Blockchain Anchored
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
          <span className="text-sm text-muted-foreground">
            Trust Score: <span className="font-semibold text-foreground">Excellent</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
          <span className="text-sm text-muted-foreground">
            Blockchain Anchored
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
          <span className="text-sm text-muted-foreground">
            Velocity Checks Clean
          </span>
        </div>

        <button className="mt-2 inline-flex items-center gap-1 self-start rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          Verify Vote Hash
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
