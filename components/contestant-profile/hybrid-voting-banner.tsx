import { CheckCircle2, Shield, Phone, Globe } from "lucide-react";

export function HybridVotingBanner() {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-accent" />
        <h3 className="text-base font-bold text-foreground">
          Voting Fairness Rules
        </h3>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
        {/* Ethiopian voters */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              Ethiopian Voters
            </span>
          </div>
          <ul className="flex flex-col gap-1.5 pl-6">
            <li className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
              1 FREE vote per event (SMS verified)
            </li>
            <li className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
              Paid votes allowed with limits
            </li>
          </ul>
        </div>

        {/* International voters */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              International Voters
            </span>
          </div>
          <ul className="flex flex-col gap-1.5 pl-6">
            <li className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
              Paid votes only
            </li>
            <li className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
              Vote limits apply
            </li>
          </ul>
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground italic border-t border-border pt-3">
        Vote limits are enforced to prevent manipulation and ensure fair competition.
      </p>
    </section>
  );
}
