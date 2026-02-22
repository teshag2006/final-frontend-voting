import { CheckCircle2, ChevronRight, ShieldCheck } from "lucide-react";

export function TransparencySecurity() {
  const rows = [
    "Blockchain Anchored",
    "Fraud Checks Passed",
    "Continuous Integrity Monitoring",
  ];

  return (
    <div className="overflow-hidden rounded-[22px] border border-white/80 bg-white/90 shadow-[0_18px_38px_-24px_rgba(33,46,105,0.55)] backdrop-blur">
      <div className="border-b border-border/80 px-5 py-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h3 className="text-base font-bold text-foreground">
            Transparency {"&"} Security
          </h3>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-5">
        {rows.map((row) => (
          <div key={row} className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-accent" />
            <span className="text-base text-muted-foreground">{row}</span>
          </div>
        ))}

        <button className="mt-2 inline-flex items-center gap-1 self-start rounded-xl border border-border bg-white/70 px-3 py-1.5 text-base font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          Verify Vote Hash
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
