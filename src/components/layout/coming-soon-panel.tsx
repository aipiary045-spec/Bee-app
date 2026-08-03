import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { env } from "@/lib/env";

interface FeaturePreview {
  title: string;
  description: string;
}

interface ComingSoonPanelProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features: FeaturePreview[];
}

export function ComingSoonPanel({
  icon: Icon,
  title,
  description,
  features,
}: ComingSoonPanelProps) {
  const connected = env.isSupabaseConfigured();

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="relative overflow-hidden lg:col-span-2">
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-honey-200/40 blur-2xl" />
        <CardHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-honey-500/15 ring-1 ring-honey-400/30">
            <Icon className="h-6 w-6 text-honey-700" />
          </div>
          <CardTitle>{title}</CardTitle>
          <p className="text-sm leading-relaxed text-hive-600">{description}</p>
        </CardHeader>
        <CardContent>
          <Badge variant={connected ? "success" : "muted"}>
            {connected ? "Supabase connected — live data coming next" : "Connect Supabase to enable"}
          </Badge>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:col-span-3">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-hive-600">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
