import { Badge } from "@/components/ui/badge";
import { originLabel } from "@/lib/data";

export function OriginBadge({ origin }: { origin: string }) {
  const variant = origin === "official" ? "default" : origin === "supplementary" ? "secondary" : "outline";
  return <Badge variant={variant}>{originLabel[origin] ?? origin}</Badge>;
}
