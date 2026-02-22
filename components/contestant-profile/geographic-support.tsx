import { Globe, CheckCircle2 } from "lucide-react";
import type { GeographicSupport as GeographicSupportType } from "@/types/contestant";

interface GeographicSupportProps {
  data: GeographicSupportType;
}

export function GeographicSupport({ data }: GeographicSupportProps) {
  return (
    <div className="overflow-hidden rounded-[22px] border border-white/80 bg-white/90 shadow-[0_18px_38px_-24px_rgba(33,46,105,0.55)] backdrop-blur">
      <div className="border-b border-border/80 px-5 py-4">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h3 className="text-base font-bold text-foreground">
            Geographic Support
          </h3>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-5">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
          <span className="text-base text-muted-foreground">
            Regional activity verified
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-accent shrink-0" />
          <span className="text-base text-muted-foreground">
            Trust Score:{" "}
            <span className="font-semibold text-foreground">
              {data.trust_score}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
